import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { getLocalDateKey } from "@/shared/lib/date"
import {
  ensureWorkoutReminderNotificationChannel,
  WORKOUT_REMINDER_NOTIFICATION_CHANNEL_ID,
} from "./notificationChannels"
import { getNextWorkoutReminderDate } from "./workoutReminderSchedule"
import {
  clearWorkoutReminderId,
  getStoredWorkoutSessionIdByDate,
  getWorkoutReminderEnabled,
  getWorkoutReminderId,
  saveWorkoutReminderId,
  setWorkoutReminderEnabled,
} from "../model/sessionStorage"

export const WORKOUT_REMINDER_NOTIFICATION_KIND = "workoutReminder"

type SyncWorkoutReminderAtNightOptions = {
  allowPrompt: boolean
}

function isNotificationPermissionGranted(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

/** 자동 동기화 경로에서는 현재 권한만 확인하고 OS 프롬프트를 띄우지 않음 */
async function getWorkoutReminderPermission({
  allowPrompt,
}: SyncWorkoutReminderAtNightOptions) {
  if (allowPrompt) {
    await ensureWorkoutReminderNotificationChannel()
  }

  const existing = await Notifications.getPermissionsAsync()

  if (isNotificationPermissionGranted(existing)) {
    return true
  }

  if (!allowPrompt) {
    return false
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      allowProvisional: true,
    },
  })

  return isNotificationPermissionGranted(requested)
}

/** 운동 리마인더 알림을 특정 날짜/시간에 한 번 울리도록 하는 trigger 객체를 만들어주는 헬퍼 */
function getWorkoutReminderNotificationTrigger(date: Date) {
  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
  }

  if (Platform.OS !== "android") {
    return trigger
  }

  return {
    ...trigger,
    channelId: WORKOUT_REMINDER_NOTIFICATION_CHANNEL_ID,
  }
}

/** 오늘 날짜 인덱스에 완료 세션이 있으면 같은 날 22:00 리마인더를 건너뜀 */
async function getHasCompletedWorkoutToday(now: Date) {
  const todayDateKey = getLocalDateKey(now)

  if (!todayDateKey) {
    return false
  }

  const sessionId = await getStoredWorkoutSessionIdByDate(todayDateKey).catch(
    () => null,
  )
  return typeof sessionId === "string"
}

/** 기존 버전에서 예약됐을 수 있는 운동 리마인더 하나만 찾아 취소 */
export async function cancelScheduledWorkoutReminder() {
  const identifier = await getWorkoutReminderId()

  if (!identifier) {
    return
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier)
  } finally {
    await clearWorkoutReminderId()
  }
}

/** 활성 상태와 권한 상태를 기준으로 22:00 운동 리마인더를 동기화 */
export async function syncWorkoutReminderAtNight(
  options: SyncWorkoutReminderAtNightOptions,
) {
  if (!options.allowPrompt && !(await getWorkoutReminderEnabled())) {
    await cancelScheduledWorkoutReminder()
    return false
  }

  const granted = await getWorkoutReminderPermission(options)

  if (!granted) {
    await setWorkoutReminderEnabled(false)
    await cancelScheduledWorkoutReminder()
    return false
  }

  await ensureWorkoutReminderNotificationChannel()
  await cancelScheduledWorkoutReminder()

  const now = new Date()
  const hasCompletedWorkoutToday = await getHasCompletedWorkoutToday(now)
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("workout.reminder.title"),
      body: i18n.t("workout.reminder.body"),
      data: {
        kind: WORKOUT_REMINDER_NOTIFICATION_KIND,
      },
    },
    trigger: getWorkoutReminderNotificationTrigger(
      getNextWorkoutReminderDate({ hasCompletedWorkoutToday, now }),
    ),
  })

  await saveWorkoutReminderId(identifier)
  await setWorkoutReminderEnabled(true)
  return true
}

export function scheduleWorkoutReminder22h(_completedAtIso?: string) {
  return syncWorkoutReminderAtNight({ allowPrompt: false })
}
