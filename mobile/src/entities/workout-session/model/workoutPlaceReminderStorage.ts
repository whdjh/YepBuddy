import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLocalDateKey } from "@/shared/lib/date"
import { isValidCoordinates } from "@/shared/lib/geo"
import { parseJsonOrNull } from "@/shared/lib/json"
import type { StoredWorkoutSession, WorkoutLocation } from "./types"

export const WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY =
  "yb:workout-place-reminder:enabled"
export const WORKOUT_PLACE_REMINDER_PLACES_STORAGE_KEY =
  "yb:workout-place-reminder:places"
export const WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY =
  "yb:workout-place-reminder:pending-prompt"

const PLACE_MATCH_RADIUS_METERS = 120
export const WORKOUT_PLACE_REMINDER_MAX_GEOFENCE_PLACES = 20

export interface WorkoutPlaceReminderPlace {
  id: string
  latitude: number
  longitude: number
  workoutCount: number
  latestWorkoutAt: string
  lastNotifiedDateKey: string | null
}

export interface PendingWorkoutPlaceReminderPrompt {
  placeId: string
  createdAt: string
}

/** 저장된 장소 후보를 현재 알림 장소 타입으로 정규화 */
function normalizeWorkoutPlaceReminderPlace(
  value: unknown,
): WorkoutPlaceReminderPlace | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const place = value as Partial<WorkoutPlaceReminderPlace>
  if (
    typeof place.id !== "string" ||
    typeof place.latitude !== "number" ||
    typeof place.longitude !== "number" ||
    !isValidCoordinates(place.latitude, place.longitude) ||
    typeof place.workoutCount !== "number" ||
    !Number.isFinite(place.workoutCount) ||
    typeof place.latestWorkoutAt !== "string"
  ) {
    return null
  }

  return {
    id: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    workoutCount: Math.max(0, Math.floor(place.workoutCount)),
    latestWorkoutAt: place.latestWorkoutAt,
    lastNotifiedDateKey:
      typeof place.lastNotifiedDateKey === "string"
        ? place.lastNotifiedDateKey
        : null,
  }
}

/** 운동 장소 도착 알림 활성화 저장값을 조회한다. */
export async function getWorkoutPlaceReminderEnabled() {
  return (
    (await AsyncStorage.getItem(
      WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY,
    )) === "true"
  )
}

/** 운동 장소 도착 알림 활성화 저장값을 저장한다. */
export async function setWorkoutPlaceReminderEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY,
    enabled ? "true" : "false",
  )
}

/** 저장된 반복 운동 장소 목록을 조회한다. */
export async function getWorkoutPlaceReminderPlaces() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_PLACES_STORAGE_KEY,
  )

  if (!value) {
    return []
  }

  const parsed = parseJsonOrNull<unknown>(value)
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
    .map(normalizeWorkoutPlaceReminderPlace)
    .filter((place): place is WorkoutPlaceReminderPlace => place !== null)
}

/** 반복 운동 장소 목록을 최신 후보 우선순위로 정렬해 저장한다. */
export async function saveWorkoutPlaceReminderPlaces(
  places: WorkoutPlaceReminderPlace[],
) {
  const normalizedPlaces = places
    .map(normalizeWorkoutPlaceReminderPlace)
    .filter((place): place is WorkoutPlaceReminderPlace => place !== null)

  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_PLACES_STORAGE_KEY,
    JSON.stringify(sortWorkoutPlaceReminderPlaces(normalizedPlaces)),
  )
}

/** 완료 세션 위치를 기존 반복 장소 목록에 반영한다. */
export async function upsertWorkoutPlaceReminderPlaceFromSession(
  session: StoredWorkoutSession,
) {
  if (!session.location) {
    return
  }

  const places = await getWorkoutPlaceReminderPlaces()
  await saveWorkoutPlaceReminderPlaces(
    upsertWorkoutPlaceReminderPlace(places, session),
  )
}

/** 완료 세션 전체를 기준으로 반복 장소 히스토리를 다시 만든다. */
export async function rebuildWorkoutPlaceReminderPlacesFromSessions(
  sessions: StoredWorkoutSession[],
) {
  const places = sessions
    .filter((session) => session.location)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .reduce<WorkoutPlaceReminderPlace[]>(
      (currentPlaces, session) =>
        upsertWorkoutPlaceReminderPlace(currentPlaces, session),
      [],
    )

  await saveWorkoutPlaceReminderPlaces(places)
  return places
}

/** OS geofence에 등록할 장소 후보만 반환한다. */
export async function getWorkoutPlaceReminderGeofencePlaces() {
  return selectWorkoutPlaceReminderGeofencePlaces(
    await getWorkoutPlaceReminderPlaces(),
  )
}

