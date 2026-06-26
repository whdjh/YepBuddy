import { getTimeDistanceMs } from "@/shared/lib/date"

const WORKOUT_START_MATCH_TOLERANCE_MS = 5 * 60 * 1000

interface WorkoutSummaryLike {
  /** HealthKit workout의 시작 시각 ISO 문자열 */
  startDate: string
}

interface StoredSessionLike {
  /** 저장 세션 식별자 */
  sessionId: string
  /** 앱에 저장된 운동 시작 시각 ISO 문자열 */
  startedAt: string
}

interface SessionKcalInput {
  /** HealthKit workout에서 읽은 활동 칼로리 */
  healthKitKcal: number | null | undefined
  /** 앱 저장 세션에 남아 있는 활동 칼로리 fallback */
  storedActiveKcal: number | null | undefined
}

/** 저장 세션과 같은 HealthKit workout 요약을 시작 시각 기준 */
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

/** 화면에 표시할 kcal 값을 HealthKit 값 우선, 저장 세션 값 fallback 순서 */
export function getWorkoutSessionKcal({
  healthKitKcal,
  storedActiveKcal,
}: SessionKcalInput) {
  return healthKitKcal ?? storedActiveKcal ?? null
}
