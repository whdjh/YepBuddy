import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { AppState, Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"
import {
  canNotifyWorkoutPlaceArrivalToday,
  shouldNotifyWorkoutPlaceArrival,
  WORKOUT_PLACE_ARRIVAL_REQUIRED_MATCH_COUNT,
  WORKOUT_PLACE_ARRIVAL_TRACKING_DURATION_MS,
} from "./workoutPlaceArrivalPolicy"
import {
  ensureWorkoutPlaceArrivalNotificationChannel,
  WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID,
} from "./notificationChannels"
import { loadCurrentWorkoutSnapshot } from "../model/currentWorkoutStorage"
import {
  clearWorkoutPlaceArrivalTrackingState,
  getWorkoutPlaceArrivalTrackingState,
  getWorkoutPlaceReminderBlockedAt,
  getWorkoutPlaceReminderEnabled,
  markWorkoutPlaceReminderBlockedAt,
  saveWorkoutPlaceArrivalTrackingState,
  saveWorkoutPlaceReminderSyncStatus,
} from "../model/workoutPlaceReminderStorage"
import { getWorkoutPlaces } from "../model/workoutPlaceStorage"
import type { WorkoutState } from "../model/workoutState"

export const WORKOUT_PLACE_ARRIVAL_TASK_NAME =
  "yb-workout-place-arrival-reminder"
export const WORKOUT_PLACE_ARRIVAL_TRACKING_TASK_NAME =
  "yb-workout-place-arrival-tracking"
export const WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE = "workout-place-arrival"
const GEOFENCE_IDENTIFIER_SEPARATOR = "::"

/** 연속으로 들어온 geofence Enter 이벤트를 순서대로 처리하기 위한 큐 */
let arrivalHandling = Promise.resolve()

/** Expo Location geofence Task가 전달하는 진입·이탈 이벤트 데이터 */
interface GeofencingTaskData {
  /** 등록 영역 진입 또는 이탈 여부 */
  eventType: Location.GeofencingEventType
  /** 이벤트가 발생한 geofence 영역 정보 */
  region: Location.LocationRegion
}

/** Expo Location background task가 전달하는 위치 묶음 */
interface LocationTaskData {
  locations: Location.LocationObject[]
}

/** 장소와 외곽·내부 영역을 구분하는 geofence identifier 생성 */
export function getWorkoutPlaceGeofenceIdentifier(
  placeId: string,
  boundary: "outer" | "inner",
) {
  return `${placeId}${GEOFENCE_IDENTIFIER_SEPARATOR}${boundary}`
}

/** 새 이중 geofence와 기존 단일 geofence identifier에서 장소 ID 추출 */
function getWorkoutPlaceIdFromGeofenceIdentifier(identifier: string) {
  const separatorIndex = identifier.lastIndexOf(GEOFENCE_IDENTIFIER_SEPARATOR)
  return separatorIndex === -1
    ? identifier
    : identifier.slice(0, separatorIndex)
}

/** 저장된 운동 단계가 앱에서 지원하는 값인지 확인 */
function isWorkoutPhase(value: unknown): value is WorkoutState["phase"] {
  return (
    value === "idle" ||
    value === "countdown" ||
    value === "recording" ||
    value === "paused" ||
    value === "completed"
  )
}

/** 현재 운동 스냅샷에서 알림 정책에 사용할 운동 단계 조회 */
async function getCurrentWorkoutPhase() {
  const snapshot = await loadCurrentWorkoutSnapshot<Partial<WorkoutState>>()
  return isWorkoutPhase(snapshot?.phase) ? snapshot.phase : "idle"
}

/** 진행 중인 실제 도착 위치 추적 중지 */
export async function stopWorkoutPlaceArrivalTracking() {
  await Location.stopLocationUpdatesAsync(
    WORKOUT_PLACE_ARRIVAL_TRACKING_TASK_NAME,
  ).catch(() => undefined)
  await clearWorkoutPlaceArrivalTrackingState()
}

/** 기존 장소 도착 알림을 같은 payload로 즉시 예약 */
async function scheduleWorkoutPlaceArrivalNotification(
  placeId: string,
  now: string,
) {
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
  await markWorkoutPlaceReminderBlockedAt(now)
}

/** geofence Enter 이후 최대 5분간 실제 도착 위치 추적 시작 */
async function handleWorkoutPlaceArrivalEnter(placeId: string) {
  if (AppState.currentState === "active") {
    return
  }

  const [enabled, places, blockedAt, phase, trackingState] = await Promise.all([
    getWorkoutPlaceReminderEnabled(),
    getWorkoutPlaces(),
    getWorkoutPlaceReminderBlockedAt(),
    getCurrentWorkoutPhase(),
    getWorkoutPlaceArrivalTrackingState(),
  ])
  const now = new Date()
  if (
    !enabled ||
    !places.some((place) => place.id === placeId) ||
    !canNotifyWorkoutPlaceArrivalToday({
      blockedAt,
      now: now.toISOString(),
      phase,
    })
  ) {
    return
  }

  if (
    trackingState?.placeId === placeId &&
    Date.parse(trackingState.startedAt) +
      WORKOUT_PLACE_ARRIVAL_TRACKING_DURATION_MS >
      now.getTime()
  ) {
    return
  }

  await stopWorkoutPlaceArrivalTracking()
  await saveWorkoutPlaceArrivalTrackingState({
    placeId,
    startedAt: now.toISOString(),
    consecutiveMatches: 0,
  })
  try {
    await Location.startLocationUpdatesAsync(
      WORKOUT_PLACE_ARRIVAL_TRACKING_TASK_NAME,
      {
        accuracy: Location.Accuracy.High,
        activityType: Location.ActivityType.Fitness,
        distanceInterval: 5,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      },
    )
  } catch {
    await clearWorkoutPlaceArrivalTrackingState()
  }
}

/** 연속 위치에서 실제 도착을 판정하고 알림 후 추적 종료 */
async function handleWorkoutPlaceArrivalLocations(
  locations: Location.LocationObject[],
) {
  const trackingState = await getWorkoutPlaceArrivalTrackingState()
  if (!trackingState) {
    await stopWorkoutPlaceArrivalTracking()
    return
  }

  const now = new Date()
  if (
    Date.parse(trackingState.startedAt) +
      WORKOUT_PLACE_ARRIVAL_TRACKING_DURATION_MS <=
    now.getTime()
  ) {
    await stopWorkoutPlaceArrivalTracking()
    return
  }

  const location = [...locations]
    .reverse()
    .find(
      (candidate) =>
        candidate.timestamp >= Date.parse(trackingState.startedAt) &&
        isValidCoordinates(
          candidate.coords.latitude,
          candidate.coords.longitude,
        ),
    )
  if (!location) {
    return
  }

  const [enabled, places, blockedAt, phase] = await Promise.all([
    getWorkoutPlaceReminderEnabled(),
    getWorkoutPlaces(),
    getWorkoutPlaceReminderBlockedAt(),
    getCurrentWorkoutPhase(),
  ])
  const place = places.find(
    (candidate) => candidate.id === trackingState.placeId,
  )
  if (!enabled || !place) {
    await stopWorkoutPlaceArrivalTracking()
    return
  }

  const distanceMeters = getDistanceMeters(
    { lat: place.latitude, lng: place.longitude },
    { lat: location.coords.latitude, lng: location.coords.longitude },
  )
  const matches = shouldNotifyWorkoutPlaceArrival({
    accuracyMeters: location.coords.accuracy,
    blockedAt,
    distanceMeters,
    now: now.toISOString(),
    phase,
  })
  const consecutiveMatches = matches
    ? trackingState.consecutiveMatches + 1
    : 0

  if (consecutiveMatches < WORKOUT_PLACE_ARRIVAL_REQUIRED_MATCH_COUNT) {
    await saveWorkoutPlaceArrivalTrackingState({
      ...trackingState,
      consecutiveMatches,
    })
    return
  }

  await scheduleWorkoutPlaceArrivalNotification(place.id, now.toISOString())
  await stopWorkoutPlaceArrivalTracking()
}

/** 앱이 백그라운드여도 geofence Enter 이벤트를 받을 전역 Task 등록 */
if (!TaskManager.isTaskDefined(WORKOUT_PLACE_ARRIVAL_TASK_NAME)) {
  TaskManager.defineTask<GeofencingTaskData>(
    WORKOUT_PLACE_ARRIVAL_TASK_NAME,
    async ({ data, error }) => {
      if (error) {
        await saveWorkoutPlaceReminderSyncStatus({
          operational: false,
          reason: "registration-failed",
        }).catch(() => undefined)
        return
      }
      if (
        data?.eventType !== Location.GeofencingEventType.Enter ||
        typeof data.region.identifier !== "string"
      ) {
        return
      }
      const placeId = getWorkoutPlaceIdFromGeofenceIdentifier(
        data.region.identifier,
      )

      arrivalHandling = arrivalHandling
        .catch(() => undefined)
        .then(() => handleWorkoutPlaceArrivalEnter(placeId))
      await arrivalHandling.catch(() => undefined)
    },
  )
}

if (!TaskManager.isTaskDefined(WORKOUT_PLACE_ARRIVAL_TRACKING_TASK_NAME)) {
  TaskManager.defineTask<LocationTaskData>(
    WORKOUT_PLACE_ARRIVAL_TRACKING_TASK_NAME,
    async ({ data, error }) => {
      if (error || !Array.isArray(data?.locations)) {
        await stopWorkoutPlaceArrivalTracking().catch(() => undefined)
        return
      }

      arrivalHandling = arrivalHandling
        .catch(() => undefined)
        .then(() => handleWorkoutPlaceArrivalLocations(data.locations))
      await arrivalHandling.catch(() => undefined)
    },
  )
}
