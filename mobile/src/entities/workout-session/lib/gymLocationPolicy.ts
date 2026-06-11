import { getTimestampMsFromIso } from "@/shared/lib/date"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"

/** 장소별 위치 정책에서 쓰는 장소 상태 분류 */
export type GymContext =
  /** 샘플이 부족해 장소 특성을 아직 확정하지 못한 상태 */
  | "UNKNOWN"
  /** 주변 체류 클러스터나 큰 GPS 노이즈가 감지되지 않은 일반 장소 */
  | "NORMAL"
  /** gym 근처에 집/회사/학교처럼 반복 체류하는 위치가 있는 장소 */
  | "FREQUENT_PLACE_NEAR_GYM"
  /** GPS 정확도 저하나 좌표 튐이 반복되는 장소 */
  | "HIGH_NOISE_PLACE"

/** 반복 운동 장소 후보 */
export interface GymPlace {
  /** 장소 식별자. 기존 반복 장소 저장소의 place id와 동일 */
  id: string
  /** 장소 중심 위도 */
  latitude: number
  /** 장소 중심 경도 */
  longitude: number
  /** 이 장소로 병합된 완료 운동 횟수 */
  workoutCount: number
  /** 이 장소에서 마지막으로 완료한 운동 시각 */
  latestWorkoutAt: string
}

/** policy engine이 판단에 사용하는 위치 샘플 */
export interface GymLocationSample {
  id: string
  /** 샘플이 매칭된 반복 운동 장소 id */
  placeId: string
  /** 샘플 위도 */
  lat: number
  /** 샘플 경도 */
  lng: number
  /** 가장 가까운 place를 안정적으로 고를 수 없으면 policy 판단에서 제외 */
  ambiguous?: boolean
  /** OS가 제공한 위치 정확도(m). null이면 정확도 정보가 없는 샘플 */
  accuracyM: number | null
  /** 샘플 좌표와 gym center 사이 거리(m). orchestration에서 계산 */
  distanceToGymM: number
  /** 샘플 기록 시각 */
  recordedAt: string
  /** 샘플이 들어온 경로 */
  source:
    /** OS geofence enter 이벤트 처리 중 얻은 샘플 */
    | "geofence-enter"
    /** OS geofence exit 이벤트 처리 중 얻은 샘플 */
    | "geofence-exit"
    /** 앱이 active 상태로 돌아왔을 때 얻은 샘플 */
    | "app-active"
    /** 운동 시작 시점에 얻은 샘플 */
    | "workout-start"
    /** 운동 중 active 화면 확인 시점에 얻은 샘플 */
    | "workout-active-check"
    /** optional background location batch에서 정규화한 샘플 */
    | "background-location-batch"
}

/** 장소별 오탐 위험 context */
export interface GymPlaceContext {
  /** context가 적용되는 반복 운동 장소 id */
  placeId: string
  /** 현재 장소의 정책 분류 */
  context: GymContext
  /** context 계산 신뢰도 */
  confidence: number
  /** gym 주변에 반복 체류 클러스터가 있으면 그 중심 좌표 */
  frequentPlaceLocation: { lat: number; lng: number } | null
  /** 위치 노이즈 점수. 현재 policy는 context 분류 결과를 우선 사용 */
  highNoiseScore: number
  /** context가 마지막으로 계산된 시각 */
  updatedAt: string
}

/** 도착/종료 알림 cooldown 상태 */
export interface GymLocationPolicyCooldowns {
  /** 마지막 도착 알림 시각 */
  arrivalGlobalLastNotifiedAt: string | null
  /** place별 마지막 도착 알림 시각 */
  arrivalLastNotifiedAtByPlaceId: Record<string, string>
  /** 마지막 종료 알림 시각 */
  exitGlobalLastNotifiedAt: string | null
  /** session별 마지막 종료 알림 시각 */
  exitLastNotifiedAtBySessionId: Record<string, string>
}

