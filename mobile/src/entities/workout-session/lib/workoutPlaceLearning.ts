import { getTimestampMsFromIso } from "@/shared/lib/date"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"
import type { StoredWorkoutSession, WorkoutLocation } from "../model/types"

/** 자동 학습된 운동 장소 */
export interface LearnedWorkoutPlace {
  id: string
  latitude: number
  longitude: number
  label: string | null
  lastVisitedAt: string
  sourceSessionIds: string[]
}

/** 장소 학습에 사용할 수 있는 위치의 최대 수평 오차 */
export const WORKOUT_PLACE_LEARNING_MAX_ACCURACY_METERS = 50
/** 새 표본을 기존 장소에 합칠 최대 거리 */
export const WORKOUT_PLACE_MERGE_DISTANCE_METERS = 30
/** iOS geofence 등록 한도에 맞춘 최대 학습 장소 수 */
export const WORKOUT_PLACE_MAX_COUNT = 20

/** 위치 유효성과 정확도를 검증해 장소 학습용 좌표 표본으로 변환 */
function getWorkoutPlaceSample(location: WorkoutLocation | null) {
  if (
    !location ||
    !isValidCoordinates(location.lat, location.lng) ||
    (location.accuracyMeters !== undefined &&
      (!Number.isFinite(location.accuracyMeters) ||
        location.accuracyMeters < 0 ||
        location.accuracyMeters > WORKOUT_PLACE_LEARNING_MAX_ACCURACY_METERS))
  ) {
    return null
  }

  return {
    latitude: location.lat,
    longitude: location.lng,
  }
}

/** 장소를 최근 방문순으로 정렬하고 등록 가능한 최대 개수로 제한 */
function sortByMostRecentVisit(places: LearnedWorkoutPlace[]) {
  return [...places]
    .sort((left, right) =>
      right.lastVisitedAt.localeCompare(left.lastVisitedAt),
    )
    .slice(0, WORKOUT_PLACE_MAX_COUNT)
}

/** 운동 한 건의 결과 위치를 기존 장소 목록에 반영 */
export function learnWorkoutPlaceFromSession({
  completedAt,
  location,
  places,
  sessionId,
}: {
  completedAt: string
  location: WorkoutLocation | null
  places: LearnedWorkoutPlace[]
  sessionId: string
}) {
  if (
    !sessionId ||
    getTimestampMsFromIso(completedAt) === null ||
    places.some((place) => place.sourceSessionIds.includes(sessionId))
  ) {
    return places
  }

  const sample = getWorkoutPlaceSample(location)
  if (!sample) {
    return places
  }

  const matchingPlace = places
    .map((place) => ({
      distanceMeters: getDistanceMeters(
        { lat: place.latitude, lng: place.longitude },
        { lat: sample.latitude, lng: sample.longitude },
      ),
      place,
    }))
    .filter(
      ({ distanceMeters }) =>
        distanceMeters <= WORKOUT_PLACE_MERGE_DISTANCE_METERS,
    )
    .sort((left, right) => left.distanceMeters - right.distanceMeters)[0]?.place

  if (!matchingPlace) {
    return sortByMostRecentVisit([
      ...places,
      {
        id: `workout-place-${sessionId}`,
        ...sample,
        label: null,
        lastVisitedAt: completedAt,
        sourceSessionIds: [sessionId],
      },
    ])
  }

  return sortByMostRecentVisit(
    places.map((place) =>
      place.id === matchingPlace.id
        ? {
            ...place,
            ...sample,
            lastVisitedAt: completedAt,
            sourceSessionIds: [...place.sourceSessionIds, sessionId],
          }
        : place,
    ),
  )
}

/** 완료 세션의 결과 위치로 장소 목록을 다시 구성 */
export function rebuildWorkoutPlacesFromSessions({
  previousPlaces,
  sessions,
}: {
  previousPlaces: LearnedWorkoutPlace[]
  sessions: Pick<
    StoredWorkoutSession,
    "completedAt" | "location" | "sessionId"
  >[]
}) {
  const previousLabels = new Map(
    previousPlaces.map((place) => [place.id, place.label]),
  )

  return [...sessions]
    .sort((left, right) => left.completedAt.localeCompare(right.completedAt))
    .reduce(
      (places, session) =>
        learnWorkoutPlaceFromSession({
          completedAt: session.completedAt,
          location: session.location,
          places,
          sessionId: session.sessionId,
        }),
      [] as LearnedWorkoutPlace[],
    )
    .map((place) => ({
      ...place,
      label: previousLabels.get(place.id) ?? null,
    }))
}
