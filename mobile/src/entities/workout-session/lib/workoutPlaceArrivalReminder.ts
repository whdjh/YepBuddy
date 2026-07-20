import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { Alert, Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"
import {
  shouldNotifyWorkoutPlaceArrival,
  WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS,
} from "./workoutPlaceArrivalPolicy"
import {
  ensureWorkoutPlaceArrivalNotificationChannel,
  WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID,
} from "./notificationChannels"
import { loadCurrentWorkoutSnapshot } from "../model/sessionStorage"
import {
  clearConfirmedWorkoutPlace,
  clearPendingWorkoutPlaceReminderPrompt,
  getConfirmedWorkoutPlace,
  getWorkoutPlaceReminderCooldownStartedAt,
  getWorkoutPlaceReminderEnabled,
  markWorkoutPlaceReminderCooldown,
  saveConfirmedWorkoutPlace,
  savePendingWorkoutPlaceReminderPrompt,
  saveWorkoutPlaceReminderSyncStatus,
  setWorkoutPlaceReminderEnabled,
  WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID,
  type WorkoutPlaceReminderSyncStatusReason,
} from "../model/workoutPlaceReminderStorage"
import type { WorkoutState } from "../model/workoutState"

export const WORKOUT_PLACE_ARRIVAL_TASK_NAME =
  "yb-workout-place-arrival-reminder"
export const WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE =
  "workout-place-arrival"

const handledResponseIds = new Set<string>()
/** OS를 깨우기 위한 geofence 반경 */
const WORKOUT_PLACE_GEOFENCE_RADIUS_METERS = 50
let geofenceLifecycle = Promise.resolve()

/** geofence 등록, 중지, 교체 작업을 호출 순서대로 실행 */
function runGeofenceLifecycle<T>(operation: () => Promise<T>) {
  const result = geofenceLifecycle.catch(() => undefined).then(operation)
  geofenceLifecycle = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

/** geofence 동기화 호출 옵션 */
type SyncWorkoutPlaceArrivalReminderOptions = {
  /** 사용자 액션에 따른 권한 요청 허용 여부 */
  allowPrompt: boolean
}

/** 현재 위치 등록 결과 */
export type RegisterCurrentWorkoutPlaceResult =
  | "registered"
  | "permission-denied"
  | "location-unavailable"
  | "low-accuracy"

/** TaskManager가 전달하는 geofence 이벤트 데이터 */
interface GeofencingTaskData {
  /** OS가 전달한 geofence 이벤트 종류 */
  eventType: Location.GeofencingEventType
  /** 이벤트가 발생한 geofence 영역 */
  region: Location.LocationRegion
}

/** 저장된 값이 지원하는 운동 상태인지 확인 */
function isWorkoutPhase(
  value: unknown,
): value is "idle" | "countdown" | "recording" | "paused" | "completed" {
  return (
    value === "idle" ||
    value === "countdown" ||
    value === "recording" ||
    value === "paused" ||
    value === "completed"
  )
}

/** Expo 위치 권한이 허용 상태인지 확인 */
function isPermissionGranted(status: { status: string; granted?: boolean }) {
  return status.granted === true || status.status === "granted"
}

/** Expo 알림 권한이 알림 표시 가능한 상태인지 확인 */
function isNotificationPermissionGranted(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

/** 권한 프롬프트 없이 고정밀 현재 위치를 한 번 조회 */
async function getCurrentLocationWithoutPrompt() {
  const foregroundPermission = await Location.getForegroundPermissionsAsync()
  if (!isPermissionGranted(foregroundPermission)) {
    return null
  }

  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
  } catch {
    return null
  }
}

/** 저장된 운동 스냅샷에서 현재 운동 상태를 조회 */
async function getCurrentWorkoutPhase() {
  const snapshot = await loadCurrentWorkoutSnapshot<Partial<WorkoutState>>()
  return isWorkoutPhase(snapshot?.phase) ? snapshot.phase : "idle"
}

/** Android 백그라운드 위치 권한 요청 전에 사용 목적을 안내 */
async function confirmAndroidBackgroundLocationRequest(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true
  }

  return new Promise((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (!settled) {
        settled = true
        resolve(value)
      }
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
      { cancelable: true, onDismiss: () => settle(false) },
    )
  })
}

