import type { WorkoutState } from "../model/workoutState"

export interface WorkoutLiveActivityTiming {
  elapsedMs: number
  isPaused: boolean
  timerPausedAt: string | null
  timerStartAt: string
}

function getTimestampMs(iso: string | null) {
  if (!iso) {
    return null
  }

  const timestamp = new Date(iso).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

/** 운동 화면 타이머와 같은 Live Activity 기준 시각 */
export function getWorkoutLiveActivityTiming(
  state: WorkoutState,
  nowMs = Date.now(),
): WorkoutLiveActivityTiming | null {
  const startedAtMs = getTimestampMs(state.startedAt)
  if (startedAtMs === null || !Number.isFinite(nowMs)) {
    return null
  }

  const pausedAtMs = getTimestampMs(state.pausedAt)
  const pausedDuration = Number.isFinite(state.pausedDuration)
    ? Math.max(state.pausedDuration, 0)
    : 0
  const isPaused = state.phase === "paused" && pausedAtMs !== null
  const displayNowMs = isPaused ? pausedAtMs : nowMs
  const currentPausedMs =
    isPaused && pausedAtMs !== null ? Math.max(nowMs - pausedAtMs, 0) : 0
  const elapsedMs = Math.max(
    0,
    nowMs - startedAtMs - pausedDuration - currentPausedMs,
  )
  const timerStartAtMs = displayNowMs - elapsedMs

  return {
    elapsedMs,
    isPaused,
    timerPausedAt: isPaused ? new Date(displayNowMs).toISOString() : null,
    timerStartAt: new Date(timerStartAtMs).toISOString(),
  }
}
