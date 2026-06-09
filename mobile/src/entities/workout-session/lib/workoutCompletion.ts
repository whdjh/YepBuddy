import type { WorkoutState } from "../model/workoutState"
import type {
  StoredWorkoutSession,
  WorkoutRoutineSubstitution,
} from "../model/types"
import { normalizeOptionalMetricCount } from "../model/metricNormalization"

type WorkoutCompletionState = Pick<WorkoutState, "pausedAt">
type CompletedWorkoutState = Pick<
  WorkoutState,
  | "activeKcal"
  | "bodyParts"
  | "cardioStartedAt"
  | "location"
  | "memo"
  | "sessionId"
  | "startedAt"
  | "totalKcal"
>

// 운동 중지 후 종료하면 중지 시각을 실제 완료 시각으로 사용해 대기 시간을 제외
export function getWorkoutCompletedAt(
  state: WorkoutCompletionState,
  now = () => new Date().toISOString(),
) {
  return state.pausedAt ?? now()
}

// 종료 시점의 진행 중 상태를 완료 세션 저장 형태로 변환
export function buildCompletedWorkoutSession(
  state: CompletedWorkoutState,
  completedAt: string,
  routineSubstitution: WorkoutRoutineSubstitution | null = null,
): StoredWorkoutSession | null {
  if (!state.sessionId || !state.startedAt) {
    return null
  }

  return {
    sessionId: state.sessionId,
    startedAt: state.startedAt,
    completedAt,
    cardioStartedAt: state.cardioStartedAt ?? null,
    activeKcal: normalizeOptionalMetricCount(state.activeKcal),
    averageHeartRate: null,
    totalKcal: normalizeOptionalMetricCount(state.totalKcal),
    healthKitWorkoutUUID: null,
    routineSubstitution,
    bodyParts: state.bodyParts,
    memo: state.memo,
    location: state.location,
  }
}
