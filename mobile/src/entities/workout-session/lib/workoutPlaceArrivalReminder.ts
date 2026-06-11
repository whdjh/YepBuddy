import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { Alert, Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"
import {
  evaluateGymArrivalPolicy,
  evaluateGymExitPolicy,
  type GymLocationSample,
  type GymPlaceContext,
  type GymPolicyInput,
} from "./gymLocationPolicy"
import {
  ensureWorkoutPlaceArrivalNotificationChannel,
  WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID,
} from "./notificationChannels"
import {
  appendGymLocationPolicySample,
  getGymLocationPolicyContexts,
  getGymLocationPolicyCooldowns,
  getGymLocationPolicySamples,
  saveGymLocationPolicyCooldowns,
} from "../model/gymLocationPolicyStorage"
import { loadCurrentWorkoutSnapshot } from "../model/sessionStorage"
import {
  getWorkoutPlaceReminderEnabled,
  getWorkoutPlaceReminderGeofencePlaces,
  getWorkoutPlaceReminderPlaces,
  getWorkoutPlaceReminderSyncStatus,
  savePendingWorkoutPlaceReminderPrompt,
  saveWorkoutPlaceReminderSyncEvent,
  saveWorkoutPlaceReminderSyncStatus,
  setWorkoutPlaceReminderEnabled,
  type WorkoutPlaceReminderPlace,
  type WorkoutPlaceReminderSyncStatusReason,
} from "../model/workoutPlaceReminderStorage"
import type { WorkoutState } from "../model/workoutState"

export const WORKOUT_PLACE_ARRIVAL_TASK_NAME =
  "yb-workout-place-arrival-reminder"
export const WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE =
  "workout-place-arrival"
export const WORKOUT_PLACE_EXIT_REMINDER_NOTIFICATION_TYPE =
  "workout-place-exit-reminder"

const GEOFENCE_RADIUS_METERS = 150
const POLICY_SAMPLE_MAX_NEAREST_DISTANCE_M = 300
const POLICY_SAMPLE_AMBIGUOUS_DISTANCE_DELTA_M = 35
const POLICY_SAMPLE_AMBIGUOUS_DISTANCE_RATIO = 1.25
const handledResponseIds = new Set<string>()

/** 동기화 옵션 */
type SyncWorkoutPlaceArrivalReminderOptions = {
  allowPrompt: boolean
}

/** Geofence task 데이터 */
interface GeofencingTaskData {
  eventType: Location.GeofencingEventType
  region: Location.LocationRegion
}

/** 장소 알림 권한 상태 */
interface WorkoutPlaceArrivalPermissionState {
  granted: boolean
  notificationGranted: boolean
  foregroundLocationGranted: boolean
  backgroundLocationGranted: boolean
}

/** 권한 거부 기본값 */
const deniedPermissions: WorkoutPlaceArrivalPermissionState = {
  backgroundLocationGranted: false,
  foregroundLocationGranted: false,
  granted: false,
  notificationGranted: false,
}

/** policy 평가에서 쓰는 active workout 스냅샷 phase인지 확인 */
function isGymPolicyWorkoutPhase(
  value: unknown,
): value is GymPolicyInput["activeWorkout"]["phase"] {
  return (
    value === "idle" ||
    value === "countdown" ||
    value === "recording" ||
    value === "paused" ||
    value === "completed"
  )
}

/** 위치 권한 허용 여부 */
function isPermissionGranted(status: { status: string; granted?: boolean }) {
  return status.granted === true || status.status === "granted"
}

/** 알림 권한 허용 여부 */
function isNotificationPermissionGranted(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

/** 자동 geofence 경로에서는 권한 프롬프트 없이 현재 권한으로만 위치를 1회 조회 */
async function getCurrentLocationWithoutPrompt() {
  const foregroundPermission = await Location.getForegroundPermissionsAsync()
  if (!isPermissionGranted(foregroundPermission)) {
    return null
  }

  try {
    return await Location.getCurrentPositionAsync({})
  } catch {
    return null
  }
}

/** 저장된 운동 스냅샷을 policy 입력에 필요한 최소 형태로 정규화 */
async function getGymPolicyActiveWorkout(): Promise<
  GymPolicyInput["activeWorkout"]
> {
  const snapshot = await loadCurrentWorkoutSnapshot<Partial<WorkoutState>>()
  const phase = isGymPolicyWorkoutPhase(snapshot?.phase)
    ? snapshot.phase
    : "idle"
  const location =
    snapshot?.location &&
    isValidCoordinates(snapshot.location.lat, snapshot.location.lng)
      ? snapshot.location
      : null

  return {
    location,
    phase,
    sessionId:
      typeof snapshot?.sessionId === "string" ? snapshot.sessionId : null,
    startedAt:
      typeof snapshot?.startedAt === "string" ? snapshot.startedAt : null,
  }
}

/** 장소 context가 아직 계산되지 않았을 때 쓰는 보수적 기본값 */
function getDefaultGymPlaceContext(
  placeId: string,
  now: string,
): GymPlaceContext {
  return {
    confidence: 0,
    context: "UNKNOWN",
    frequentPlaceLocation: null,
    highNoiseScore: 0,
    placeId,
    updatedAt: now,
  }
}

/** 현재 좌표가 어느 반복 장소 샘플인지 계산하고, 가까운 장소가 애매하면 ambiguous로 표시 */
function buildGymLocationSampleFromCurrentLocation({
  location,
  now,
  places,
  source,
}: {
  location: Location.LocationObject
  now: string
  places: WorkoutPlaceReminderPlace[]
  source: GymLocationSample["source"]
}): GymLocationSample | null {
  const currentCoordinate = {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
  }

  if (!isValidCoordinates(currentCoordinate.lat, currentCoordinate.lng)) {
    return null
  }

  const placeDistances = places
    .filter((place) => isValidCoordinates(place.latitude, place.longitude))
    .map((place) => ({
      distanceToGymM: getDistanceMeters(
        { lat: place.latitude, lng: place.longitude },
        currentCoordinate,
      ),
      place,
    }))
    .sort((left, right) => left.distanceToGymM - right.distanceToGymM)

  const nearest = placeDistances[0]
  if (!nearest) {
    return null
  }

  const second = placeDistances[1]
  const isTooFar =
    nearest.distanceToGymM > POLICY_SAMPLE_MAX_NEAREST_DISTANCE_M
  const isTooCloseToSecondPlace =
    second !== undefined &&
    (second.distanceToGymM - nearest.distanceToGymM <
      POLICY_SAMPLE_AMBIGUOUS_DISTANCE_DELTA_M ||
      second.distanceToGymM / Math.max(nearest.distanceToGymM, 1) <
        POLICY_SAMPLE_AMBIGUOUS_DISTANCE_RATIO)
  const accuracyM =
    typeof location.coords.accuracy === "number" &&
    Number.isFinite(location.coords.accuracy) &&
    location.coords.accuracy >= 0
      ? location.coords.accuracy
      : null

  return {
    accuracyM,
    distanceToGymM: nearest.distanceToGymM,
    id: `${source}:${nearest.place.id}:${now}`,
    lat: currentCoordinate.lat,
    lng: currentCoordinate.lng,
    placeId: nearest.place.id,
    recordedAt: now,
    source,
    ...(isTooFar || isTooCloseToSecondPlace ? { ambiguous: true } : {}),
  }
}

/** 알림 예약 성공 후에만 도착 cooldown을 기록 */
async function markGymArrivalPolicyNotified(placeId: string, now: string) {
  const cooldowns = await getGymLocationPolicyCooldowns()

  await saveGymLocationPolicyCooldowns({
    ...cooldowns,
    arrivalGlobalLastNotifiedAt: now,
    arrivalLastNotifiedAtByPlaceId: {
      ...cooldowns.arrivalLastNotifiedAtByPlaceId,
      [placeId]: now,
    },
  })
}

/** 알림 예약 성공 후에만 종료 cooldown을 기록 */
async function markGymExitPolicyNotified(sessionId: string, now: string) {
  const cooldowns = await getGymLocationPolicyCooldowns()

  await saveGymLocationPolicyCooldowns({
    ...cooldowns,
    exitGlobalLastNotifiedAt: now,
    exitLastNotifiedAtBySessionId: {
      ...cooldowns.exitLastNotifiedAtBySessionId,
      [sessionId]: now,
    },
  })
}

/** Android 백그라운드 위치 권한 안내 */
async function confirmAndroidBackgroundLocationRequest(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true
  }

  return new Promise((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (settled) {
        return
      }
      settled = true
      resolve(value)
    }

    Alert.alert(
      i18n.t("settings.workoutPlaceReminder.backgroundPermissionTitle"),
      i18n.t("settings.workoutPlaceReminder.backgroundPermissionBody"),
      [
        {
          text: i18n.t("common.cancel"),
          style: "cancel",
          onPress: () => settle(false),
        },
        {
          text: i18n.t(
            "settings.workoutPlaceReminder.backgroundPermissionAction",
          ),
          onPress: () => settle(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => settle(false),
      },
    )
  })
}

/** 자동 경로에서는 현재 권한만 확인하고, 명시적 ON 경로에서만 권한을 요청한다. */
async function getWorkoutPlaceArrivalPermissions({
  allowPrompt,
}: SyncWorkoutPlaceArrivalReminderOptions) {
  const notificationPermission = await Notifications.getPermissionsAsync()
  let notificationGranted = isNotificationPermissionGranted(
    notificationPermission,
  )

  if (!notificationGranted && allowPrompt) {
    await ensureWorkoutPlaceArrivalNotificationChannel()
    notificationGranted = isNotificationPermissionGranted(
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
          allowProvisional: true,
        },
      }),
    )
  }

  const foregroundPermission = await Location.getForegroundPermissionsAsync()
  let foregroundGranted = isPermissionGranted(foregroundPermission)

  if (!foregroundGranted && allowPrompt) {
    foregroundGranted = isPermissionGranted(
      await Location.requestForegroundPermissionsAsync(),
    )
  }

  const backgroundPermission = await Location.getBackgroundPermissionsAsync()
  let backgroundGranted = isPermissionGranted(backgroundPermission)

  if (!backgroundGranted && allowPrompt && foregroundGranted) {
    const shouldRequestBackgroundPermission =
      await confirmAndroidBackgroundLocationRequest()

    if (shouldRequestBackgroundPermission) {
      backgroundGranted = isPermissionGranted(
        await Location.requestBackgroundPermissionsAsync(),
      )
    }
  }

  return {
    backgroundLocationGranted: backgroundGranted,
    foregroundLocationGranted: foregroundGranted,
    granted: notificationGranted && foregroundGranted && backgroundGranted,
    notificationGranted,
  }
}