/** 자동 경로는 권한을 확인하고 사용자 경로는 필요한 권한을 요청 */
async function getWorkoutPlaceArrivalPermissions({
  allowPrompt,
}: SyncWorkoutPlaceArrivalReminderOptions) {
  let notificationGranted = isNotificationPermissionGranted(
    await Notifications.getPermissionsAsync(),
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

  let foregroundGranted = isPermissionGranted(
    await Location.getForegroundPermissionsAsync(),
  )
  if (!foregroundGranted && allowPrompt) {
    foregroundGranted = isPermissionGranted(
      await Location.requestForegroundPermissionsAsync(),
    )
  }

  let backgroundGranted = isPermissionGranted(
    await Location.getBackgroundPermissionsAsync(),
  )
  if (!backgroundGranted && allowPrompt && foregroundGranted) {
    const shouldRequest = await confirmAndroidBackgroundLocationRequest()
    if (shouldRequest) {
      backgroundGranted = isPermissionGranted(
        await Location.requestBackgroundPermissionsAsync(),
      )
    }
  }

  return notificationGranted && foregroundGranted && backgroundGranted
}

/** 마지막 geofence 동기화 결과를 저장 */
async function saveSyncStatusSnapshot({
  operational,
  reason,
}: {
  operational: boolean
  reason: WorkoutPlaceReminderSyncStatusReason
}) {
  await saveWorkoutPlaceReminderSyncStatus({
    operational,
    reason,
  })
}

/** 현재 위치가 정확도 기준을 통과하면 단일 운동 장소로 저장 */
async function registerCurrentWorkoutPlaceInternal(): Promise<RegisterCurrentWorkoutPlaceResult> {
  let foregroundGranted = isPermissionGranted(
    await Location.getForegroundPermissionsAsync(),
  )
  if (!foregroundGranted) {
    foregroundGranted = isPermissionGranted(
      await Location.requestForegroundPermissionsAsync(),
    )
  }
  if (!foregroundGranted) {
    return "permission-denied"
  }

  let location: Location.LocationObject
  try {
    location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
  } catch {
    return "location-unavailable"
  }

  const latitude = location.coords.latitude
  const longitude = location.coords.longitude
  const accuracy = location.coords.accuracy
  if (!isValidCoordinates(latitude, longitude)) {
    return "location-unavailable"
  }
  if (
    accuracy === null ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS
  ) {
    return "low-accuracy"
  }

  const now = new Date().toISOString()
  await saveConfirmedWorkoutPlace(
    {
      confirmedAt: now,
      id: WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID,
      latitude,
      longitude,
    },
    now,
  )
  return "registered"
}

/** 현재 위치 등록 작업을 geofence 생명주기 큐에서 실행 */
export function registerCurrentWorkoutPlace() {
  return runGeofenceLifecycle(registerCurrentWorkoutPlaceInternal)
}

/** 운동 장소 알림을 끄고 등록된 geofence를 중지 */
async function disableWorkoutPlaceArrivalReminderInternal() {
  await setWorkoutPlaceReminderEnabled(false)
  await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
    () => undefined,
  )
  await saveSyncStatusSnapshot({
    operational: false,
    reason: "disabled",
  })
}

/** 운동 장소 알림 중지 작업을 호출 순서대로 실행 */
export function disableWorkoutPlaceArrivalReminder() {
  return runGeofenceLifecycle(disableWorkoutPlaceArrivalReminderInternal)
}

/** 등록 장소, pending prompt, geofence를 함께 정리 */
export function clearWorkoutPlaceRegistration() {
  return runGeofenceLifecycle(async () => {
    await disableWorkoutPlaceArrivalReminderInternal()
    await Promise.all([
      clearConfirmedWorkoutPlace(),
      clearPendingWorkoutPlaceReminderPrompt(),
    ])
  })
}

