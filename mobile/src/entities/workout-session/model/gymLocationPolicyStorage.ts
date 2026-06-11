import AsyncStorage from "@react-native-async-storage/async-storage"
import { getTimestampMsFromIso } from "@/shared/lib/date"
import { isValidCoordinates } from "@/shared/lib/geo"
import { parseJsonOrNull } from "@/shared/lib/json"
import { buildGymPlaceContexts } from "../lib/gymPlaceContext"
import type {
  GymContext,
  GymLocationPolicyCooldowns,
  GymLocationSample,
  GymPlace,
  GymPlaceContext,
} from "../lib/gymLocationPolicy"

export const GYM_LOCATION_POLICY_CONTEXTS_STORAGE_KEY =
  "yb:gym-location-policy:contexts"
export const GYM_LOCATION_POLICY_COOLDOWNS_STORAGE_KEY =
  "yb:gym-location-policy:cooldowns"
export const GYM_LOCATION_POLICY_SAMPLES_STORAGE_KEY =
  "yb:gym-location-policy:samples"

const SAMPLE_RETENTION_DAYS = 14
const SAMPLE_RETENTION_MS = SAMPLE_RETENTION_DAYS * 24 * 60 * 60 * 1000
const MAX_SAMPLES_PER_PLACE = 30
const MAX_TOTAL_SAMPLES = 600
const MAX_STORED_SAMPLE_DISTANCE_M = 300
const MAX_STORED_SAMPLE_ACCURACY_M = 100

const emptyCooldowns: GymLocationPolicyCooldowns = {
  arrivalGlobalLastNotifiedAt: null,
  arrivalLastNotifiedAtByPlaceId: {},
  exitGlobalLastNotifiedAt: null,
  exitLastNotifiedAtBySessionId: {},
}

/** 저장된 context 문자열이 현재 정책 타입에 포함되는지 확인 */
function isGymContext(value: unknown): value is GymContext {
  return (
    value === "UNKNOWN" ||
    value === "NORMAL" ||
    value === "FREQUENT_PLACE_NEAR_GYM" ||
    value === "HIGH_NOISE_PLACE"
  )
}

/** cooldown map처럼 string 값만 허용하는 record를 정규화 */
function normalizeStringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (record, [key, item]) => {
      if (typeof item === "string") {
        record[key] = item
      }
      return record
    },
    {},
  )
}

/** 저장된 좌표 객체를 유효한 lat/lng 쌍으로 정규화 */
function normalizeCoordinate(
  value: unknown,
): { lat: number; lng: number } | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const coordinate = value as Partial<{ lat: number; lng: number }>
  if (
    typeof coordinate.lat !== "number" ||
    typeof coordinate.lng !== "number" ||
    !isValidCoordinates(coordinate.lat, coordinate.lng)
  ) {
    return null
  }

  return {
    lat: coordinate.lat,
    lng: coordinate.lng,
  }
}

/** 저장된 장소 context 하나를 policy 입력 타입으로 정규화 */
function normalizeContext(value: unknown): GymPlaceContext | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const context = value as Partial<GymPlaceContext>
  if (
    typeof context.placeId !== "string" ||
    context.placeId.length === 0 ||
    !isGymContext(context.context) ||
    typeof context.confidence !== "number" ||
    !Number.isFinite(context.confidence) ||
    typeof context.highNoiseScore !== "number" ||
    !Number.isFinite(context.highNoiseScore) ||
    typeof context.updatedAt !== "string"
  ) {
    return null
  }

  return {
    confidence: Math.min(1, Math.max(0, context.confidence)),
    context: context.context,
    frequentPlaceLocation: normalizeCoordinate(context.frequentPlaceLocation),
    highNoiseScore: Math.max(0, context.highNoiseScore),
    placeId: context.placeId,
    updatedAt: context.updatedAt,
  }
}

/** placeId별 context record를 정규화하고 invalid entry를 버림 */
function normalizeContextRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return Object.values(value).reduce<Record<string, GymPlaceContext>>(
    (record, item) => {
      const context = normalizeContext(item)
      if (context) {
        record[context.placeId] = context
      }
      return record
    },
    {},
  )
}

