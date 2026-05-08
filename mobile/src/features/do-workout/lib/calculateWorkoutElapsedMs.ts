import type { WorkoutState } from "@/entities/workout-session"

export function calculateWorkoutElapsedMs(state: WorkoutState, nowMs: number) {
  if (!state.startedAt || !Number.isFinite(nowMs)) {
    return 0
  }

  const startedAtMs = new Date(state.startedAt).getTime()
  if (!Number.isFinite(startedAtMs)) {
    return 0
  }

  const pausedAtMs = state.pausedAt ? new Date(state.pausedAt).getTime() : null
  const pausedSegmentMs =
    pausedAtMs != null && Number.isFinite(pausedAtMs)
      ? nowMs - pausedAtMs
    : 0
  const pausedDuration = Number.isFinite(state.pausedDuration)
    ? state.pausedDuration
    : 0

  // 시작 시각부터 지난 시간에서 누적 일시정지 시간과 현재 pause 구간을 제외
  return Math.max(
    0,
    nowMs - startedAtMs - pausedDuration - Math.max(pausedSegmentMs, 0),
  )
}
