import AsyncStorage from "@react-native-async-storage/async-storage"
import { getTimestampMsFromIso } from "@/shared/lib/date"
import { isValidCoordinates } from "@/shared/lib/geo"
import { parseJsonOrNull } from "@/shared/lib/json"
import { WORKOUT_LOCATION_LABEL_FORMAT_VERSION } from "../lib/locationAddress"
import {
  WORKOUT_PLACE_MAX_COUNT,
  type LearnedWorkoutPlace,
} from "../lib/workoutPlaceLearning"

export const WORKOUT_PLACE_REMINDER_PLACES_STORAGE_KEY =
  "yb:workout-place-reminder:places"
export const WORKOUT_PLACE_REMINDER_EXCLUDED_SESSION_IDS_STORAGE_KEY =
  "yb:workout-place-reminder:excluded-session-ids"

/** 값이 유효한 ISO 날짜 문자열인지 확인 */
function isValidIso(value: unknown): value is string {
  return typeof value === "string" && getTimestampMsFromIso(value) !== null
}

/** 저장소에서 읽은 값을 검증하고 정규화된 운동 장소로 변환 */
function normalizeWorkoutPlace(value: unknown): LearnedWorkoutPlace | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const place = value as Partial<LearnedWorkoutPlace>
  if (
    typeof place.id !== "string" ||
    !place.id ||
    typeof place.latitude !== "number" ||
    typeof place.longitude !== "number" ||
    !isValidCoordinates(place.latitude, place.longitude) ||
    !isValidIso(place.lastVisitedAt)
  ) {
    return null
  }

  const hasCurrentLabelFormat =
    place.labelFormatVersion === WORKOUT_LOCATION_LABEL_FORMAT_VERSION

  return {
    id: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    label:
      hasCurrentLabelFormat && typeof place.label === "string" && place.label
        ? place.label
        : null,
    labelFormatVersion: hasCurrentLabelFormat
      ? WORKOUT_LOCATION_LABEL_FORMAT_VERSION
      : 0,
    lastVisitedAt: place.lastVisitedAt,
    sourceSessionIds: Array.isArray(place.sourceSessionIds)
      ? Array.from(
          new Set(
            place.sourceSessionIds.filter(
              (sessionId): sessionId is string =>
                typeof sessionId === "string" && sessionId.length > 0,
            ),
          ),
        )
      : [],
  }
}

/** 저장된 장소 목록을 검증·중복 제거하고 최근 방문순 최대 개수로 제한 */
function normalizeWorkoutPlaces(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const seenIds = new Set<string>()
  return value
    .map(normalizeWorkoutPlace)
    .filter((place): place is LearnedWorkoutPlace => {
      if (!place || seenIds.has(place.id)) {
        return false
      }
      seenIds.add(place.id)
      return true
    })
    .sort((left, right) =>
      right.lastVisitedAt.localeCompare(left.lastVisitedAt),
    )
    .slice(0, WORKOUT_PLACE_MAX_COUNT)
}

/** 저장소에서 정규화된 운동 장소 목록 조회 */
export async function getWorkoutPlaces() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_PLACES_STORAGE_KEY,
  )
  return value ? normalizeWorkoutPlaces(parseJsonOrNull<unknown>(value)) : []
}

/** 운동 장소 목록을 정규화해 저장하고 실제 저장된 목록 반환 */
async function saveWorkoutPlaces(places: LearnedWorkoutPlace[]) {
  const normalized = normalizeWorkoutPlaces(places)
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_PLACES_STORAGE_KEY,
    JSON.stringify(normalized),
  )
  return normalized
}

/** 동시에 요청된 장소 변경을 순서대로 처리하기 위한 업데이트 큐 */
let placesUpdate = Promise.resolve<LearnedWorkoutPlace[]>([])

/** 최신 장소 목록에 변경 함수를 적용하고 결과를 순차적으로 저장 */
export function updateWorkoutPlaces(
  updater: (
    places: LearnedWorkoutPlace[],
  ) => LearnedWorkoutPlace[] | Promise<LearnedWorkoutPlace[]>,
) {
  placesUpdate = placesUpdate
    .catch(() => [])
    .then(async () =>
      saveWorkoutPlaces(await updater(await getWorkoutPlaces())),
    )
  return placesUpdate
}

/** 장소 재학습에서 제외할 운동 세션 ID 목록 조회 */
export async function getExcludedWorkoutPlaceSessionIds() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_EXCLUDED_SESSION_IDS_STORAGE_KEY,
  )
  const parsed = value ? parseJsonOrNull<unknown>(value) : null
  return Array.isArray(parsed)
    ? Array.from(
        new Set(
          parsed.filter(
            (sessionId): sessionId is string =>
              typeof sessionId === "string" && sessionId.length > 0,
          ),
        ),
      )
    : []
}

/** 학습 장소를 삭제하고 해당 장소의 원본 세션을 재학습 대상에서 제외 */
export function removeWorkoutPlace(placeId: string) {
  return updateWorkoutPlaces(async (places) => {
    const place = places.find((candidate) => candidate.id === placeId)
    if (place) {
      const excluded = await getExcludedWorkoutPlaceSessionIds()
      await AsyncStorage.setItem(
        WORKOUT_PLACE_REMINDER_EXCLUDED_SESSION_IDS_STORAGE_KEY,
        JSON.stringify(
          Array.from(new Set([...excluded, ...place.sourceSessionIds])),
        ),
      )
    }
    return places.filter((candidate) => candidate.id !== placeId)
  })
}
