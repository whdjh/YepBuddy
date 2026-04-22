import { useCallback } from "react"
import {
  getStoredWorkoutSessionsInRange,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"
import { useSummaryRefresh } from "./useSummaryRefresh"

export function useThisWeekSessions() {
  const loadThisWeekSessions = useCallback(async () => {
    const { startDateKey, endDateKey } = getThisWeekDateRange()
    return getStoredWorkoutSessionsInRange(startDateKey, endDateKey)
  }, [])

  return useSummaryRefresh<StoredWorkoutSession[]>({
    initialData: [],
    load: loadThisWeekSessions,
  })
}
