import { getLocalDateKeyFromIso, getTimestampMsFromIso } from "@/shared/lib/date"
import { getDistanceMeters, isValidCoordinates } from "@/shared/lib/geo"
import type {
  GymLocationSample,
  GymPlace,
  GymPlaceContext,
} from "./gymLocationPolicy"

const CONTEXT_MIN_SAMPLE_COUNT = 5
const MAX_CONTEXT_SAMPLE_AGE_MS = 14 * 24 * 60 * 60 * 1000
const MAX_CONTEXT_ACCURACY_M = 100
const MAX_CONTEXT_DISTANCE_M = 300
const NOISE_MEDIAN_ACCURACY_M = 80
const NOISE_DISTANCE_RANGE_M = 120
const NOISE_WINDOW_MS = 10 * 60 * 1000
const NOISE_FAST_SPEED_MPS = 45
const FREQUENT_PLACE_MIN_DISTANCE_M = 70
const FREQUENT_PLACE_MAX_DISTANCE_M = 180
const FREQUENT_PLACE_MIN_SAMPLES = 5
const FREQUENT_PLACE_MIN_DAYS = 3

interface BuildGymPlaceContextInput {
  place: GymPlace
  samples: GymLocationSample[]
  now: string
}

/** 위치 샘플로 장소의 알림 오탐 위험 context를 계산 */
export function buildGymPlaceContext({
  now,
  place,
  samples,
}: BuildGymPlaceContextInput): GymPlaceContext {
  const usableSamples = getUsableContextSamples({ now, place, samples })
  if (usableSamples.length < CONTEXT_MIN_SAMPLE_COUNT) {
    return createContext(place.id, "UNKNOWN", 0, null, 0, now)
  }

  const highNoiseScore = getHighNoiseScore(usableSamples)
  if (highNoiseScore >= 2) {
    return createContext(
      place.id,
      "HIGH_NOISE_PLACE",
      Math.min(1, highNoiseScore / 3),
      null,
      highNoiseScore,
      now,
    )
  }

  const frequentPlaceLocation = getFrequentPlaceLocation(place, usableSamples)
  if (frequentPlaceLocation) {
    return createContext(
      place.id,
      "FREQUENT_PLACE_NEAR_GYM",
      0.8,
      frequentPlaceLocation,
      0,
      now,
    )
  }

  return createContext(place.id, "NORMAL", 0.7, null, 0, now)
}

/** 여러 장소의 context를 placeId별 record로 계산 */
export function buildGymPlaceContexts({
  now,
  places,
  sampleRecord,
}: {
  now: string
  places: GymPlace[]
  sampleRecord: Record<string, GymLocationSample[]>
}) {
  return places.reduce<Record<string, GymPlaceContext>>((record, place) => {
    record[place.id] = buildGymPlaceContext({
      now,
      place,
      samples: sampleRecord[place.id] ?? [],
    })
    return record
  }, {})
}

function createContext(
  placeId: string,
  context: GymPlaceContext["context"],
  confidence: number,
  frequentPlaceLocation: GymPlaceContext["frequentPlaceLocation"],
  highNoiseScore: number,
  updatedAt: string,
): GymPlaceContext {
  return {
    confidence,
    context,
    frequentPlaceLocation,
    highNoiseScore,
    placeId,
    updatedAt,
  }
}

/** context 계산에 쓸 수 있는 최근/정확도/거리 조건을 만족하는 샘플만 고름 */
function getUsableContextSamples({
  now,
  place,
  samples,
}: BuildGymPlaceContextInput) {
  const nowMs = getTimestampMsFromIso(now)

  return samples
    .filter((sample) => {
      if (
        sample.placeId !== place.id ||
        sample.ambiguous === true ||
        !isValidCoordinates(sample.lat, sample.lng) ||
        !Number.isFinite(sample.distanceToGymM) ||
        sample.distanceToGymM < 0 ||
        sample.distanceToGymM > MAX_CONTEXT_DISTANCE_M ||
        (sample.accuracyM !== null &&
          (!Number.isFinite(sample.accuracyM) ||
            sample.accuracyM > MAX_CONTEXT_ACCURACY_M))
      ) {
        return false
      }

      if (nowMs === null) {
        return true
      }

      const sampleMs = getTimestampMsFromIso(sample.recordedAt)
      return sampleMs !== null && nowMs - sampleMs <= MAX_CONTEXT_SAMPLE_AGE_MS
    })
    .sort(compareSamplesByRecordedAt)
}

