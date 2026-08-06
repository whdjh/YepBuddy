import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import { ensureWorkoutPlaceArrivalNotificationChannel } from "./notificationChannels"
import {
  WORKOUT_PLACE_GEOFENCED_MAX_COUNT,
  WORKOUT_PLACE_INNER_GEOFENCE_RADIUS_METERS,
  WORKOUT_PLACE_OUTER_GEOFENCE_RADIUS_METERS,
} from "./workoutPlaceArrivalPolicy"
import { getWorkoutPlaceArrivalPermissions } from "./workoutPlaceArrivalPermissions"
import {
  WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE,
  WORKOUT_PLACE_ARRIVAL_TASK_NAME,
  getWorkoutPlaceGeofenceIdentifier,
  stopWorkoutPlaceArrivalTracking,
} from "./workoutPlaceArrivalTask"
import {
  clearPendingWorkoutPlaceReminderPrompt,
  getWorkoutPlaceReminderEnabled,
  savePendingWorkoutPlaceReminderPrompt,
  saveWorkoutPlaceReminderSyncStatus,
  setWorkoutPlaceReminderEnabled,
  type WorkoutPlaceReminderSyncStatusReason,
} from "../model/workoutPlaceReminderStorage"
import {
  getWorkoutPlaces,
  removeWorkoutPlace,
} from "../model/workoutPlaceStorage"

/** 중복된 알림 응답을 한 번만 처리하기 위한 요청 ID 집합 */
const handledResponseIds = new Set<string>()
/** geofence 등록·중지 요청의 경합을 방지하는 lifecycle 큐 */
let geofenceLifecycle = Promise.resolve()

/** 이전 작업 실패와 무관하게 geofence lifecycle 작업을 순서대로 실행 */
function runGeofenceLifecycle<T>(task: () => Promise<T>) {
  const result = geofenceLifecycle.catch(() => undefined).then(task)
  geofenceLifecycle = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

/** geofence 동기화 결과를 저장 가능한 snapshot으로 변환 */
function saveSyncStatusSnapshot(
  operational: boolean,
  reason: WorkoutPlaceReminderSyncStatusReason,
) {
  return saveWorkoutPlaceReminderSyncStatus({ operational, reason })
}

/** 등록 여부와 관계없이 geofence 중지를 안전하게 시도 */
async function stopGeofencing() {
  await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
    () => undefined,
  )
  await stopWorkoutPlaceArrivalTracking()
}

/** 알림 설정과 geofence를 함께 비활성화 */
async function disableWorkoutPlaceArrivalReminderInternal() {
  await setWorkoutPlaceReminderEnabled(false)
  await stopGeofencing()
  await saveSyncStatusSnapshot(false, "disabled")
}

/** 다른 lifecycle 작업과 겹치지 않게 장소 알림 비활성화 */
export function disableWorkoutPlaceArrivalReminder() {
  return runGeofenceLifecycle(disableWorkoutPlaceArrivalReminderInternal)
}

/** 학습 장소를 삭제하고 남은 장소 기준으로 geofence 재동기화 */
export function deleteWorkoutPlace(placeId: string) {
  return runGeofenceLifecycle(async () => {
    const places = await removeWorkoutPlace(placeId)
    if (places.length === 0) {
      await disableWorkoutPlaceArrivalReminderInternal()
      return places
    }
    await syncWorkoutPlaceArrivalReminderInternal({ allowPrompt: false })
    return places
  })
}

/** 활성화 상태·장소·권한에 맞춰 geofence 등록 상태 동기화 */
async function syncWorkoutPlaceArrivalReminderInternal({
  allowPrompt,
}: {
  allowPrompt: boolean
}) {
  const enabled = await getWorkoutPlaceReminderEnabled()
  if (!allowPrompt && !enabled) {
    await stopGeofencing()
    await saveSyncStatusSnapshot(false, "disabled")
    return false
  }

  const places = await getWorkoutPlaces()
  if (places.length === 0) {
    await stopGeofencing()
    await setWorkoutPlaceReminderEnabled(false)
    await clearPendingWorkoutPlaceReminderPrompt()
    await saveSyncStatusSnapshot(false, "no-place")
    return false
  }

  if (!(await getWorkoutPlaceArrivalPermissions({ allowPrompt }))) {
    await stopGeofencing()
    if (allowPrompt) {
      await setWorkoutPlaceReminderEnabled(false)
    }
    await saveSyncStatusSnapshot(false, "permission-denied")
    return false
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()
  try {
    await Location.startGeofencingAsync(
      WORKOUT_PLACE_ARRIVAL_TASK_NAME,
      places.slice(0, WORKOUT_PLACE_GEOFENCED_MAX_COUNT).flatMap((place) =>
        [
          {
            identifier: getWorkoutPlaceGeofenceIdentifier(place.id, "outer"),
            radius: WORKOUT_PLACE_OUTER_GEOFENCE_RADIUS_METERS,
          },
          {
            identifier: getWorkoutPlaceGeofenceIdentifier(place.id, "inner"),
            radius: WORKOUT_PLACE_INNER_GEOFENCE_RADIUS_METERS,
          },
        ].map(({ identifier, radius }) => ({
          identifier,
          latitude: place.latitude,
          longitude: place.longitude,
          notifyOnEnter: true,
          notifyOnExit: false,
          radius,
        })),
      ),
    )
  } catch {
    await stopGeofencing()
    if (allowPrompt) {
      await setWorkoutPlaceReminderEnabled(false)
    }
    await saveSyncStatusSnapshot(false, "registration-failed")
    return false
  }

  await setWorkoutPlaceReminderEnabled(true)
  await saveSyncStatusSnapshot(true, "registered")
  return true
}

/** geofence lifecycle 큐에서 운동 장소 알림 상태 동기화 */
export function syncWorkoutPlaceArrivalReminder({
  allowPrompt = false,
}: {
  allowPrompt?: boolean
} = {}) {
  return runGeofenceLifecycle(() =>
    syncWorkoutPlaceArrivalReminderInternal({ allowPrompt }),
  )
}

/** 장소 도착 알림 응답을 pending prompt로 변환해 앱 화면에 전달 */
export function registerWorkoutPlaceNotificationHandler(
  onPromptReady?: () => void,
) {
  const handleResponse = async (
    response: Notifications.NotificationResponse | null | undefined,
  ) => {
    const requestId = response?.notification.request.identifier
    if (!requestId || handledResponseIds.has(requestId)) {
      return
    }

    const data = response.notification.request.content.data
    const placeId = data?.placeId
    if (
      data?.type !== WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE ||
      typeof placeId !== "string" ||
      !(await getWorkoutPlaces()).some((place) => place.id === placeId)
    ) {
      return
    }

    handledResponseIds.add(requestId)
    await savePendingWorkoutPlaceReminderPrompt({
      placeId,
      createdAt: new Date().toISOString(),
    })
    onPromptReady?.()
    Notifications.clearLastNotificationResponse()
  }

  void handleResponse(Notifications.getLastNotificationResponse())
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      void handleResponse(response)
    },
  )
  return () => subscription.remove()
}