/** 순수 policy 함수 입력값 */
export interface GymPolicyInput {
  /** 평가 대상 반복 운동 장소 */
  place: GymPlace
  /** 평가 대상 장소의 context */
  context: GymPlaceContext
  /** 이번 평가를 트리거한 현재 위치 샘플 */
  currentLocation: GymLocationSample | null
  /** 같은 place에 대해 저장된 최근 유효 후보 샘플 */
  recentSamples: GymLocationSample[]
  /** 현재 운동 스냅샷 */
  activeWorkout: {
    /** 현재 운동 phase */
    phase: "idle" | "countdown" | "recording" | "paused" | "completed"
    /** 진행 중 세션 id */
    sessionId: string | null
    /** 운동 시작 시각 */
    startedAt: string | null
    /** 운동 시작 위치 */
    location: { lat: number; lng: number } | null
  }
  /** 도착/종료 알림 cooldown 상태 */
  cooldowns: GymLocationPolicyCooldowns
  /** 평가 기준 시각 */
  now: string
}

/** policy 함수 판단 결과 */
export interface GymPolicyDecision {
  /** 알림을 예약해도 되는지 여부 */
  shouldNotify: boolean
  /** 알림/차단 이유를 orchestration 로그나 테스트에서 추적하기 위한 안정적인 코드 */
  reason: string
  /** matchedSignals 개수 기반의 설명용 점수 */
  score: number
  /** 판단 시점의 gym center 거리 */
  distanceToGymM: number | null
  /** 알림 판단에 실제로 매칭된 정책 신호 목록 */
  matchedSignals: string[]
}

/** geofence 150m는 wake-up 신호일 뿐이고, policy 판단은 100m 이하 정확도 샘플만 사용 */
const MAX_ACCEPTED_ACCURACY_M = 100
const ARRIVAL_SAME_PLACE_COOLDOWN_MS = 12 * 60 * 60 * 1000
const ARRIVAL_GLOBAL_COOLDOWN_MS = 30 * 60 * 1000
const EXIT_SAME_SESSION_COOLDOWN_MS = 12 * 60 * 60 * 1000
const EXIT_GLOBAL_COOLDOWN_MS = 30 * 60 * 1000
const EXIT_MIN_WORKOUT_AGE_MS = 10 * 60 * 1000
/** 운동 중 체크나 workout-start 샘플은 도착 알림 후보가 아니므로 source에서 먼저 거름 */
const ARRIVAL_EVALUATION_SOURCES = new Set<GymLocationSample["source"]>([
  "geofence-enter",
  "app-active",
  "background-location-batch",
])

/** 알림 허용 결과 객체 */
function notify(
  reason: string,
  distanceToGymM: number | null,
  matchedSignals: string[],
): GymPolicyDecision {
  return {
    distanceToGymM,
    matchedSignals,
    reason,
    score: matchedSignals.length,
    shouldNotify: true,
  }
}

/** 알림 차단 결과 객체 */
function reject(
  reason: string,
  distanceToGymM: number | null,
  matchedSignals: string[] = [],
): GymPolicyDecision {
  return {
    distanceToGymM,
    matchedSignals,
    reason,
    score: 0,
    shouldNotify: false,
  }
}

/** 마지막 알림 시각이 현재 기준 cooldown 안쪽인지 확인 */
function hasCooldown(
  lastNotifiedAt: string | null | undefined,
  now: string,
  ms: number,
) {
  if (!lastNotifiedAt) {
    return false
  }

  const lastMs = getTimestampMsFromIso(lastNotifiedAt)
  const nowMs = getTimestampMsFromIso(now)
  if (lastMs === null || nowMs === null) {
    return false
  }

  return nowMs - lastMs < ms
}

/** policy 판단에 쓸 수 있는 place 매칭/정확도/좌표 조건을 만족하는 샘플인지 확인 */
function isUsableLocationSample(sample: GymLocationSample, placeId: string) {
  return (
    sample.placeId === placeId &&
    sample.ambiguous !== true &&
    isValidCoordinates(sample.lat, sample.lng) &&
    Number.isFinite(sample.distanceToGymM) &&
    sample.distanceToGymM >= 0 &&
    (sample.accuracyM === null ||
      (Number.isFinite(sample.accuracyM) &&
        sample.accuracyM <= MAX_ACCEPTED_ACCURACY_M))
  )
}

/** 기록 시각 오름차순 정렬용 비교 함수 */
function compareSamplesByRecordedAt(
  left: GymLocationSample,
  right: GymLocationSample,
) {
  return (
    (getTimestampMsFromIso(left.recordedAt) ?? 0) -
    (getTimestampMsFromIso(right.recordedAt) ?? 0)
  )
}

