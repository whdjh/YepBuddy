import { useCallback } from "react"
import { getLatestStoredWorkoutSession } from "@/entities/workout-session/model/sessionStorage"
import type { StoredWorkoutSession } from "@/entities/workout-session/model/types"
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
