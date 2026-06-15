import { getTimeDistanceMs } from "@/shared/lib/date"

const WORKOUT_START_MATCH_TOLERANCE_MS = 5 * 60 * 1000

interface WorkoutSummaryLike {
  startDate: string
}

interface StoredSessionLike {
  sessionId: string
  startedAt: string
}

interface SessionListKcalInput {
  healthKitKcal: number | null | undefined
  storedActiveKcal: number | null | undefined
}

export function findWorkoutSummaryForSession<
  TWorkout extends WorkoutSummaryLike,
>(session: StoredSessionLike, workouts: TWorkout[]) {
  const exactWorkout = workouts.find(
    (workout) =>
      workout.startDate === session.sessionId ||
      workout.startDate === session.startedAt,
  )

  if (exactWorkout) {
    return exactWorkout
  }

  const matchedWorkout = workouts
    .map((workout) => ({
      distanceMs: Math.min(
        getTimeDistanceMs(workout.startDate, session.sessionId),
        getTimeDistanceMs(workout.startDate, session.startedAt),
      ),
      workout,
    }))
    .filter(({ distanceMs }) => distanceMs <= WORKOUT_START_MATCH_TOLERANCE_MS)
    .sort((left, right) => left.distanceMs - right.distanceMs)[0]

  return matchedWorkout?.workout ?? null
}

export function getSessionListKcal({
  healthKitKcal,
  storedActiveKcal,
}: SessionListKcalInput) {
  return healthKitKcal ?? storedActiveKcal ?? null
}
