import type { WorkoutState } from "@/entities/workout-session/model/workoutState"

export function calculateWorkoutElapsedMs(state: WorkoutState, nowMs: number) {
  if (!state.startedAt) {
    return 0
  }

  const startedAtMs = new Date(state.startedAt).getTime()
  const pausedSegmentMs = state.pausedAt
    ? nowMs - new Date(state.pausedAt).getTime()
    : 0

  // 시작 시각부터 지난 시간에서 누적 일시정지 시간과 현재 pause 구간을 제외
  return Math.max(
    0,
    nowMs - startedAtMs - state.pausedDuration - Math.max(pausedSegmentMs, 0),
  )
}
