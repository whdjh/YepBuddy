import { formatWorkoutLocationLabel } from "./locationLabel"
import {
  disableWorkoutPlaceArrivalReminder,
  syncWorkoutPlaceArrivalReminder,
} from "./workoutPlaceArrivalReminder"
import { rebuildWorkoutPlacesFromSessions } from "./workoutPlaceLearning"
import { getAllStoredWorkoutSessions } from "../model/storedWorkoutSessionStorage"
import {
  getExcludedWorkoutPlaceSessionIds,
  getWorkoutPlaces,
  updateWorkoutPlaces,
} from "../model/workoutPlaceStorage"

/** 역지오코딩으로 라벨이 없는 학습 장소의 표시 이름을 보강 */
async function fillMissingWorkoutPlaceLabels() {
  const places = await getWorkoutPlaces()
  const missingLabels = places.filter((place) => !place.label)
  if (missingLabels.length === 0) {
    return
  }

  const labels = await Promise.all(
    missingLabels.map(async (place) => ({
      id: place.id,
      label: await formatWorkoutLocationLabel({
        lat: place.latitude,
        lng: place.longitude,
      }),
    })),
  )
  const labelsById = new Map(labels.map(({ id, label }) => [id, label]))

  await updateWorkoutPlaces((currentPlaces) =>
    currentPlaces.map((place) => ({
      ...place,
      label: place.label ?? labelsById.get(place.id) ?? null,
    })),
  )
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

  void fillMissingWorkoutPlaceLabels().catch(() => undefined)
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
