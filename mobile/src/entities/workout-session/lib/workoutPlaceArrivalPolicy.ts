import {
  getLocalDateKeyFromIso,
  getTimestampMsFromIso,
} from "@/shared/lib/date"

/** Enter geofence 반경과 알림 직전 검증에 함께 사용하는 도착 거리 */
export const WORKOUT_PLACE_ARRIVAL_MAX_DISTANCE_METERS = 50
/** 알림을 허용하는 최대 위치 오차 */
export const WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS = 20
/** 운동 장소 도착 알림 판정 입력 */
interface WorkoutPlaceArrivalPolicyInput {
  /** 현재 위치의 수평 정확도 */
  accuracyMeters: number | null
  /** 마지막 운동 완료 또는 알림 발송 시각 */
  blockedAt: string | null
  /** 등록 장소와 현재 위치 사이 거리 */
  distanceMeters: number
  /** 판정 기준 시각 */
  now: string
  /** 현재 운동 진행 상태 */
  phase: "idle" | "countdown" | "recording" | "paused" | "completed"
}

/** 위치, 운동 상태, 로컬 날짜를 기준으로 도착 알림 여부를 결정 */
export function shouldNotifyWorkoutPlaceArrival({
  accuracyMeters,
  blockedAt,
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

  if (!blockedAt) {
    return true
  }

  if (
    getTimestampMsFromIso(blockedAt) === null ||
    getTimestampMsFromIso(now) === null
  ) {
    return false
  }

  return getLocalDateKeyFromIso(blockedAt) !== getLocalDateKeyFromIso(now)
}
