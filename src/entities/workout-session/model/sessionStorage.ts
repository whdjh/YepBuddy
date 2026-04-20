import AsyncStorage from "@react-native-async-storage/async-storage"
import type { StoredWorkoutSession } from "./types"

export const CURRENT_WORKOUT_STORAGE_KEY = "yb:workout:current"

export const getWorkoutSessionStorageKey = (sessionId: string) =>
  `yb:workout:session:${sessionId}`

export const getWorkoutDateStorageKey = (dateKey: string) =>
  `yb:workout:date:${dateKey}`

/** ISO 시작 시각을 로컬 날짜 키(YYYY-MM-DD)로 변환한다. */
export function getLocalDateKeyFromIso(iso: string) {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** 진행 중 운동 세션 스냅샷을 저장한다. */
export async function saveCurrentWorkoutSnapshot<T>(snapshot: T) {
  await AsyncStorage.setItem(
    CURRENT_WORKOUT_STORAGE_KEY,
    JSON.stringify(snapshot),
  )
}

/** 진행 중 운동 세션 스냅샷을 불러온다 */
export async function loadCurrentWorkoutSnapshot<T>() {
  const value = await AsyncStorage.getItem(CURRENT_WORKOUT_STORAGE_KEY)
  return value ? (JSON.parse(value) as T) : null
}

/** 진행 중 운동 세션 스냅샷을 삭제한다 */
export async function clearCurrentWorkoutSnapshot() {
  await AsyncStorage.removeItem(CURRENT_WORKOUT_STORAGE_KEY)
}

/** 완료 세션 본문과 날짜별 sessionId 인덱스를 함께 저장한다 */
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

/** sessionId로 완료 세션 하나를 조회한다 */
export async function getStoredWorkoutSession(sessionId: string) {
  const value = await AsyncStorage.getItem(getWorkoutSessionStorageKey(sessionId))
  return value ? (JSON.parse(value) as StoredWorkoutSession) : null
}

/** 완료 세션 메모만 수정한 뒤 다시 저장한다 */
export async function updateStoredWorkoutMemo(sessionId: string, memo: string) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const nextSession = { ...session, memo }
  await saveCompletedWorkoutSession(nextSession)
  return nextSession
}

/** 날짜 키로 완료 세션의 sessionId를 조회한다 */
export async function getStoredWorkoutSessionIdByDate(dateKey: string) {
  return AsyncStorage.getItem(getWorkoutDateStorageKey(dateKey))
}
