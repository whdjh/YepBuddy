import { useCallback } from "react"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import { getStoredWorkoutSessionIdByDate } from "@/entities/workout-session"
import { useSummaryRefresh } from "./useSummaryRefresh"

export function useTodayCompleted() {
  const loadTodayCompleted = useCallback(async () => {
    const dateKey = getLocalDateKeyFromIso(new Date().toISOString())
    const sessionId = await getStoredWorkoutSessionIdByDate(dateKey)
    return sessionId !== null
  }, [])

  const { data } = useSummaryRefresh({
    initialData: false,
    load: loadTodayCompleted,
  })

  return data
}
