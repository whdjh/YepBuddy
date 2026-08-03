import * as Location from "expo-location"
import { formatWorkoutLocationAddress } from "./locationAddress"
import type { WorkoutLocation } from "../model/types"

export function formatWorkoutLocationCoordinates(location: WorkoutLocation) {
  return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
}

/** 좌표를 사람이 읽을 수 있는 주소 라벨로 변환 */
export async function getWorkoutLocationAddressLabel(
  location: WorkoutLocation,
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: location.lat,
      longitude: location.lng,
    })
    const place = results[0]
    return place ? formatWorkoutLocationAddress(place) : null
  } catch {
    return null
  }
}

/** 좌표를 사람이 읽을 수 있는 장소 문자열로 변환. 실패 시 좌표 문자열로 폴백 */
export async function formatWorkoutLocationLabel(location: WorkoutLocation) {
  return (
    (await getWorkoutLocationAddressLabel(location)) ??
    formatWorkoutLocationCoordinates(location)
  )
}
