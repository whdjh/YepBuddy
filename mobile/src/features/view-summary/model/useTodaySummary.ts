import { useCallback } from "react"
import { getLocalDateKey } from "@/shared/lib/date"
import { getWorkoutSessionSummaryDataForDate } from "@/entities/workout-session"
import {
  EMPTY_TODAY_SUMMARY,
  mergeTodaySummary,
  type TodaySummary,
} from "./todaySummary"
import { useSummaryRefresh } from "./useSummaryRefresh"

export function useTodaySummary() {
  const loadTodaySummary = useCallback(async () => {
    const dateKey = getLocalDateKey(new Date())
    const { storedSession, workouts } =
      await getWorkoutSessionSummaryDataForDate(dateKey)

    return mergeTodaySummary({
      hkWorkouts: workouts,
      storedSession,
    })
  }, [])

  return useSummaryRefresh<TodaySummary>({
    initialData: EMPTY_TODAY_SUMMARY,
    load: loadTodaySummary,
  })
}
