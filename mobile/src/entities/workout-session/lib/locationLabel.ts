import * as Location from "expo-location"
import type { WorkoutLocation } from "../model/types"

export function formatWorkoutLocationCoordinates(location: WorkoutLocation) {
  return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
}

/** 좌표를 사람이 읽을 수 있는 장소 문자열로 변환. 실패 시 좌표 문자열로 폴백 */
export async function formatWorkoutLocationLabel(
  location: WorkoutLocation,
): Promise<string> {
  const fallback = formatWorkoutLocationCoordinates(location)

  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: location.lat,
      longitude: location.lng,
    })
    const place = results[0]
    if (!place) {
      return fallback
    }

    const parts = [
      place.region,
      place.city,
      place.district,
      place.street,
      place.name,
    ].filter((value): value is string => Boolean(value && value.length > 0))

    const unique = Array.from(new Set(parts))
    return unique.length > 0 ? unique.join(" ") : fallback
  } catch {
    return fallback
  }
}
