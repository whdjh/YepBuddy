import { useCallback, useMemo } from "react"
import {
  getWorkoutSummariesForMonth,
  type RoutineCycleProgress,
  type WorkoutHealthKitWorkout,
} from "@/entities/workout-session"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import { useSummaryRefresh } from "./useSummaryRefresh"

const EMPTY_WORKOUT_SUMMARIES: WorkoutHealthKitWorkout[] = []

interface MonthEntry {
  /** HealthKit 월별 요약 조회에 사용할 1-12 월 값 */
  month: number
  /** HealthKit 월별 요약 조회에 사용할 4자리 연도 */
  year: number
}

/** 완료된 루틴 슬롯들이 속한 연/월 목록을 중복 없이 추출 */
function getRoutineCycleSessionMonthEntries(
  progress: RoutineCycleProgress,
): MonthEntry[] {
  const monthEntriesByKey = new Map<string, MonthEntry>()

  progress.slots.forEach((slot) => {
    if (slot.status !== "completed" && slot.status !== "substituted") {
      return
    }

    const dateKey = slot.matchedSession
      ? getLocalDateKeyFromIso(slot.matchedSession.startedAt)
      : ""
    const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(dateKey)

    if (!match) {
      return
    }

    const year = Number(match[1])
    const month = Number(match[2])
    const key = `${year}-${String(month).padStart(2, "0")}`

    monthEntriesByKey.set(key, { month, year })
  })

  return [...monthEntriesByKey.values()]
}

/** 분할 루틴 카드의 완료 세션 kcal 보강에 필요한 HealthKit 월별 요약 */
export function useRoutineCycleWorkoutSummaries(
  progress: RoutineCycleProgress,
) {
  const monthEntries = useMemo(
    () => getRoutineCycleSessionMonthEntries(progress),
    [progress],
  )

  const loadRoutineCycleWorkoutSummaries = useCallback(async () => {
    if (monthEntries.length === 0) {
      return EMPTY_WORKOUT_SUMMARIES
    }

    const summariesByMonth = await Promise.all(
      monthEntries.map(({ year, month }) =>
        getWorkoutSummariesForMonth(year, month),
      ),
    )

    return summariesByMonth.flat()
  }, [monthEntries])

  return useSummaryRefresh<WorkoutHealthKitWorkout[]>({
    initialData: EMPTY_WORKOUT_SUMMARIES,
    load: loadRoutineCycleWorkoutSummaries,
  })
}
