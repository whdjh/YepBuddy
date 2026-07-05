import { useCallback, useMemo } from "react"
import {
  getWorkoutSummariesForSessions,
  type RoutineCycleProgress,
  type StoredWorkoutSession,
  type WorkoutHealthKitWorkout,
} from "@/entities/workout-session"
import { useSummaryRefresh } from "./useSummaryRefresh"

const EMPTY_WORKOUT_SUMMARIES: WorkoutHealthKitWorkout[] = []

/** 완료/대체 루틴 슬롯에 매칭된 저장 세션 목록 */
function getRoutineCycleMatchedSessions(
  progress: RoutineCycleProgress,
): StoredWorkoutSession[] {
  const matchedSessions: StoredWorkoutSession[] = []

  progress.slots.forEach((slot) => {
    if (slot.status !== "completed" && slot.status !== "substituted") {
      return
    }

    if (!slot.matchedSession) {
      return
    }

    matchedSessions.push(slot.matchedSession)
  })

  return matchedSessions
}

/** 분할 루틴 카드의 완료 세션 kcal 보강에 필요한 HealthKit 월별 요약 */
export function useRoutineCycleWorkoutSummaries(
  progress: RoutineCycleProgress,
) {
  const matchedSessions = useMemo(
    () => getRoutineCycleMatchedSessions(progress),
    [progress],
  )

  const loadRoutineCycleWorkoutSummaries = useCallback(async () => {
    if (matchedSessions.length === 0) {
      return EMPTY_WORKOUT_SUMMARIES
    }

    return getWorkoutSummariesForSessions(matchedSessions)
  }, [matchedSessions])

  return useSummaryRefresh<WorkoutHealthKitWorkout[]>({
    initialData: EMPTY_WORKOUT_SUMMARIES,
    load: loadRoutineCycleWorkoutSummaries,
  })
}
