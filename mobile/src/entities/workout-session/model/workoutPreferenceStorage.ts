import AsyncStorage from "@react-native-async-storage/async-storage"
import type { CalendarAutoAddPreference } from "../lib/calendarAutoAdd"

/** 다음 운동 리마인더 notification identifier 저장 키 */
const WORKOUT_REMINDER_STORAGE_KEY = "yb:workout:reminder"
/** 운동 리마인더 사용 여부 저장 키 */
const WORKOUT_REMINDER_ENABLED_STORAGE_KEY = "yb:workout:reminder:enabled"
/** 완료 운동의 기기 캘린더 자동 추가 선호값 저장 키 */
const CALENDAR_AUTO_ADD_PREFERENCE_STORAGE_KEY = "yb:workout:calendar:auto-add"

/** 다음 운동 리마인더 identifier 저장 */
export async function saveWorkoutReminderId(identifier: string) {
  await AsyncStorage.setItem(WORKOUT_REMINDER_STORAGE_KEY, identifier)
}

/** 저장된 운동 리마인더 identifier 조회 */
export async function getWorkoutReminderId() {
  return AsyncStorage.getItem(WORKOUT_REMINDER_STORAGE_KEY)
}

/** 저장된 운동 리마인더 identifier 삭제 */
export async function clearWorkoutReminderId() {
  await AsyncStorage.removeItem(WORKOUT_REMINDER_STORAGE_KEY)
}

/** 운동 리마인더 활성화 저장값 조회 */
export async function getWorkoutReminderEnabled() {
  return (
    (await AsyncStorage.getItem(WORKOUT_REMINDER_ENABLED_STORAGE_KEY)) === "true"
  )
}

/** 운동 리마인더 활성화 저장값 저장 */
export async function setWorkoutReminderEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    WORKOUT_REMINDER_ENABLED_STORAGE_KEY,
    enabled ? "true" : "false",
  )
}

/** 캘린더 자동 추가 선호값 조회 */
export async function getCalendarAutoAddPreference(): Promise<CalendarAutoAddPreference> {
  const value = await AsyncStorage.getItem(
    CALENDAR_AUTO_ADD_PREFERENCE_STORAGE_KEY,
  )

  return value === "enabled" || value === "disabled" ? value : "unknown"
}

/** 캘린더 자동 추가 선호값 저장 */
export async function setCalendarAutoAddPreference(
  preference: CalendarAutoAddPreference,
) {
  await AsyncStorage.setItem(
    CALENDAR_AUTO_ADD_PREFERENCE_STORAGE_KEY,
    preference,
  )
}
