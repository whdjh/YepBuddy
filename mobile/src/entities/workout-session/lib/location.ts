import * as Location from "expo-location"
import type { WorkoutLocation } from "../model/types"

/** 운동 시작 시 현재 위치를 한 번 조회해 세션 저장용 좌표로 변환 */
export async function getWorkoutLocationOnce(): Promise<WorkoutLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync()
  if (permission.status !== "granted") {
    return null
  }

  const location = await Location.getCurrentPositionAsync({})
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
  }
}