/** 깨진 cooldown 저장값을 도착/종료가 분리된 기본 구조로 정규화 */
function normalizeCooldowns(value: unknown): GymLocationPolicyCooldowns {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...emptyCooldowns }
  }

  const cooldowns = value as Partial<GymLocationPolicyCooldowns>
  return {
    arrivalGlobalLastNotifiedAt:
      typeof cooldowns.arrivalGlobalLastNotifiedAt === "string"
        ? cooldowns.arrivalGlobalLastNotifiedAt
        : null,
    arrivalLastNotifiedAtByPlaceId: normalizeStringRecord(
      cooldowns.arrivalLastNotifiedAtByPlaceId,
    ),
    exitGlobalLastNotifiedAt:
      typeof cooldowns.exitGlobalLastNotifiedAt === "string"
        ? cooldowns.exitGlobalLastNotifiedAt
        : null,
    exitLastNotifiedAtBySessionId: normalizeStringRecord(
      cooldowns.exitLastNotifiedAtBySessionId,
    ),
  }
}

/** 저장된 sample source가 현재 지원하는 입력 경로인지 확인 */
function isGymLocationSampleSource(
  value: unknown,
): value is GymLocationSample["source"] {
  return (
    value === "geofence-enter" ||
    value === "geofence-exit" ||
    value === "app-active" ||
    value === "workout-start" ||
    value === "workout-active-check" ||
    value === "background-location-batch"
  )
}

/** sample이 14일 rolling retention 밖인지 확인 */
function isSampleExpired(sample: GymLocationSample, now: string) {
  const sampleMs = getTimestampMsFromIso(sample.recordedAt)
  const nowMs = getTimestampMsFromIso(now)
  if (sampleMs === null || nowMs === null) {
    return true
  }

  return sampleMs < nowMs - SAMPLE_RETENTION_MS
}

/** 저장된 위치 기록 하나를 유효한 policy sample로 정규화 */
function normalizeSample(
  value: unknown,
  now: string,
): GymLocationSample | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const sample = value as Partial<GymLocationSample>
  if (
    typeof sample.id !== "string" ||
    sample.id.length === 0 ||
    typeof sample.placeId !== "string" ||
    sample.placeId.length === 0 ||
    typeof sample.lat !== "number" ||
    typeof sample.lng !== "number" ||
    !isValidCoordinates(sample.lat, sample.lng) ||
    typeof sample.distanceToGymM !== "number" ||
    !Number.isFinite(sample.distanceToGymM) ||
    sample.distanceToGymM < 0 ||
    sample.distanceToGymM > MAX_STORED_SAMPLE_DISTANCE_M ||
    typeof sample.recordedAt !== "string" ||
    !isGymLocationSampleSource(sample.source) ||
    sample.ambiguous === true
  ) {
    return null
  }

  const accuracyM =
    typeof sample.accuracyM === "number" && Number.isFinite(sample.accuracyM)
      ? sample.accuracyM
      : sample.accuracyM === null
        ? null
        : null

  if (accuracyM !== null && accuracyM > MAX_STORED_SAMPLE_ACCURACY_M) {
    return null
  }

  const normalizedSample: GymLocationSample = {
    accuracyM,
    distanceToGymM: sample.distanceToGymM,
    id: sample.id,
    lat: sample.lat,
    lng: sample.lng,
    placeId: sample.placeId,
    recordedAt: sample.recordedAt,
    source: sample.source,
  }

  return isSampleExpired(normalizedSample, now) ? null : normalizedSample
}

/** 위치 기록을 오래된 순서에서 최신 순서로 정렬 */
function compareSamplesByRecordedAt(
  left: GymLocationSample,
  right: GymLocationSample,
) {
  return (
    (getTimestampMsFromIso(left.recordedAt) ?? 0) -
    (getTimestampMsFromIso(right.recordedAt) ?? 0)
  )
}

/** place별 30개, 전체 600개 제한을 적용 */
function enforceSampleCaps(samples: Record<string, GymLocationSample[]>) {
  const cappedByPlace = Object.entries(samples).reduce<
    Record<string, GymLocationSample[]>
  >((record, [placeId, items]) => {
    const sortedItems = [...items].sort(compareSamplesByRecordedAt)
    const cappedItems = sortedItems.slice(-MAX_SAMPLES_PER_PLACE)
    if (cappedItems.length > 0) {
      record[placeId] = cappedItems
    }
    return record
  }, {})

  const allSamples = Object.values(cappedByPlace)
    .flat()
    .sort(compareSamplesByRecordedAt)
  const allowedSampleIds = new Set(
    allSamples.slice(-MAX_TOTAL_SAMPLES).map((sample) => sample.id),
  )

  return Object.entries(cappedByPlace).reduce<
    Record<string, GymLocationSample[]>
  >((record, [placeId, items]) => {
    const cappedItems = items.filter((sample) =>
      allowedSampleIds.has(sample.id),
    )
    if (cappedItems.length > 0) {
      record[placeId] = cappedItems
    }
    return record
  }, {})
}