/** currentLocation을 포함한 유효 샘플을 기록 시각 순서로 반환 */
function getValidSamples(input: GymPolicyInput) {
  // currentLocation도 판단 근거에 포함하되, caller가 넘긴 recentSamples는 절대 정렬 변경X
  const samples =
    input.currentLocation &&
    !input.recentSamples.some(
      (sample) => sample.id === input.currentLocation?.id,
    )
      ? [...input.recentSamples, input.currentLocation]
      : input.recentSamples

  return [...samples]
    .filter((sample) => isUsableLocationSample(sample, input.place.id))
    .sort(compareSamplesByRecordedAt)
}

/** currentLocation 직전의 유효 샘플을 반환한다. 이동 방향 판단에 사용 */
function getPreviousSample(input: GymPolicyInput) {
  if (!input.currentLocation) {
    return null
  }

  const currentRecordedAtMs = getTimestampMsFromIso(
    input.currentLocation.recordedAt,
  )
  const candidates = getValidSamples(input).filter((sample) => {
    if (sample.id === input.currentLocation?.id) {
      return false
    }

    if (currentRecordedAtMs === null) {
      return true
    }

    const sampleRecordedAtMs = getTimestampMsFromIso(sample.recordedAt)
    return (
      sampleRecordedAtMs === null || sampleRecordedAtMs <= currentRecordedAtMs
    )
  })

  return candidates.at(-1) ?? null
}

/** 특정 좌표가 gym center에서 얼마나 떨어져 있는지 계산 */
function getDistanceFromPlaceMeters(
  place: GymPlace,
  location: { lat: number; lng: number },
) {
  return getDistanceMeters(
    { lat: place.latitude, lng: place.longitude },
    location,
  )
}

/** 도착 정책을 평가하기 전에 공통 차단 조건을 확인 */
function getArrivalGateFailure(input: GymPolicyInput) {
  const { currentLocation } = input

  // 자동 경로에서는 권한 요청 없이 얻은 단일 현재 위치가 없으면 보수적으로 알림을 막음
  if (!currentLocation) {
    return "missing-current-location"
  }

  if (currentLocation.ambiguous === true) {
    return "ambiguous-current-location"
  }

  if (!ARRIVAL_EVALUATION_SOURCES.has(currentLocation.source)) {
    return "non-arrival-source"
  }

  // 운동이 이미 진행 중이면 시작 알림과 pending prompt를 모두 만들지 않음
  if (!isUsableLocationSample(currentLocation, input.place.id)) {
    return "invalid-current-location"
  }

  if (
    input.activeWorkout.phase === "countdown" ||
    input.activeWorkout.phase === "recording" ||
    input.activeWorkout.phase === "paused"
  ) {
    return "workout-active"
  }

  if (
    hasCooldown(
      input.cooldowns.arrivalLastNotifiedAtByPlaceId[input.place.id],
      input.now,
      ARRIVAL_SAME_PLACE_COOLDOWN_MS,
    )
  ) {
    return "arrival-place-cooldown"
  }

  if (
    hasCooldown(
      input.cooldowns.arrivalGlobalLastNotifiedAt,
      input.now,
      ARRIVAL_GLOBAL_COOLDOWN_MS,
    )
  ) {
    return "arrival-global-cooldown"
  }

  return null
}