/** 저장 상태와 권한에 맞춰 단일 50m geofence를 동기화 */
async function syncWorkoutPlaceArrivalReminderInternal(
  options: SyncWorkoutPlaceArrivalReminderOptions,
) {
  const enabled = await getWorkoutPlaceReminderEnabled()
  if (!options.allowPrompt && !enabled) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    await saveSyncStatusSnapshot({
      operational: false,
      reason: "disabled",
    })
    return false
  }

  const place = await getConfirmedWorkoutPlace()
  if (!place) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    await setWorkoutPlaceReminderEnabled(false)
    await clearPendingWorkoutPlaceReminderPrompt()
    await saveSyncStatusSnapshot({
      operational: false,
      reason: "no-place",
    })
    return false
  }

  const permissions = await getWorkoutPlaceArrivalPermissions(options)
  if (!permissions) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    if (options.allowPrompt) {
      await setWorkoutPlaceReminderEnabled(false)
    }
    await saveSyncStatusSnapshot({
      operational: false,
      reason: "permission-denied",
    })
    return false
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()

  try {
    await Location.startGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME, [
      {
        identifier: place.id,
        latitude: place.latitude,
        longitude: place.longitude,
        notifyOnEnter: true,
        notifyOnExit: false,
        radius: WORKOUT_PLACE_GEOFENCE_RADIUS_METERS,
      },
    ])
  } catch {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    if (options.allowPrompt) {
      await setWorkoutPlaceReminderEnabled(false)
    }
    await saveSyncStatusSnapshot({
      operational: false,
      reason: "registration-failed",
    })
    return false
  }

  await setWorkoutPlaceReminderEnabled(true)
  await saveSyncStatusSnapshot({
    operational: true,
    reason: "registered",
  })
  return true
}

/** geofence 동기화 작업을 호출 순서대로 실행 */
export function syncWorkoutPlaceArrivalReminder(
  options: SyncWorkoutPlaceArrivalReminderOptions,
) {
  return runGeofenceLifecycle(() =>
    syncWorkoutPlaceArrivalReminderInternal(options),
  )
}

/** 운동 장소 알림 탭 응답을 pending prompt로 변환 */
export function registerWorkoutPlaceNotificationHandler(
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
      placeId !== WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID
    ) {
      return
    }

    handledResponseIds.add(requestId)
    void savePendingWorkoutPlaceReminderPrompt({
      placeId,
      createdAt: new Date().toISOString(),
    }).then(() => onPromptReady?.())
    Notifications.clearLastNotificationResponse()
  }

  handleResponse(Notifications.getLastNotificationResponse())
  const subscription =
    Notifications.addNotificationResponseReceivedListener(handleResponse)
  return () => subscription.remove()
}

/** Enter 신호를 현재 위치, 운동 상태, cooldown으로 재검증 */
async function handleWorkoutPlaceArrivalEnter(placeId: string) {
  if (
    placeId !== WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID ||
    !(await getWorkoutPlaceReminderEnabled())
  ) {
    return
  }

  const place = await getConfirmedWorkoutPlace()
  const location = await getCurrentLocationWithoutPrompt()
  if (!place || !location) {
    return
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()

  const [latestEnabled, latestPlace, cooldownStartedAt, phase] =
    await Promise.all([
      getWorkoutPlaceReminderEnabled(),
      getConfirmedWorkoutPlace(),
      getWorkoutPlaceReminderCooldownStartedAt(),
      getCurrentWorkoutPhase(),
    ])
  if (
    !latestEnabled ||
    !latestPlace ||
    latestPlace.confirmedAt !== place.confirmedAt ||
    latestPlace.latitude !== place.latitude ||
    latestPlace.longitude !== place.longitude
  ) {
    return
  }

  const now = new Date().toISOString()
  const distanceMeters = getDistanceMeters(
    { lat: latestPlace.latitude, lng: latestPlace.longitude },
    { lat: location.coords.latitude, lng: location.coords.longitude },
  )
  if (
    !shouldNotifyWorkoutPlaceArrival({
      accuracyMeters: location.coords.accuracy,
      cooldownStartedAt,
      distanceMeters,
      now,
      phase,
    })
  ) {
    return
  }

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
  await markWorkoutPlaceReminderCooldown(now)
}

let arrivalHandling = Promise.resolve()

if (!TaskManager.isTaskDefined(WORKOUT_PLACE_ARRIVAL_TASK_NAME)) {
  TaskManager.defineTask<GeofencingTaskData>(
    WORKOUT_PLACE_ARRIVAL_TASK_NAME,
    async ({ data, error }) => {
      if (error) {
        await saveSyncStatusSnapshot({
          operational: false,
          reason: "registration-failed",
        }).catch(() => undefined)
        return
      }

      if (data?.eventType !== Location.GeofencingEventType.Enter) {
        return
      }

      const placeId = data.region.identifier
      if (typeof placeId !== "string") {
        return
      }

      arrivalHandling = arrivalHandling
        .catch(() => undefined)
        .then(() => handleWorkoutPlaceArrivalEnter(placeId))
      await arrivalHandling.catch(() => undefined)
    },
  )
}