/** 오류 메시지 */
function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** 동기화 상태 스냅샷 */
async function saveSyncStatusSnapshot({
  enabled,
  errorMessage = null,
  operational,
  permissions = deniedPermissions,
  places = [],
  reason,
}: {
  enabled: boolean
  errorMessage?: string | null
  operational: boolean
  permissions?: WorkoutPlaceArrivalPermissionState
  places?: WorkoutPlaceReminderPlace[]
  reason: WorkoutPlaceReminderSyncStatusReason
}) {
  const currentStatus = await getWorkoutPlaceReminderSyncStatus()
  const now = new Date().toISOString()

  await saveWorkoutPlaceReminderSyncStatus({
    backgroundLocationGranted: permissions.backgroundLocationGranted,
    enabled,
    foregroundLocationGranted: permissions.foregroundLocationGranted,
    geofencePlaceCount: places.length,
    lastErrorMessage: errorMessage,
    lastEventAt: currentStatus?.lastEventAt ?? null,
    lastEventPlaceId: currentStatus?.lastEventPlaceId ?? null,
    lastEventType: currentStatus?.lastEventType ?? null,
    lastSyncedAt: now,
    notificationGranted: permissions.notificationGranted,
    operational,
    reason,
    registeredRegionIds: operational ? places.map((place) => place.id) : [],
  })
}

