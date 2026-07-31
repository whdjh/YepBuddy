import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"
import { shouldNotifyWorkoutPlaceArrival } from "./workoutPlaceArrivalPolicy"
import {
  ensureWorkoutPlaceArrivalNotificationChannel,
  WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID,
} from "./notificationChannels"
import { loadCurrentWorkoutSnapshot } from "../model/currentWorkoutStorage"
import {
  getWorkoutPlaceReminderBlockedAt,
  getWorkoutPlaceReminderEnabled,
  markWorkoutPlaceReminderBlockedAt,
  saveWorkoutPlaceReminderSyncStatus,
} from "../model/workoutPlaceReminderStorage"
import { getWorkoutPlaces } from "../model/workoutPlaceStorage"
import type { WorkoutState } from "../model/workoutState"

export const WORKOUT_PLACE_ARRIVAL_TASK_NAME =
  "yb-workout-place-arrival-reminder"
export const WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE = "workout-place-arrival"

/** 연속으로 들어온 geofence Enter 이벤트를 순서대로 처리하기 위한 큐 */
let arrivalHandling = Promise.resolve()

/** Expo Location geofence Task가 전달하는 진입·이탈 이벤트 데이터 */
interface GeofencingTaskData {
  /** 등록 영역 진입 또는 이탈 여부 */
  eventType: Location.GeofencingEventType
  /** 이벤트가 발생한 geofence 영역 정보 */
  region: Location.LocationRegion
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

/** 권한 팝업 없이 실제 도착 여부를 재검증할 현재 위치 조회 */
async function getCurrentLocationWithoutPrompt() {
  const permission = await Location.getForegroundPermissionsAsync()
  if (permission.status !== Location.PermissionStatus.GRANTED) {
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

/** geofence Enter 이후 최신 장소·실제 거리·운동 상태를 검증해 알림 발송 */
async function handleWorkoutPlaceArrivalEnter(placeId: string) {
  if (!(await getWorkoutPlaceReminderEnabled())) {
    return
  }

  const place = (await getWorkoutPlaces()).find(
    (candidate) => candidate.id === placeId,
  )
  const location = await getCurrentLocationWithoutPrompt()
  if (
    !place ||
    !location ||
    !isValidCoordinates(
      location.coords.latitude,
      location.coords.longitude,
    )
  ) {
    return
  }

  const [enabled, latestPlaces, blockedAt, phase] = await Promise.all([
    getWorkoutPlaceReminderEnabled(),
    getWorkoutPlaces(),
    getWorkoutPlaceReminderBlockedAt(),
    getCurrentWorkoutPhase(),
  ])
  const latestPlace = latestPlaces.find(
    (candidate) => candidate.id === place.id,
  )
  if (
    !enabled ||
    !latestPlace ||
    latestPlace.latitude !== place.latitude ||
    latestPlace.longitude !== place.longitude
  ) {
    return
  }

  const now = new Date().toISOString()
  const distanceMeters = getDistanceMeters(
    { lat: latestPlace.latitude, lng: latestPlace.longitude },
    {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    },
  )
  if (
    !shouldNotifyWorkoutPlaceArrival({
      accuracyMeters: location.coords.accuracy,
      blockedAt,
      distanceMeters,
      now,
      phase,
    })
  ) {
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
  await markWorkoutPlaceReminderBlockedAt(now)
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
      const placeId = data.region.identifier

      arrivalHandling = arrivalHandling
        .catch(() => undefined)
        .then(() => handleWorkoutPlaceArrivalEnter(placeId))
      await arrivalHandling.catch(() => undefined)
    },
  )
}
