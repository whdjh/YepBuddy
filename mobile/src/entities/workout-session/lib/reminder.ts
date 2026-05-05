import * as Notifications from "expo-notifications"
import {
  clearWorkoutReminderId,
  getWorkoutReminderId,
} from "../model/sessionStorage"

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