/** 운동 장소 도착 알림을 완전히 끄고 geofence 등록을 중지한다. */
export async function disableWorkoutPlaceArrivalReminder() {
  await setWorkoutPlaceReminderEnabled(false)
  await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
    () => undefined,
  )
  await saveSyncStatusSnapshot({
    enabled: false,
    operational: false,
    reason: "disabled",
  })
}

/** enabled, 권한, 반복 장소 상태를 기준으로 OS geofence 등록을 맞춘다. */
export async function syncWorkoutPlaceArrivalReminder(
  options: SyncWorkoutPlaceArrivalReminderOptions,
) {
  if (!options.allowPrompt && !(await getWorkoutPlaceReminderEnabled())) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    await saveSyncStatusSnapshot({
      enabled: false,
      operational: false,
      reason: "disabled",
    })
    return false
  }

  const permissions = await getWorkoutPlaceArrivalPermissions(options)

  if (!permissions.granted) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    if (options.allowPrompt) {
      await setWorkoutPlaceReminderEnabled(false)
    }
    await saveSyncStatusSnapshot({
      enabled: !options.allowPrompt,
      operational: false,
      permissions,
      reason: "permission-denied",
    })
    return false
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()

  const places = await getWorkoutPlaceReminderGeofencePlaces()

  if (places.length === 0) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    await setWorkoutPlaceReminderEnabled(true)
    await saveSyncStatusSnapshot({
      enabled: true,
      operational: false,
      permissions,
      reason: "no-places",
    })
    return true
  }

  try {
    await Location.startGeofencingAsync(
      WORKOUT_PLACE_ARRIVAL_TASK_NAME,
      places.map((place) => ({
        identifier: place.id,
        latitude: place.latitude,
        longitude: place.longitude,
        notifyOnEnter: true,
        notifyOnExit: true,
        radius: GEOFENCE_RADIUS_METERS,
      })),
    )
  } catch (error) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    if (options.allowPrompt) {
      await setWorkoutPlaceReminderEnabled(false)
    }
    await saveSyncStatusSnapshot({
      enabled: !options.allowPrompt,
      errorMessage: getErrorMessage(error),
      operational: false,
      permissions,
      places,
      reason: "registration-failed",
    })
    return false
  }

  await setWorkoutPlaceReminderEnabled(true)
  await saveSyncStatusSnapshot({
    enabled: true,
    operational: true,
    permissions,
    places,
    reason: "registered",
  })
  return true
}

