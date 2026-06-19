import type { RoutinePart } from "../model/routineCycle"
import type {
  BodyPartDetail,
  StoredWorkoutSession,
  WorkoutBodyPartSet,
} from "../model/types"

// 이전 운동 기록 프리필 결과
export interface WorkoutHistoryPrefill {
  bodyParts: WorkoutBodyPartSet[]
  memoPlaceholder: string | null
  sourceSessionId: string | null
}

interface WorkoutHistoryPrefillOptions {
  isDeload?: boolean
}

// 세트 수 정규화
function normalizeSetCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.round(value))
    : 10
}

// 루틴 부위의 운동 부위 세트 변환
function toWorkoutBodyPartSet(part: RoutinePart): WorkoutBodyPartSet {
  return {
    part: part.part,
    details: part.details,
    setCount: 10,
  }
}

// 운동 세부 부위 비교 목록 생성
function getComparableDetails(item: WorkoutBodyPartSet): BodyPartDetail[] {
  const details = [
    ...(item.detail ? [item.detail] : []),
    ...(item.details ?? []),
  ]

  return [...new Set(details)].sort()
}

// 운동 부위 구성 비교 키 생성
function getWorkoutBodyPartHistoryKey(item: WorkoutBodyPartSet) {
  const details = getComparableDetails(item)
  return details.length > 0
    ? `${item.part}:${details.join(",")}`
    : `${item.part}:all`
}

// 운동 부위 구성 비교 키 목록 생성
function getBodyPartKeyList(bodyParts: WorkoutBodyPartSet[]) {
  return bodyParts.map(getWorkoutBodyPartHistoryKey).sort()
}

// 운동 부위 키 구성 일치 판별
function hasSameBodyPartKeys(
  left: WorkoutBodyPartSet[],
  right: WorkoutBodyPartSet[],
) {
  if (left.length !== right.length) {
    return false
  }

  const leftKeys = getBodyPartKeyList(left)
  const rightKeys = getBodyPartKeyList(right)
  return leftKeys.every((key, index) => key === rightKeys[index])
}

// 최신 동일 구성 세션 탐색
function findLatestExactSession(
  sessions: StoredWorkoutSession[],
  bodyParts: WorkoutBodyPartSet[],
  options: WorkoutHistoryPrefillOptions = {},
) {
  return sessions.find(
    (session) =>
      (options.isDeload === undefined ||
        session.isDeload === options.isDeload) &&
      hasSameBodyPartKeys(session.bodyParts, bodyParts),
  )
}

// 동일 구성 세션의 운동 부위 세트 조회 맵 생성
function getBodyPartSetMap(bodyParts: WorkoutBodyPartSet[]) {
  return new Map(
    bodyParts.map((item) => [getWorkoutBodyPartHistoryKey(item), item]),
  )
}

// 이전 운동 기록 기반 프리필 생성
export function buildWorkoutHistoryPrefill(
  sessions: StoredWorkoutSession[],
  bodyParts: WorkoutBodyPartSet[],
  options: WorkoutHistoryPrefillOptions = {},
): WorkoutHistoryPrefill {
  const exactSession = findLatestExactSession(sessions, bodyParts, options)
  const exactBodyPartMap = exactSession
    ? getBodyPartSetMap(exactSession.bodyParts)
    : null
  const prefilledBodyParts = exactBodyPartMap
    ? bodyParts.map((item) => {
        const previous = exactBodyPartMap.get(getWorkoutBodyPartHistoryKey(item))

        return {
          ...item,
          setCount: normalizeSetCount(previous?.setCount),
        }
      })
    : bodyParts.map((item) => ({ ...item }))

  return {
    bodyParts: prefilledBodyParts,
    memoPlaceholder:
      exactSession && exactSession.memo.trim().length > 0
        ? exactSession.memo
        : null,
    sourceSessionId: exactSession?.sessionId ?? null,
  }
}

// 루틴 부위 기반 이전 운동 기록 프리필 생성
export function buildRoutinePartHistoryPrefill(
  sessions: StoredWorkoutSession[],
  routineParts: RoutinePart[],
  options: WorkoutHistoryPrefillOptions = {},
): WorkoutHistoryPrefill {
  return buildWorkoutHistoryPrefill(
    sessions,
    routineParts.map(toWorkoutBodyPartSet),
    options,
  )
}