/** 저장된 place별 위치 기록 전체를 정규화하고 retention/cap을 적용 */
function normalizeSampleRecord(value: unknown, now: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const samples = Object.entries(value).reduce<Record<string, GymLocationSample[]>>(
    (record, [placeId, items]) => {
      if (!Array.isArray(items)) {
        return record
      }

      const normalizedItems = items
        .map((item) => normalizeSample(item, now))
        .filter((item): item is GymLocationSample => item !== null)
        .filter((sample) => sample.placeId === placeId)

      if (normalizedItems.length > 0) {
        record[placeId] = normalizedItems
      }

      return record
    },
    {},
  )

  return enforceSampleCaps(samples)
}

/** 정규화가 끝난 위치 기록 record를 저장 */
async function saveGymLocationPolicySamples(
  samples: Record<string, GymLocationSample[]>,
) {
  await AsyncStorage.setItem(
    GYM_LOCATION_POLICY_SAMPLES_STORAGE_KEY,
    JSON.stringify(samples),
  )
}

/** 장소별 위치 context를 조회. 저장값이 없거나 깨졌으면 빈 record 반환 */
export async function getGymLocationPolicyContexts() {
  const value = await AsyncStorage.getItem(
    GYM_LOCATION_POLICY_CONTEXTS_STORAGE_KEY,
  )

  if (!value) {
    return {}
  }

  return normalizeContextRecord(parseJsonOrNull<unknown>(value))
}

/** 장소별 위치 context를 정규화해 저장 */
export async function saveGymLocationPolicyContexts(
  contexts: Record<string, GymPlaceContext>,
) {
  await AsyncStorage.setItem(
    GYM_LOCATION_POLICY_CONTEXTS_STORAGE_KEY,
    JSON.stringify(normalizeContextRecord(contexts)),
  )
}

/** 저장된 위치 샘플을 기준으로 장소별 context를 다시 계산해 저장 */
export async function refreshGymLocationPolicyContexts(
  places: GymPlace[],
  now: string,
) {
  const sampleRecord = await getGymLocationPolicySamples(now)
  const contexts = buildGymPlaceContexts({
    now,
    places,
    sampleRecord,
  })

  await saveGymLocationPolicyContexts(contexts)
  return contexts
}

/** 도착/종료 재알림 제한 상태를 조회. 저장값이 없거나 깨졌으면 기본값 반환 */
export async function getGymLocationPolicyCooldowns() {
  const value = await AsyncStorage.getItem(
    GYM_LOCATION_POLICY_COOLDOWNS_STORAGE_KEY,
  )

  if (!value) {
    return { ...emptyCooldowns }
  }

  return normalizeCooldowns(parseJsonOrNull<unknown>(value))
}

/** 도착/종료 재알림 제한 상태를 정규화해 저장 */
export async function saveGymLocationPolicyCooldowns(
  cooldowns: GymLocationPolicyCooldowns,
) {
  await AsyncStorage.setItem(
    GYM_LOCATION_POLICY_COOLDOWNS_STORAGE_KEY,
    JSON.stringify(normalizeCooldowns(cooldowns)),
  )
}

/** place별 위치 기록을 조회하면서 14일 retention과 cap을 적용 */
export async function getGymLocationPolicySamples(now: string) {
  const value = await AsyncStorage.getItem(GYM_LOCATION_POLICY_SAMPLES_STORAGE_KEY)

  if (!value) {
    return {}
  }

  return normalizeSampleRecord(parseJsonOrNull<unknown>(value), now)
}

/** 위치 기록 하나를 추가하고 place별 queue/cap/retention을 유지 */
export async function appendGymLocationPolicySample(
  sample: GymLocationSample,
  now: string,
) {
  const normalizedSample = normalizeSample(sample, now)
  if (!normalizedSample) {
    return false
  }

  const samples = await getGymLocationPolicySamples(now)
  const placeSamples = samples[normalizedSample.placeId] ?? []
  const nextPlaceSamples = [
    ...placeSamples.filter((item) => item.id !== normalizedSample.id),
    normalizedSample,
  ]

  const nextSamples = enforceSampleCaps({
    ...samples,
    [normalizedSample.placeId]: nextPlaceSamples,
  })

  await saveGymLocationPolicySamples(nextSamples)
  return true
}