/** 장소 도착 알림 탭 응답을 운동일지 pending prompt로 변환한다. */
export function registerWorkoutPlaceArrivalNotificationHandler(
  onPromptReady?: () => void,
) {
  const handleResponse = (
    response: Notifications.NotificationResponse | null | undefined,
  ) => {
    const requestId = response?.notification.request.identifier
    if (!requestId || handledResponseIds.has(requestId)) {
      return
    }

    const data = response?.notification.request.content.data
    const placeId = data?.placeId

    if (
      data?.type !== WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE ||
      typeof placeId !== "string"
    ) {
      return
    }

    handledResponseIds.add(requestId)

    void savePendingWorkoutPlaceReminderPrompt({
      placeId,
      createdAt: new Date().toISOString(),
    }).then(() => {
      onPromptReady?.()
    })

    void Notifications.clearLastNotificationResponseAsync().catch(
      () => undefined,
    )
  }

  handleResponse(Notifications.getLastNotificationResponse())

  const subscription =
    Notifications.addNotificationResponseReceivedListener(handleResponse)

  return () => subscription.remove()
}

async function handleWorkoutPlaceArrivalEnter(placeId: string) {
  const places = await getWorkoutPlaceReminderPlaces()
  const place = places.find((item) => item.id === placeId)

  if (!place) {
    return
  }

  const now = new Date().toISOString()
  const currentLocation = await getCurrentLocationWithoutPrompt()
  const currentSample = currentLocation
    ? buildGymLocationSampleFromCurrentLocation({
        location: currentLocation,
        now,
        places,
        source: "geofence-enter",
      })
    : null

  if (currentSample) {
    await appendGymLocationPolicySample(currentSample, now)
  }

  const [activeWorkout, contexts, cooldowns, sampleRecord] = await Promise.all([
    getGymPolicyActiveWorkout(),
    getGymLocationPolicyContexts(),
    getGymLocationPolicyCooldowns(),
    getGymLocationPolicySamples(now),
  ])
  const decision = evaluateGymArrivalPolicy({
    activeWorkout,
    context: contexts[place.id] ?? getDefaultGymPlaceContext(place.id, now),
    cooldowns,
    currentLocation: currentSample,
    now,
    place,
    recentSamples: sampleRecord[place.id] ?? [],
  })

  if (!decision.shouldNotify) {
    return
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("workoutPlaceReminder.notification.title"),
      body: i18n.t("workoutPlaceReminder.notification.body"),
      data: {
        type: WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE,
        placeId,
      },
    },
    trigger:
      Platform.OS === "android"
        ? { channelId: WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID }
        : null,
  })
  await markGymArrivalPolicyNotified(placeId, now)
}