/** 알림 탭 후 운동 시작 확인 Alert를 띄우기 위한 pending prompt를 조회한다. */
export async function getPendingWorkoutPlaceReminderPrompt() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
  )

  if (!value) {
    return null
  }

  const parsed =
    parseJsonOrNull<Partial<PendingWorkoutPlaceReminderPrompt>>(value)
  if (
    !parsed ||
    typeof parsed.placeId !== "string" ||
    typeof parsed.createdAt !== "string"
  ) {
    return null
  }

  return {
    placeId: parsed.placeId,
    createdAt: parsed.createdAt,
  }
}

/** 알림 탭 후 운동 시작 확인 Alert를 띄우기 위한 pending prompt를 저장한다. */
export async function savePendingWorkoutPlaceReminderPrompt(
  prompt: PendingWorkoutPlaceReminderPrompt,
) {
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
    JSON.stringify(prompt),
  )
}

/** 처리한 pending prompt를 삭제한다. */
export async function clearPendingWorkoutPlaceReminderPrompt() {
  await AsyncStorage.removeItem(WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY)
}

/** 같은 장소 하루 1회 알림 쿨다운을 기록한다. */
export async function markWorkoutPlaceReminderNotified(
  placeId: string,
  dateKey: string,
) {
  const places = await getWorkoutPlaceReminderPlaces()
  await saveWorkoutPlaceReminderPlaces(
    places.map((place) =>
      place.id === placeId
        ? { ...place, lastNotifiedDateKey: dateKey }
        : place,
    ),
  )
}

/** 완료 세션 위치를 반복 장소 후보에 추가하거나 가까운 기존 장소에 병합 */
function upsertWorkoutPlaceReminderPlace(
  places: WorkoutPlaceReminderPlace[],
  session: StoredWorkoutSession,
) {
  const location = session.location
  if (!location || !isValidCoordinates(location.lat, location.lng)) {
    return places
  }

  const placeIndex = places.findIndex(
    (place) => getDistanceMeters(place, location) <= PLACE_MATCH_RADIUS_METERS,
  )

  if (placeIndex === -1) {
    return [
      ...places,
      {
        id: session.sessionId,
        latitude: location.lat,
        longitude: location.lng,
        workoutCount: 1,
        latestWorkoutAt: session.completedAt,
        lastNotifiedDateKey: null,
      },
    ]
  }

  return places.map((place, index) => {
    if (index !== placeIndex) {
      return place
    }

    const nextWorkoutCount = place.workoutCount + 1
    return {
      ...place,
      latitude:
        (place.latitude * place.workoutCount + location.lat) / nextWorkoutCount,
      longitude:
        (place.longitude * place.workoutCount + location.lng) /
        nextWorkoutCount,
      workoutCount: nextWorkoutCount,
      latestWorkoutAt:
        session.completedAt > place.latestWorkoutAt
          ? session.completedAt
          : place.latestWorkoutAt,
    }
  })
}

/** 충분히 반복 방문한 장소만 geofence 등록 후보로 고른다. */
function selectWorkoutPlaceReminderGeofencePlaces(
  places: WorkoutPlaceReminderPlace[],
) {
  return sortWorkoutPlaceReminderPlaces(
    places.filter((place) => place.workoutCount >= 2),
  ).slice(0, WORKOUT_PLACE_REMINDER_MAX_GEOFENCE_PLACES)
}

/** 최근 운동일 우선, 같은 날이면 방문 횟수 우선으로 정렬 */
function sortWorkoutPlaceReminderPlaces(places: WorkoutPlaceReminderPlace[]) {
  return [...places].sort((a, b) => {
    const latestWorkoutComparison = b.latestWorkoutAt.localeCompare(
      a.latestWorkoutAt,
    )

    if (latestWorkoutComparison !== 0) {
      return latestWorkoutComparison
    }

    return b.workoutCount - a.workoutCount
  })
}

/** 두 좌표 사이의 직선 거리를 haversine 공식으로 계산 */
function getDistanceMeters(
  a: Pick<WorkoutPlaceReminderPlace, "latitude" | "longitude">,
  b: WorkoutLocation,
) {
  const earthRadiusMeters = 6371000
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.lat)
  const deltaLat = toRadians(b.lat - a.latitude)
  const deltaLng = toRadians(b.lng - a.longitude)

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2)

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

/** 각도 값을 삼각함수 계산에 필요한 라디안으로 변환 */
function toRadians(value: number) {
  return (value * Math.PI) / 180
}

/** 오늘 날짜를 운동 장소 알림 쿨다운 키 형식으로 반환 */
export function getWorkoutPlaceReminderTodayDateKey() {
  return getLocalDateKey(new Date())
}