/** 반복 운동 장소 도착 알림을 보낼지 순수하게 판단 */
export function evaluateGymArrivalPolicy(
  input: GymPolicyInput,
): GymPolicyDecision {
  const gateFailure = getArrivalGateFailure(input)
  if (gateFailure) {
    return reject(gateFailure, input.currentLocation?.distanceToGymM ?? null)
  }

  const currentLocation = input.currentLocation
  if (!currentLocation) {
    return reject("missing-current-location", null)
  }

  if (
    input.context.context === "UNKNOWN" ||
    input.context.context === "NORMAL"
  ) {
    // 일반 장소는 geofence 반경보다 좁은 100m core 안쪽일 때만 도착
    if (currentLocation.distanceToGymM <= 100) {
      return notify("arrival-normal", currentLocation.distanceToGymM, [
        "arrival-distance-within-100m",
      ])
    }

    return reject("arrival-distance-too-far", currentLocation.distanceToGymM)
  }

  if (input.context.context === "FREQUENT_PLACE_NEAR_GYM") {
    const previousSample = getPreviousSample(input)
    const frequentPlaceLocation = input.context.frequentPlaceLocation
    if (frequentPlaceLocation === null) {
      // nearby frequent-place context는 비교 대상 클러스터가 없으면 안전하게 판단X
      return reject(
        "missing-frequent-place-location",
        currentLocation.distanceToGymM,
      )
    }

    const frequentPlaceDistanceToGym = getDistanceFromPlaceMeters(input.place, {
      lat: frequentPlaceLocation.lat,
      lng: frequentPlaceLocation.lng,
    })
    const movedTowardGym =
      previousSample !== null &&
      previousSample.distanceToGymM - currentLocation.distanceToGymM >= 25
    const isCloserToGymThanFrequentPlace =
      currentLocation.distanceToGymM < frequentPlaceDistanceToGym

    // 집/회사 근처 헬스장은 70m core 진입, gym 방향 이동, frequent place보다 gym에 가까움이 모두 필요
    if (
      currentLocation.distanceToGymM <= 70 &&
      movedTowardGym &&
      isCloserToGymThanFrequentPlace
    ) {
      return notify("arrival-frequent-place", currentLocation.distanceToGymM, [
        "arrival-distance-within-70m",
        "arrival-moving-toward-gym",
        "arrival-closer-to-gym-than-frequent-place",
      ])
    }

    return reject(
      "frequent-arrival-signals-not-met",
      currentLocation.distanceToGymM,
    )
  }

  const recentCoreSamples = getValidSamples(input)
    .slice(-2)
    .filter((sample) => sample.distanceToGymM <= 100)

  // GPS 노이즈 장소는 단일 샘플을 믿지 않고 최근 두 샘플이 모두 gym core 안쪽
  if (recentCoreSamples.length >= 2) {
    return notify(
      "arrival-high-noise-confirmed",
      currentLocation.distanceToGymM,
      ["arrival-two-core-samples"],
    )
  }

  return reject(
    "high-noise-arrival-needs-confirmation",
    currentLocation.distanceToGymM,
  )
}

// 종료 정책을 평가하기 전에 공통 차단 조건을 확인
function getExitGateFailure(input: GymPolicyInput) {
  const { activeWorkout, currentLocation } = input

  // 종료 리마인더는 실제 기록 중이거나 일시정지된 세션에만 의미부여
  if (activeWorkout.phase !== "recording" && activeWorkout.phase !== "paused") {
    return "workout-not-active"
  }

  if (!activeWorkout.sessionId) {
    return "missing-session-id"
  }

  if (!activeWorkout.startedAt) {
    return "missing-workout-start"
  }

  const nowMs = getTimestampMsFromIso(input.now)
  const startedAtMs = getTimestampMsFromIso(activeWorkout.startedAt)
  if (nowMs === null || startedAtMs === null) {
    return "invalid-workout-time"
  }

  if (nowMs - startedAtMs < EXIT_MIN_WORKOUT_AGE_MS) {
    return "workout-too-recent"
  }

  // 운동 시작 위치가 이 place 안쪽이어야 이탈 알림을 해당 헬스장 기준으로 평가
  if (!activeWorkout.location) {
    return "missing-workout-start-location"
  }

  if (
    !isValidCoordinates(activeWorkout.location.lat, activeWorkout.location.lng)
  ) {
    return "invalid-workout-start-location"
  }

  if (getDistanceFromPlaceMeters(input.place, activeWorkout.location) > 120) {
    return "workout-started-outside-place"
  }

  if (!currentLocation) {
    return "missing-current-location"
  }

  if (!isUsableLocationSample(currentLocation, input.place.id)) {
    return "invalid-current-location"
  }

  if (
    hasCooldown(
      input.cooldowns.exitLastNotifiedAtBySessionId[activeWorkout.sessionId],
      input.now,
      EXIT_SAME_SESSION_COOLDOWN_MS,
    )
  ) {
    return "exit-session-cooldown"
  }

  if (
    hasCooldown(
      input.cooldowns.exitGlobalLastNotifiedAt,
      input.now,
      EXIT_GLOBAL_COOLDOWN_MS,
    )
  ) {
    return "exit-global-cooldown"
  }

  return null
}

