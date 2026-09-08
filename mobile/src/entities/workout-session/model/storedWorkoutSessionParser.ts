import { getTimestampMsFromIso } from "@/shared/lib/date"
import { isValidCoordinates } from "@/shared/lib/geo"
import { parseJsonOrNull } from "@/shared/lib/json"
import { normalizeOptionalMetricCount } from "./metricNormalization"
import { normalizeHealthKitWorkoutUUID } from "./healthKitNormalization"
import {
  BODY_PART_DETAILS,
  type BodyPart,
  type BodyPartDetail,
  type StoredWorkoutSession,
  type WorkoutBodyPartSet,
  type WorkoutLocation,
  type WorkoutRoutineSubstitution,
} from "./types"
import type { RoutinePart } from "./routineCycle"

const BODY_PART_KEYS = Object.keys(BODY_PART_DETAILS) as BodyPart[]

/** 저장값이 현재 앱에서 지원하는 운동 부위 키인지 확인 */
function isBodyPart(value: unknown): value is BodyPart {
  return typeof value === "string" && BODY_PART_KEYS.includes(value as BodyPart)
}

/** 저장값이 해당 운동 부위에 허용된 세부 부위인지 확인 */
function isBodyPartDetail(
  part: BodyPart,
  value: unknown,
): value is BodyPartDetail {
  return (
    typeof value === "string" &&
    BODY_PART_DETAILS[part].includes(value as BodyPartDetail)
  )
}

/** 저장된 운동 부위·세트 값을 현재 앱 타입으로 정규화 */
function normalizeWorkoutBodyPartSet(
  value: unknown,
): WorkoutBodyPartSet | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const item = value as Partial<WorkoutBodyPartSet>
  if (
    !isBodyPart(item.part) ||
    typeof item.setCount !== "number" ||
    !Number.isFinite(item.setCount)
  ) {
    return null
  }

  const part = item.part
  const detail = isBodyPartDetail(part, item.detail) ? item.detail : undefined
  const details = Array.isArray(item.details)
    ? item.details.filter((candidate): candidate is BodyPartDetail =>
        isBodyPartDetail(part, candidate),
      )
    : []

  return {
    part,
    ...(detail ? { detail } : {}),
    ...(details.length > 0 ? { details } : {}),
    setCount: Math.max(1, Math.round(item.setCount)),
  }
}

/** 저장된 위치값을 검증하고 현재 앱 위치 타입으로 정규화 */
function normalizeWorkoutLocation(value: unknown): WorkoutLocation | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const location = value as Partial<WorkoutLocation>
  if (
    typeof location.lat !== "number" ||
    typeof location.lng !== "number" ||
    !isValidCoordinates(location.lat, location.lng)
  ) {
    return null
  }

  const accuracyMeters =
    typeof location.accuracyMeters === "number" &&
    Number.isFinite(location.accuracyMeters) &&
    location.accuracyMeters >= 0
      ? location.accuracyMeters
      : undefined

  return {
    lat: location.lat,
    lng: location.lng,
    ...(accuracyMeters !== undefined ? { accuracyMeters } : {}),
  }
}

/** 저장된 루틴 대체 정보를 검증하고 현재 앱 타입으로 정규화 */
function normalizeRoutineSubstitution(
  value: unknown,
): WorkoutRoutineSubstitution | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const substitution = value as Partial<WorkoutRoutineSubstitution> & {
    weekStartDateKey?: unknown
  }
  const cycleAnchorDateKey =
    typeof substitution.cycleAnchorDateKey === "string"
      ? substitution.cycleAnchorDateKey
      : substitution.weekStartDateKey
  const originalParts = Array.isArray(substitution.originalParts)
    ? substitution.originalParts
        .map((part): RoutinePart | null => {
          if (!part || typeof part !== "object" || !isBodyPart(part.part)) {
            return null
          }

          const details = Array.isArray(part.details)
            ? part.details.filter((detail): detail is BodyPartDetail =>
                isBodyPartDetail(part.part, detail),
              )
            : []

          return {
            part: part.part,
            ...(details.length > 0 ? { details } : {}),
          }
        })
        .filter((part): part is RoutinePart => part !== null)
    : []

  if (
    typeof cycleAnchorDateKey !== "string" ||
    typeof substitution.routineSessionId !== "string" ||
    typeof substitution.routineSessionIndex !== "number" ||
    !Number.isInteger(substitution.routineSessionIndex) ||
    originalParts.length === 0
  ) {
    return null
  }

  return {
    cycleAnchorDateKey,
    routineSessionId: substitution.routineSessionId,
    routineSessionIndex: Math.max(0, substitution.routineSessionIndex),
    originalParts,
  }
}

/** 저장된 세션 JSON을 현재 StoredWorkoutSession 형태로 정규화 */
export function parseStoredWorkoutSession(
  value: string,
): StoredWorkoutSession | null {
  const session = parseJsonOrNull<Partial<StoredWorkoutSession>>(value)
  if (
    !session ||
    typeof session.sessionId !== "string" ||
    typeof session.startedAt !== "string" ||
    getTimestampMsFromIso(session.startedAt) === null ||
    typeof session.completedAt !== "string" ||
    getTimestampMsFromIso(session.completedAt) === null ||
    !Array.isArray(session.bodyParts) ||
    typeof session.memo !== "string"
  ) {
    return null
  }

  const bodyParts = session.bodyParts
    .map(normalizeWorkoutBodyPartSet)
    .filter((item): item is WorkoutBodyPartSet => item !== null)

  return {
    sessionId: session.sessionId,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    bodyParts,
    memo: session.memo,
    cardioStartedAt: session.cardioStartedAt ?? null,
    activeKcal: normalizeOptionalMetricCount(session.activeKcal),
    averageHeartRate: normalizeOptionalMetricCount(session.averageHeartRate),
    totalKcal: normalizeOptionalMetricCount(session.totalKcal),
    healthKitWorkoutUUID: normalizeHealthKitWorkoutUUID(session.healthKitWorkoutUUID),
    calendarEventId:
      typeof session.calendarEventId === "string" &&
      session.calendarEventId.length > 0
        ? session.calendarEventId
        : null,
    isDeload: session.isDeload === true,
    routineSubstitution: normalizeRoutineSubstitution(
      session.routineSubstitution,
    ),
    location: normalizeWorkoutLocation(session.location),
  }
}
