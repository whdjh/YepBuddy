import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { Alert, Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import {
  ensureWorkoutPlaceArrivalNotificationChannel,
  WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID,
} from "./notificationChannels"
import {
  getWorkoutPlaceReminderEnabled,
  getWorkoutPlaceReminderGeofencePlaces,
  getWorkoutPlaceReminderPlaces,
  getWorkoutPlaceReminderTodayDateKey,
  markWorkoutPlaceReminderNotified,
  savePendingWorkoutPlaceReminderPrompt,
  setWorkoutPlaceReminderEnabled,
} from "../model/workoutPlaceReminderStorage"

export const WORKOUT_PLACE_ARRIVAL_TASK_NAME =
  "yb-workout-place-arrival-reminder"
export const WORKOUT_PLACE_ARRIVAL_NOTIFICATION_TYPE =
  "workout-place-arrival"

const GEOFENCE_RADIUS_METERS = 150
const handledResponseIds = new Set<string>()

type SyncWorkoutPlaceArrivalReminderOptions = {
  allowPrompt: boolean
}

interface GeofencingTaskData {
  eventType: Location.GeofencingEventType
  region: Location.LocationRegion
}

function isPermissionGranted(status: { status: string; granted?: boolean }) {
  return status.granted === true || status.status === "granted"
}

function isNotificationPermissionGranted(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

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

  return notificationGranted && foregroundGranted && backgroundGranted
}

/** 운동 장소 도착 알림을 완전히 끄고 geofence 등록을 중지한다. */
export async function disableWorkoutPlaceArrivalReminder() {
  await setWorkoutPlaceReminderEnabled(false)
  await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
    () => undefined,
  )
}

/** enabled, 권한, 반복 장소 상태를 기준으로 OS geofence 등록을 맞춘다. */
export async function syncWorkoutPlaceArrivalReminder(
  options: SyncWorkoutPlaceArrivalReminderOptions,
) {
  if (!options.allowPrompt && !(await getWorkoutPlaceReminderEnabled())) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    return false
  }

  const granted = await getWorkoutPlaceArrivalPermissions(options)

  if (!granted) {
    await disableWorkoutPlaceArrivalReminder()
    return false
  }

  await ensureWorkoutPlaceArrivalNotificationChannel()

  const places = await getWorkoutPlaceReminderGeofencePlaces()

  if (places.length === 0) {
    await Location.stopGeofencingAsync(WORKOUT_PLACE_ARRIVAL_TASK_NAME).catch(
      () => undefined,
    )
    await setWorkoutPlaceReminderEnabled(true)
    return true
  }

  await Location.startGeofencingAsync(
    WORKOUT_PLACE_ARRIVAL_TASK_NAME,
    places.map((place) => ({
      identifier: place.id,
      latitude: place.latitude,
      longitude: place.longitude,
      radius: GEOFENCE_RADIUS_METERS,
      notifyOnEnter: true,
      notifyOnExit: false,
    })),
  )

  await setWorkoutPlaceReminderEnabled(true)
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

  const todayDateKey = getWorkoutPlaceReminderTodayDateKey()
  if (place.lastNotifiedDateKey === todayDateKey) {
    return
  }

  await markWorkoutPlaceReminderNotified(placeId, todayDateKey)
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
}

if (!TaskManager.isTaskDefined(WORKOUT_PLACE_ARRIVAL_TASK_NAME)) {
  TaskManager.defineTask<GeofencingTaskData>(
    WORKOUT_PLACE_ARRIVAL_TASK_NAME,
    async ({ data, error }) => {
      if (error || data?.eventType !== Location.GeofencingEventType.Enter) {
        return
      }

      const placeId = data.region.identifier
      if (typeof placeId !== "string") {
        return
      }

      await handleWorkoutPlaceArrivalEnter(placeId).catch(() => undefined)
    },
  )
}
