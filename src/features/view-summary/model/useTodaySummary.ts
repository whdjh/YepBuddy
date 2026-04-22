import { useCallback } from "react"
import { getLocalDateKey } from "@/shared/lib/date"
import {
  getStoredWorkoutSession,
  getStoredWorkoutSessionIdByDate,
  getWorkoutSummariesForDate,
} from "@/entities/workout-session"
import {
  EMPTY_TODAY_SUMMARY,
  mergeTodaySummary,
  type TodaySummary,
} from "./todaySummary"
import { useSummaryRefresh } from "./useSummaryRefresh"

export function useTodaySummary() {
  const loadTodaySummary = useCallback(async () => {
    const dateKey = getLocalDateKey(new Date())
    const [sessionId, hkWorkouts] = await Promise.all([
      getStoredWorkoutSessionIdByDate(dateKey),
      getWorkoutSummariesForDate(dateKey),
    ])
    const storedSession = sessionId
      ? await getStoredWorkoutSession(sessionId)
      : null

    return mergeTodaySummary({
      hkWorkouts,
      storedSession,
    })
  }, [])

  return useSummaryRefresh<TodaySummary>({
    initialData: EMPTY_TODAY_SUMMARY,
    load: loadTodaySummary,
  })
}
