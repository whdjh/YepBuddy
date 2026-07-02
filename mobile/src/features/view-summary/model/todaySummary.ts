import type {
  StoredWorkoutSession,
  WorkoutBodyPartSet,
  WorkoutHealthKitWorkout,
} from "@/entities/workout-session"
import {
  findWorkoutSummaryForSession,
  getStoredWorkoutSessionDurationMinutes,
  getWorkoutSessionKcal,
} from "@/entities/workout-session"

/** 메인 요약 화면에서 오늘 카드/통계가 함께 쓰는 계산 결과 타입 */
export interface TodaySummary {
  bodyParts: WorkoutBodyPartSet[]
  hkWorkouts: WorkoutHealthKitWorkout[]
  sessionKcal: number | null
  storedSession: StoredWorkoutSession | null
  totalDuration: number
  totalKcal: number
  totalSets: number
}

/** 오늘 데이터가 없거나 로딩 실패일 때 사용하는 기본값 */
export const EMPTY_TODAY_SUMMARY: TodaySummary = {
  bodyParts: [],
  hkWorkouts: [],
  sessionKcal: null,
  storedSession: null,
  totalDuration: 0,
  totalKcal: 0,
  totalSets: 0,
}

/** 로컬 세션 메타와 HealthKit 운동 요약을 합쳐 오늘 통계 형태로 변환 */
export function mergeTodaySummary(params: {
  hkWorkouts: WorkoutHealthKitWorkout[]
  storedSession: StoredWorkoutSession | null
}): TodaySummary {
  const bodyParts = params.storedSession?.bodyParts ?? []
  const totalSets = bodyParts.reduce((sum, item) => sum + item.setCount, 0)
  const totalDuration = params.hkWorkouts.reduce(
    (sum, workout) => sum + workout.duration,
    0,
  )
  const fallbackDuration =
    params.storedSession != null
      ? getStoredWorkoutSessionDurationMinutes(params.storedSession) * 60
      : 0
  const totalKcal = params.hkWorkouts.reduce(
    (sum, workout) => sum + workout.kcal,
    0,
  )
  const sessionWorkout =
    params.storedSession != null
      ? findWorkoutSummaryForSession(params.storedSession, params.hkWorkouts)
      : null
  const sessionKcal =
    params.storedSession != null
      ? getWorkoutSessionKcal({
          healthKitKcal: sessionWorkout?.kcal,
          storedActiveKcal: params.storedSession.activeKcal,
        })
      : null

  return {
    bodyParts,
    hkWorkouts: params.hkWorkouts,
    sessionKcal,
    storedSession: params.storedSession,
    totalDuration: totalDuration > 0 ? totalDuration : fallbackDuration,
    totalKcal,
    totalSets,
  }
}
