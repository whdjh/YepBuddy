import type { RoutinePart } from "../model/routineCycle"
import type {
  StoredWorkoutSession,
  WorkoutBodyPartSet,
} from "../model/types"
import { getWorkoutBodyPartDetails } from "../model/bodyPartSet"

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

// 루틴의 세부 부위는 운동 중 독립적으로 세트 수를 기록할 수 있게 개별 항목으로 변환
function toWorkoutBodyPartSets(part: RoutinePart): WorkoutBodyPartSet[] {
  if (part.details && part.details.length > 0) {
    return part.details.map((detail) => ({
      part: part.part,
      detail,
      setCount: 10,
    }))
  }

  return [{ part: part.part, setCount: 10 }]
}

// 묶음/개별 세부 부위를 같은 구성으로 비교할 수 있게 세부 부위 단위 키 생성
function getWorkoutBodyPartHistoryKeys(item: WorkoutBodyPartSet) {
  const details = [
    ...new Set(getWorkoutBodyPartDetails([item], item.part)),
  ].sort()
  return details.length > 0
    ? details.map((detail) => `${item.part}:${detail}`)
    : [`${item.part}:all`]
}

// 운동 부위 구성 비교 키 목록 생성
function getBodyPartKeyList(bodyParts: WorkoutBodyPartSet[]) {
  return bodyParts.flatMap(getWorkoutBodyPartHistoryKeys).sort()
}

// 운동 부위 키 구성 일치 판별
function hasSameBodyPartKeys(
  left: WorkoutBodyPartSet[],
  right: WorkoutBodyPartSet[],
) {
  const leftKeys = getBodyPartKeyList(left)
  const rightKeys = getBodyPartKeyList(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }

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
    bodyParts.flatMap((item) =>
      getWorkoutBodyPartHistoryKeys(item).map((key) => [key, item] as const),
    ),
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
        const previous = getWorkoutBodyPartHistoryKeys(item)
          .map((key) => exactBodyPartMap.get(key))
          .find((candidate) => candidate !== undefined)

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
    routineParts.flatMap(toWorkoutBodyPartSets),
    options,
  )
}
