import {
  getLocalDateKeyFromIso,
  getTimestampMsFromIso,
} from "@/shared/lib/date"

/** 알림을 허용하는 최대 실제 도착 거리 */
export const WORKOUT_PLACE_ARRIVAL_MAX_DISTANCE_METERS = 20
/** 알림을 허용하는 최대 위치 오차 */
export const WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS = 20
/** 도착으로 확정하기 위해 필요한 연속 위치 판정 횟수 */
export const WORKOUT_PLACE_ARRIVAL_REQUIRED_MATCH_COUNT = 2
/** geofence 진입 후 실제 도착을 추적할 최대 시간 */
export const WORKOUT_PLACE_ARRIVAL_TRACKING_DURATION_MS = 5 * 60 * 1000
/** 가까운 출발을 감지할 내부 geofence 반경 */
export const WORKOUT_PLACE_INNER_GEOFENCE_RADIUS_METERS = 50
/** 먼 출발에서 위치 추적을 먼저 시작할 외곽 geofence 반경 */
export const WORKOUT_PLACE_OUTER_GEOFENCE_RADIUS_METERS = 150
/** iOS의 앱당 region 20개 제한에 맞춘 이중 geofence 장소 수 */
export const WORKOUT_PLACE_GEOFENCED_MAX_COUNT = 10
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
  if (!canNotifyWorkoutPlaceArrivalToday({ blockedAt, now, phase })) {
    return false
  }

  return !(
    accuracyMeters === null ||
    !Number.isFinite(accuracyMeters) ||
    accuracyMeters < 0 ||
    accuracyMeters > WORKOUT_PLACE_ARRIVAL_MAX_ACCURACY_METERS ||
    !Number.isFinite(distanceMeters) ||
    distanceMeters < 0 ||
    distanceMeters > WORKOUT_PLACE_ARRIVAL_MAX_DISTANCE_METERS
  )
}

/** 운동 상태와 당일 차단 여부만으로 도착 추적 가능 여부를 결정 */
export function canNotifyWorkoutPlaceArrivalToday({
  blockedAt,
  now,
  phase,
}: Pick<
  WorkoutPlaceArrivalPolicyInput,
  "blockedAt" | "now" | "phase"
>) {
  if (phase === "countdown" || phase === "recording" || phase === "paused") {
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
