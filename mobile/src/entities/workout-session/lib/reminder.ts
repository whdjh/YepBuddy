import * as Notifications from "expo-notifications"
import i18n from "@/shared/i18n/i18n"
import {
  clearWorkoutReminderId,
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

/** 오늘 22:00가 지났으면 다음 날 22:00으로 예약 */
function getNextWorkoutReminderDate() {
  const reminderDate = new Date()
  reminderDate.setHours(22, 0, 0, 0)

  if (reminderDate.getTime() <= Date.now()) {
    reminderDate.setDate(reminderDate.getDate() + 1)
  }

  return reminderDate
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

  await cancelScheduledWorkoutReminder()

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("workout.reminder.title"),
      body: i18n.t("workout.reminder.body"),
      data: {
        kind: WORKOUT_REMINDER_NOTIFICATION_KIND,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: getNextWorkoutReminderDate(),
    },
  })

  await saveWorkoutReminderId(identifier)
  await setWorkoutReminderEnabled(true)
  return true
}

export function scheduleWorkoutReminder22h(_completedAtIso?: string) {
  return syncWorkoutReminderAtNight({ allowPrompt: false })
}
