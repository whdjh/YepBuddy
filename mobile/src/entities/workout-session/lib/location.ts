import * as Location from "expo-location"
import type { WorkoutLocation } from "../model/types"

/** 운동 시작 시 현재 위치를 한 번 조회해 결과 위치로 저장할 좌표로 변환 */
export async function getWorkoutLocationOnce(): Promise<WorkoutLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync()
  if (permission.status !== "granted") {
    return null
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    const accuracyMeters =
      typeof location.coords.accuracy === "number" &&
      Number.isFinite(location.coords.accuracy) &&
      location.coords.accuracy >= 0
        ? location.coords.accuracy
        : undefined
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      ...(accuracyMeters !== undefined ? { accuracyMeters } : {}),
    }
  } catch {
    return null
  }
}
