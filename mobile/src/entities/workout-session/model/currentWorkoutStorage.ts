import AsyncStorage from "@react-native-async-storage/async-storage"
import { parseJsonOrNull } from "@/shared/lib/json"

/** 현재 진행 중인 운동 세션 snapshot 저장 키 */
const CURRENT_WORKOUT_STORAGE_KEY = "yb:workout:current"

/** 진행 중 운동 세션 snapshot 저장 */
export async function saveCurrentWorkoutSnapshot<T>(snapshot: T) {
  await AsyncStorage.setItem(
    CURRENT_WORKOUT_STORAGE_KEY,
    JSON.stringify(snapshot),
  )
}

/** 진행 중 운동 세션 snapshot 조회 */
export async function loadCurrentWorkoutSnapshot<T>() {
  const value = await AsyncStorage.getItem(CURRENT_WORKOUT_STORAGE_KEY)
  return value ? parseJsonOrNull<T>(value) : null
}

/** 진행 중 운동 세션 snapshot 삭제 */
export async function clearCurrentWorkoutSnapshot() {
  await AsyncStorage.removeItem(CURRENT_WORKOUT_STORAGE_KEY)
}
