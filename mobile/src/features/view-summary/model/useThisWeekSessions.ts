import { useCallback } from "react"
import { getStoredWorkoutSessionsInRange } from "@/entities/workout-session/model/sessionStorage"
import type { StoredWorkoutSession } from "@/entities/workout-session/model/types"
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
