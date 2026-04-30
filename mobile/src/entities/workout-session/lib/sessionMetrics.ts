import type { StoredWorkoutSession } from "../model/types"

// 저장된 운동 세션의 총 세트 수를 계산
export function getStoredWorkoutSessionSetCount(
  session: StoredWorkoutSession,
) {
  return session.bodyParts.reduce((sum, item) => sum + item.setCount, 0)
}

// 저장된 운동 세션의 진행 시간을 분 단위로 계산
export function getStoredWorkoutSessionDurationMinutes(
  session: StoredWorkoutSession,
) {
  const startedAtMs = new Date(session.startedAt).getTime()
  const completedAtMs = new Date(session.completedAt).getTime()

  if (Number.isNaN(startedAtMs) || Number.isNaN(completedAtMs)) {
    return 0
  }

  return Math.max(0, Math.round((completedAtMs - startedAtMs) / 60000))
}
