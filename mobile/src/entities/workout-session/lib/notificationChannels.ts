import * as Notifications from "expo-notifications"
import i18n from "@/shared/i18n/i18n"
import { defineAndroidNotificationChannel } from "@/shared/lib/androidNotificationChannel"

export const WORKOUT_REMINDER_NOTIFICATION_CHANNEL_ID = "workout-reminders"
export const WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID =
  "workout-place-arrival"

// 운동 리마인더 알림 채널 등록
export const ensureWorkoutReminderNotificationChannel =
  defineAndroidNotificationChannel({
    channelId: WORKOUT_REMINDER_NOTIFICATION_CHANNEL_ID,
    getName: () => i18n.t("settings.workoutReminder.title"),
    importance: Notifications.AndroidImportance.DEFAULT,
  })

// 운동 장소 도착 알림 채널 등록
export const ensureWorkoutPlaceArrivalNotificationChannel =
  defineAndroidNotificationChannel({
    channelId: WORKOUT_PLACE_ARRIVAL_NOTIFICATION_CHANNEL_ID,
    getName: () => i18n.t("settings.workoutPlaceReminder.title"),
    importance: Notifications.AndroidImportance.DEFAULT,
  })

// 운동 세션 알림 채널 일괄 등록
export async function ensureWorkoutSessionNotificationChannels(): Promise<void> {
  await Promise.all([
    ensureWorkoutReminderNotificationChannel(),
    ensureWorkoutPlaceArrivalNotificationChannel(),
  ])
}
