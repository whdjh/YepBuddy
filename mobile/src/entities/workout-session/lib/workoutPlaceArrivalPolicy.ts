import { getTimestampMsFromIso } from "@/shared/lib/date"

/** 알림을 허용하는 최대 실제 거리 */
export const WORKOUT_PLACE_ARRIVAL_MAX_DISTANCE_METERS = 20
/** 알림을 허용하는 최대 위치 오차 */
export const WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS = 20
/** 등록, 운동 완료, 알림 성공 후 재알림 제한 시간 */
export const WORKOUT_PLACE_ARRIVAL_COOLDOWN_MS = 12 * 60 * 60 * 1000

/** 운동 장소 도착 알림 판정 입력 */
interface WorkoutPlaceArrivalPolicyInput {
  /** 현재 위치의 수평 정확도 */
  accuracyMeters: number | null
  /** 마지막 cooldown 시작 시각 */
  cooldownStartedAt: string | null
  /** 등록 장소와 현재 위치 사이 거리 */
  distanceMeters: number
  /** 판정 기준 시각 */
  now: string
  /** 현재 운동 진행 상태 */
  phase: "idle" | "countdown" | "recording" | "paused" | "completed"
}

/** 위치, 운동 상태, cooldown을 기준으로 도착 알림 여부를 결정 */
export function shouldNotifyWorkoutPlaceArrival({
  accuracyMeters,
  cooldownStartedAt,
  distanceMeters,
  now,
  phase,
}: WorkoutPlaceArrivalPolicyInput) {
  if (phase === "countdown" || phase === "recording" || phase === "paused") {
    return false
  }

  if (
    accuracyMeters === null ||
    !Number.isFinite(accuracyMeters) ||
    accuracyMeters < 0 ||
    accuracyMeters > WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS ||
    !Number.isFinite(distanceMeters) ||
    distanceMeters < 0 ||
    distanceMeters > WORKOUT_PLACE_ARRIVAL_MAX_DISTANCE_METERS
  ) {
    return false
  }

  if (!cooldownStartedAt) {
    return false
  }

  const cooldownStartedAtMs = getTimestampMsFromIso(cooldownStartedAt)
  const nowMs = getTimestampMsFromIso(now)
  return (
    cooldownStartedAtMs !== null &&
    nowMs !== null &&
    nowMs - cooldownStartedAtMs >= WORKOUT_PLACE_ARRIVAL_COOLDOWN_MS
  )
}
