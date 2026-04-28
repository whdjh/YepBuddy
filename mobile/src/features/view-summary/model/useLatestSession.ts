import { useCallback } from "react"
import {
  getLatestStoredWorkoutSession,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import { useSummaryRefresh } from "./useSummaryRefresh"

export function useLatestSession() {
  const loadLatestSession = useCallback(
    () => getLatestStoredWorkoutSession(),
    [],
  )

  return useSummaryRefresh<StoredWorkoutSession | null>({
    initialData: null,
    load: loadLatestSession,
  })
}