/** GPS 노이즈로 볼 수 있는 신호 개수를 계산 */
function getHighNoiseScore(samples: GymLocationSample[]) {
  let score = 0

  if (getMedianAccuracy(samples) > NOISE_MEDIAN_ACCURACY_M) {
    score += 1
  }

  if (hasLargeDistanceRangeInWindow(samples)) {
    score += 1
  }

  if (hasUnrealisticMovementSpeed(samples)) {
    score += 1
  }

  if (
    samples.filter(
      (sample) => sample.source === "geofence-enter" && sample.distanceToGymM > 150,
    ).length >= 2
  ) {
    score += 1
  }

  if (
    samples.filter(
      (sample) => sample.source === "geofence-exit" && sample.distanceToGymM <= 70,
    ).length >= 2
  ) {
    score += 1
  }

  return score
}

/** null을 제외한 accuracy 중앙값을 계산 */
function getMedianAccuracy(samples: GymLocationSample[]) {
  const accuracies = samples
    .map((sample) => sample.accuracyM)
    .filter((accuracy): accuracy is number => accuracy !== null)
    .sort((left, right) => left - right)

  if (accuracies.length === 0) {
    return 0
  }

  const middle = Math.floor(accuracies.length / 2)
  return accuracies.length % 2 === 0
    ? (accuracies[middle - 1] + accuracies[middle]) / 2
    : accuracies[middle]
}

/** 10분 안쪽 샘플들의 gym 거리 편차가 큰 구간이 있는지 확인 */
function hasLargeDistanceRangeInWindow(samples: GymLocationSample[]) {
  return samples.some((sample, index) => {
    const sampleMs = getTimestampMsFromIso(sample.recordedAt)
    if (sampleMs === null) {
      return false
    }

    const windowSamples = samples.slice(index).filter((candidate) => {
      const candidateMs = getTimestampMsFromIso(candidate.recordedAt)
      return candidateMs !== null && candidateMs - sampleMs <= NOISE_WINDOW_MS
    })
    const distances = windowSamples.map((item) => item.distanceToGymM)
    return (
      Math.max(...distances) - Math.min(...distances) >
      NOISE_DISTANCE_RANGE_M
    )
  })
}

/** 연속 샘플 사이 좌표 이동이 비현실적으로 빠른지 확인 */
function hasUnrealisticMovementSpeed(samples: GymLocationSample[]) {
  return samples.some((sample, index) => {
    const nextSample = samples[index + 1]
    if (!nextSample) {
      return false
    }

    const sampleMs = getTimestampMsFromIso(sample.recordedAt)
    const nextSampleMs = getTimestampMsFromIso(nextSample.recordedAt)
    if (sampleMs === null || nextSampleMs === null || nextSampleMs <= sampleMs) {
      return false
    }

    const distance = getDistanceMeters(sample, nextSample)
    const seconds = (nextSampleMs - sampleMs) / 1000
    return distance / seconds > NOISE_FAST_SPEED_MPS
  })
}

/** 헬스장 주변의 반복 체류 지점 중심 좌표를 계산 */
function getFrequentPlaceLocation(
  place: GymPlace,
  samples: GymLocationSample[],
) {
  const candidates = samples.filter(
    (sample) =>
      sample.source === "app-active" &&
      sample.distanceToGymM >= FREQUENT_PLACE_MIN_DISTANCE_M &&
      sample.distanceToGymM <= FREQUENT_PLACE_MAX_DISTANCE_M,
  )

  const activeDays = new Set(
    candidates
      .map((sample) => getLocalDateKeyFromIso(sample.recordedAt))
      .filter((dateKey): dateKey is string => dateKey !== null),
  )

  if (
    candidates.length < FREQUENT_PLACE_MIN_SAMPLES &&
    activeDays.size < FREQUENT_PLACE_MIN_DAYS
  ) {
    return null
  }

  const center = {
    lat:
      candidates.reduce((sum, sample) => sum + sample.lat, 0) /
      candidates.length,
    lng:
      candidates.reduce((sum, sample) => sum + sample.lng, 0) /
      candidates.length,
  }
  const centerDistanceToGym = getDistanceMeters(
    { lat: place.latitude, lng: place.longitude },
    center,
  )

  return centerDistanceToGym >= FREQUENT_PLACE_MIN_DISTANCE_M ? center : null
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
