import { WORKOUT_LOCATION_LABEL_FORMAT_VERSION } from "./locationAddress"
import { getWorkoutLocationAddressLabel } from "./locationLabel"
import {
  disableWorkoutPlaceArrivalReminder,
  syncWorkoutPlaceArrivalReminder,
} from "./workoutPlaceArrivalReminder"
import {
  rebuildWorkoutPlacesFromSessions,
  type LearnedWorkoutPlace,
} from "./workoutPlaceLearning"
import { getAllStoredWorkoutSessions } from "../model/storedWorkoutSessionStorage"
import {
  getExcludedWorkoutPlaceSessionIds,
  getWorkoutPlaces,
  updateWorkoutPlaces,
} from "../model/workoutPlaceStorage"

let workoutPlaceLabelRefresh: Promise<LearnedWorkoutPlace[]> | null = null
let workoutPlaceLabelRefreshRequested = false

/** 현재 주소 포맷이 아닌 학습 장소 라벨을 순차적으로 다시 생성 */
async function refreshWorkoutPlaceLabelsInternal() {
  const places = await getWorkoutPlaces()
  const staleLabels = places.filter(
    (place) =>
      place.labelFormatVersion !== WORKOUT_LOCATION_LABEL_FORMAT_VERSION,
  )
  if (staleLabels.length === 0) {
    return places
  }

  const labelsById = new Map<
    string,
    { label: string; latitude: number; longitude: number }
  >()
  for (const place of staleLabels) {
    const label = await getWorkoutLocationAddressLabel({
      lat: place.latitude,
      lng: place.longitude,
    })
    if (label) {
      labelsById.set(place.id, {
        label,
        latitude: place.latitude,
        longitude: place.longitude,
      })
    }
  }

  return updateWorkoutPlaces((currentPlaces) =>
    currentPlaces.map((place) => {
      const resolved = labelsById.get(place.id)
      if (
        !resolved ||
        place.labelFormatVersion === WORKOUT_LOCATION_LABEL_FORMAT_VERSION ||
        place.latitude !== resolved.latitude ||
        place.longitude !== resolved.longitude
      ) {
        return place
      }

      return {
        ...place,
        label: resolved.label,
        labelFormatVersion: WORKOUT_LOCATION_LABEL_FORMAT_VERSION,
      }
    }),
  )
}

/** 동시에 요청된 장소 라벨 갱신을 한 번만 실행 */
export function refreshWorkoutPlaceLabels() {
  workoutPlaceLabelRefreshRequested = true
  if (workoutPlaceLabelRefresh) {
    return workoutPlaceLabelRefresh
  }

  workoutPlaceLabelRefresh = (async () => {
    let places: LearnedWorkoutPlace[] = []
    do {
      workoutPlaceLabelRefreshRequested = false
      places = await refreshWorkoutPlaceLabelsInternal()
    } while (workoutPlaceLabelRefreshRequested)
    return places
  })().finally(() => {
    workoutPlaceLabelRefresh = null
  })
  return workoutPlaceLabelRefresh
}

/** 기존 완료 세션의 결과 위치로 자동 학습 장소를 다시 구성 */
export async function rebuildWorkoutPlacesFromStoredSessions() {
  const places = await updateWorkoutPlaces(async (previousPlaces) => {
    const [excludedSessionIds, storedSessions] = await Promise.all([
      getExcludedWorkoutPlaceSessionIds(),
      getAllStoredWorkoutSessions(),
    ])
    const excludedSessionIdSet = new Set(excludedSessionIds)
    const sessions = storedSessions.filter(
      (session) => !excludedSessionIdSet.has(session.sessionId),
    )
    return rebuildWorkoutPlacesFromSessions({ previousPlaces, sessions })
  })

  void refreshWorkoutPlaceLabels().catch(() => undefined)
  return places
}

/** 결과 위치 재구성에 성공한 최신 장소만 geofence와 동기화 */
export async function rebuildAndSyncWorkoutPlaceArrivalReminder({
  allowPrompt = false,
}: {
  /** 권한이 없을 때 OS 권한 요청을 허용할지 여부 */
  allowPrompt?: boolean
} = {}) {
  try {
    await rebuildWorkoutPlacesFromStoredSessions()
    return await syncWorkoutPlaceArrivalReminder({ allowPrompt })
  } catch {
    await disableWorkoutPlaceArrivalReminder().catch(() => undefined)
    return false
  }
}
