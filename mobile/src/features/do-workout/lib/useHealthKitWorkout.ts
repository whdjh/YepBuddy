import { useCallback, useEffect, useMemo } from "react"
import {
  endWorkoutSession,
  pauseWorkoutSession,
  readLiveWorkoutStats,
  resumeWorkoutSession,
  startWorkoutSession,
  useWorkout,
} from "@/entities/workout-session"
import { startHealthKitWorkoutSync } from "./healthKitWorkoutSync"

export function useHealthKitWorkout() {
  const { state, setLiveStats } = useWorkout()

  useEffect(() => {
    if (state.phase !== "recording") {
      return
    }

    return startHealthKitWorkoutSync({
      readLiveWorkoutStats,
      setLiveStats,
      startWorkoutSession,
    })
  }, [setLiveStats, state.phase])

  const pauseWorkout = useCallback(
    () => pauseWorkoutSession().catch(() => undefined),
    [],
  )
  const resumeWorkout = useCallback(
    () => resumeWorkoutSession().catch(() => undefined),
    [],
  )
  const endWorkout = useCallback(
    (params: Parameters<typeof endWorkoutSession>[0]) =>
      endWorkoutSession(params).catch(() => false),
    [],
  )

  return useMemo(
    () => ({
      endWorkout,
      pauseWorkout,
      resumeWorkout,
    }),
    [endWorkout, pauseWorkout, resumeWorkout],
  )
}
