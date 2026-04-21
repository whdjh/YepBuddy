import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import type { StoredWorkoutSession } from "./types"

// 현재 진행 중인 운동 세션 스냅샷을 저장하는 키
export const CURRENT_WORKOUT_STORAGE_KEY = "yb:workout:current"
// 다음 운동 리마인더 notification identifier를 저장하는 키
export const WORKOUT_REMINDER_STORAGE_KEY = "yb:workout:reminder"

// 완료된 운동 세션 본문은 sessionId 기준으로 저장
export const getWorkoutSessionStorageKey = (sessionId: string) =>
  `yb:workout:session:${sessionId}`

// 날짜별 대표 운동 세션은 YYYY-MM-DD 기준으로 찾기
export const getWorkoutDateStorageKey = (dateKey: string) =>
  `yb:workout:date:${dateKey}`

/** 진행 중 운동 세션 스냅샷을 저장 */
export async function saveCurrentWorkoutSnapshot<T>(snapshot: T) {
  await AsyncStorage.setItem(
    CURRENT_WORKOUT_STORAGE_KEY,
    JSON.stringify(snapshot),
  )
}

/** 진행 중 운동 세션 스냅샷 */
export async function loadCurrentWorkoutSnapshot<T>() {
  const value = await AsyncStorage.getItem(CURRENT_WORKOUT_STORAGE_KEY)
  return value ? (JSON.parse(value) as T) : null
}

/** 진행 중 운동 세션 스냅샷을 삭제 */
export async function clearCurrentWorkoutSnapshot() {
  await AsyncStorage.removeItem(CURRENT_WORKOUT_STORAGE_KEY)
}

/** 다음 운동 리마인더 identifier를 저장 */
export async function saveWorkoutReminderId(identifier: string) {
  await AsyncStorage.setItem(WORKOUT_REMINDER_STORAGE_KEY, identifier)
}

/** 저장된 운동 리마인더 identifier를 조회 */
export async function getWorkoutReminderId() {
  return AsyncStorage.getItem(WORKOUT_REMINDER_STORAGE_KEY)
}

/** 저장된 운동 리마인더 identifier를 삭제 */
export async function clearWorkoutReminderId() {
  await AsyncStorage.removeItem(WORKOUT_REMINDER_STORAGE_KEY)
}

/** 완료 세션 본문과 날짜별 sessionId 인덱스를 함께 저장 */
export async function saveCompletedWorkoutSession(
  session: StoredWorkoutSession,
) {
  const dateKey = getLocalDateKeyFromIso(session.startedAt)
  await Promise.all([
    AsyncStorage.setItem(
      getWorkoutSessionStorageKey(session.sessionId),
      JSON.stringify(session),
    ),
    AsyncStorage.setItem(getWorkoutDateStorageKey(dateKey), session.sessionId),
  ])
}

/** sessionId로 완료 세션 하나를 조회 */
export async function getStoredWorkoutSession(sessionId: string) {
  const value = await AsyncStorage.getItem(getWorkoutSessionStorageKey(sessionId))
  return value ? (JSON.parse(value) as StoredWorkoutSession) : null
}

/** 완료 세션 메모만 수정한 뒤 다시 저장 */
export async function updateStoredWorkoutMemo(sessionId: string, memo: string) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const nextSession = { ...session, memo }
  await saveCompletedWorkoutSession(nextSession)
  return nextSession
}

/** 날짜 키로 완료 세션의 sessionId를 조회 */
export async function getStoredWorkoutSessionIdByDate(dateKey: string) {
  return AsyncStorage.getItem(getWorkoutDateStorageKey(dateKey))
}
