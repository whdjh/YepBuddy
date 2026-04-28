import * as Notifications from "expo-notifications"
import i18n from "@/shared/i18n/i18n"
import { getDateAfterHours } from "@/shared/lib/date"
import {
  clearWorkoutReminderId,
  getWorkoutReminderId,
  saveWorkoutReminderId,
} from "../model/sessionStorage"

const WORKOUT_REMINDER_DELAY_HOURS = 22

/** 알림 권한이 있는지 확인하고, 없으면 사용자에게 요청 */
async function requestNotificationPermissions() {
  const permission = await Notifications.getPermissionsAsync()

  if (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true
  }

  const requested = await Notifications.requestPermissionsAsync()

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

/** 현재 저장된 운동 리마인더 하나만 찾아 예약 취소한다. */
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

/** 운동 종료 시각 기준 22시간 뒤 리마인더를 예약한다. */
export async function scheduleWorkoutReminder22h(completedAtIso: string) {
  const granted = await requestNotificationPermissions()

  if (!granted) {
    return null
  }

  await cancelScheduledWorkoutReminder()

  const triggerDate = getDateAfterHours(
    completedAtIso,
    WORKOUT_REMINDER_DELAY_HOURS,
  )

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("workout.reminder.title"),
      body: i18n.t("workout.reminder.body"),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  })

  await saveWorkoutReminderId(identifier)
  return identifier
}
