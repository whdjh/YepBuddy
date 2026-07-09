import type { WorkoutLiveStats } from "../model/types"
import {
  normalizeWorkoutLiveStats,
  type WorkoutMetricProvider,
} from "./workoutMetricsProvider"

function unavailable(): WorkoutLiveStats {
  return normalizeWorkoutLiveStats({
    source: "watchMirroredWorkout",
    status: "error",
    errorCode: "watch_provider_unavailable",
  })
}

// MEMO: 워치앱 나오면 만들기능
export const watchMirroredWorkoutProvider: WorkoutMetricProvider = {
  source: "watchMirroredWorkout",
  isAvailable: () => false,
  recover: async () => unavailable(),
  start: async () => unavailable(),
  pause: async () => unavailable(),
  resume: async () => unavailable(),
  end: async () => unavailable(),
  read: async () => unavailable(),
  subscribe: () => () => undefined,
}
