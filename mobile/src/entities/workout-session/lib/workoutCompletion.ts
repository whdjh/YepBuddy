import type { WorkoutState } from "../model/workoutState"

type WorkoutCompletionState = Pick<WorkoutState, "pausedAt">

// 운동 중지 후 종료하면 중지 시각을 실제 완료 시각으로 사용해 대기 시간을 제외
export function getWorkoutCompletedAt(
  state: WorkoutCompletionState,
  now = () => new Date().toISOString(),
) {
  return state.pausedAt ?? now()
}
