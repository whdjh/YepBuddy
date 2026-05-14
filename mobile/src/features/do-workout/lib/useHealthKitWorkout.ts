import { useCallback, useEffect, useMemo } from "react"
import {
  endWorkoutSession,
  discardWorkoutSession,
  pauseWorkoutSession,
  readLiveWorkoutStats,
  resumeWorkoutSession,
  startWorkoutSession,
  subscribeLiveWorkoutStats,
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
      subscribeLiveWorkoutStats,
      workoutStartedAt: state.startedAt,
    })
  }, [setLiveStats, state.phase, state.startedAt])

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
  const discardWorkout = useCallback(
    () => discardWorkoutSession().catch(() => false),
    [],
  )

  return useMemo(
    () => ({
      discardWorkout,
      endWorkout,
      pauseWorkout,
      resumeWorkout,
    }),
    [discardWorkout, endWorkout, pauseWorkout, resumeWorkout],
  )
}