async function handleWorkoutPlaceExit(placeId: string) {
  const places = await getWorkoutPlaceReminderPlaces()
  const place = places.find((item) => item.id === placeId)

  if (!place) {
    return
  }

  const now = new Date().toISOString()
  const currentLocation = await getCurrentLocationWithoutPrompt()
  const currentSample = currentLocation
    ? buildGymLocationSampleFromCurrentLocation({
        location: currentLocation,
        now,
        places,
        source: "geofence-exit",
      })
    : null

  if (currentSample) {
    await appendGymLocationPolicySample(currentSample, now)
  }

  await evaluateAndScheduleGymExitReminder({
    activeWorkout: await getGymPolicyActiveWorkout(),
    currentSample,
    now,
    place,
  })
}

/** 종료 누락 리마인더를 보낼지 확인하고 알림을 예약 */
async function evaluateAndScheduleGymExitReminder({
  activeWorkout,
  currentSample,
  now,
  place,
}: {
  activeWorkout: GymPolicyInput["activeWorkout"]
  currentSample: GymLocationSample | null
  now: string
  place: WorkoutPlaceReminderPlace
}) {
  const [contexts, cooldowns, sampleRecord] = await Promise.all([
    getGymLocationPolicyContexts(),
    getGymLocationPolicyCooldowns(),
    getGymLocationPolicySamples(now),
  ])

  const decision = evaluateGymExitPolicy({
    activeWorkout,
    context: contexts[place.id] ?? getDefaultGymPlaceContext(place.id, now),
    cooldowns,
    currentLocation: currentSample,
    now,
    place,
    recentSamples: sampleRecord[place.id] ?? [],
  })

  if (!decision.shouldNotify || !activeWorkout.sessionId) {
    return false
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("workoutPlaceReminder.exitNotification.title"),
      body: i18n.t("workoutPlaceReminder.exitNotification.body"),
      data: {
        type: WORKOUT_PLACE_EXIT_REMINDER_NOTIFICATION_TYPE,
        placeId: place.id,
        sessionId: activeWorkout.sessionId,
      },
    },
    trigger:
      Platform.OS === "android"
        ? { channelId: WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID }
        : null,
  })
  await markGymExitPolicyNotified(activeWorkout.sessionId, now)
  return true
}

/** 앱이 active로 돌아왔을 때 진행 중 운동의 종료 누락 가능성을 한 번 확인 */
export async function syncWorkoutPlaceExitReminderOnAppActive() {
  const activeWorkout = await getGymPolicyActiveWorkout()
  if (
    activeWorkout.phase !== "recording" &&
    activeWorkout.phase !== "paused"
  ) {
    return false
  }

  const places = await getWorkoutPlaceReminderPlaces()
  const now = new Date().toISOString()
  const currentLocation = await getCurrentLocationWithoutPrompt()
  const currentSample = currentLocation
    ? buildGymLocationSampleFromCurrentLocation({
        location: currentLocation,
        now,
        places,
        source: "workout-active-check",
      })
    : null

  if (currentSample) {
    await appendGymLocationPolicySample(currentSample, now)
  }

  const place = places.find((item) => item.id === currentSample?.placeId)
  if (!place) {
    return false
  }

  return evaluateAndScheduleGymExitReminder({
    activeWorkout,
    currentSample,
    now,
    place,
  })
}

if (!TaskManager.isTaskDefined(WORKOUT_PLACE_ARRIVAL_TASK_NAME)) {
  TaskManager.defineTask<GeofencingTaskData>(
    WORKOUT_PLACE_ARRIVAL_TASK_NAME,
    async ({ data, error }) => {
      if (error) {
        await saveSyncStatusSnapshot({
          enabled: await getWorkoutPlaceReminderEnabled(),
          errorMessage: error.message,
          operational: false,
          reason: "registration-failed",
        }).catch(() => undefined)
        return
      }

      if (
        data?.eventType !== Location.GeofencingEventType.Enter &&
        data?.eventType !== Location.GeofencingEventType.Exit
      ) {
        return
      }

      const placeId = data.region.identifier
      if (typeof placeId !== "string") {
        return
      }

      await saveWorkoutPlaceReminderSyncEvent({
        eventType:
          data.eventType === Location.GeofencingEventType.Enter
            ? "enter"
            : "exit",
        occurredAt: new Date().toISOString(),
        placeId,
      }).catch(() => undefined)

      if (data.eventType === Location.GeofencingEventType.Enter) {
        await handleWorkoutPlaceArrivalEnter(placeId).catch(() => undefined)
        return
      }

      await handleWorkoutPlaceExit(placeId).catch(() => undefined)
    },
  )
}