/** NORMAL/UNKNOWN 종료 보조 조건인 "최근 두 샘플이 gym에서 멀어짐"을 확인 */
function hasTwoOutsideSamplesMovingAway(input: GymPolicyInput) {
  // NORMAL 보조 경로는 currentLocation이 250m 밖이 아니어도, 최근 두 샘플이 150m 밖으로 멀어지면 이탈로 간주
  const recentSamples = getValidSamples(input).slice(-2)
  if (recentSamples.length < 2) {
    return false
  }

  if (!recentSamples.every((sample) => sample.distanceToGymM > 150)) {
    return false
  }

  return recentSamples[0].distanceToGymM < recentSamples[1].distanceToGymM
}

/** 진행 중 운동을 종료하지 않고 active 화면 복귀 알림만 보낼지 순수하게 판단 */
export function evaluateGymExitPolicy(input: GymPolicyInput): GymPolicyDecision {
  const gateFailure = getExitGateFailure(input)
  if (gateFailure) {
    return reject(gateFailure, input.currentLocation?.distanceToGymM ?? null)
  }

  const currentLocation = input.currentLocation
  const activeWorkout = input.activeWorkout
  if (!currentLocation || !activeWorkout.location) {
    return reject("missing-current-location", null)
  }

  if (
    input.context.context === "UNKNOWN" ||
    input.context.context === "NORMAL"
  ) {
    // 일반 장소는 확실히 250m 이상 벗어난 단일 현재 위치만으로도 종료 리마인더 후보
    if (currentLocation.distanceToGymM >= 250) {
      return notify("exit-normal-distance", currentLocation.distanceToGymM, [
        "exit-distance-at-least-250m",
      ])
    }

    if (hasTwoOutsideSamplesMovingAway(input)) {
      return notify("exit-normal-moving-away", currentLocation.distanceToGymM, [
        "exit-two-outside-samples",
        "exit-moving-away-from-gym",
      ])
    }

    return reject("exit-normal-signals-not-met", currentLocation.distanceToGymM)
  }

  if (input.context.context === "FREQUENT_PLACE_NEAR_GYM") {
    const workoutStartDistanceToGymM = getDistanceFromPlaceMeters(
      input.place,
      activeWorkout.location,
    )
    const previousSample = getPreviousSample(input)
    const frequentPlaceLocation = input.context.frequentPlaceLocation
    if (frequentPlaceLocation === null) {
      // nearby frequent-place 종료 판단도 돌아갈 체류 클러스터가 없으면 평가X
      return reject(
        "missing-frequent-place-location",
        currentLocation.distanceToGymM,
      )
    }

    const currentToFrequentPlaceDistance =
      getDistanceMeters(currentLocation, frequentPlaceLocation)
    const previousToFrequentPlaceDistance =
      previousSample === null
        ? Number.POSITIVE_INFINITY
        : getDistanceMeters(previousSample, frequentPlaceLocation)
    const movedAwayFromGym =
      previousSample !== null &&
      currentLocation.distanceToGymM - previousSample.distanceToGymM >= 25
    const movedTowardFrequentPlace =
      currentToFrequentPlaceDistance < previousToFrequentPlaceDistance

    // 250m 밖까지 기다리지 않고, gym core에서 frequent place 쪽으로 돌아가는 패턴을 종료 후보
    if (
      workoutStartDistanceToGymM <= 70 &&
      currentLocation.distanceToGymM >= 100 &&
      movedAwayFromGym &&
      movedTowardFrequentPlace
    ) {
      return notify("exit-frequent-place", currentLocation.distanceToGymM, [
        "exit-started-in-gym-core",
        "exit-moving-away-from-gym",
        "exit-moving-toward-frequent-place",
      ])
    }

    return reject(
      "frequent-exit-signals-not-met",
      currentLocation.distanceToGymM,
    )
  }

  const lastThreeSamples = getValidSamples(input).slice(-3)
  const outsideSampleCount = lastThreeSamples.filter(
    (sample) => sample.distanceToGymM > 150,
  ).length
  const lastSample = lastThreeSamples.at(-1)

  // 노이즈 장소의 종료는 최근 3개 중 2개 이상이 outside이고 마지막 샘플이 gym core로 되돌아오지X
  if (
    outsideSampleCount >= 2 &&
    lastSample !== undefined &&
    lastSample.distanceToGymM > 70
  ) {
    return notify("exit-high-noise-confirmed", currentLocation.distanceToGymM, [
      "exit-two-of-three-outside-samples",
    ])
  }

  return reject(
    "high-noise-exit-needs-confirmation",
    currentLocation.distanceToGymM,
  )
}
