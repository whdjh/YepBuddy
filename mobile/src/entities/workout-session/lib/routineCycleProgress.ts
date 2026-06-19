import type { StoredWorkoutSession, WorkoutBodyPartSet } from "../model/types"
import type {
  RoutinePart,
  RoutineCycleSession,
  RoutineCycleSettings,
} from "../model/routineCycle"
import type { RoutineCycleProgressState } from "./routineCycleState"
import {
  getLocalDateKeyFromIso,
  getTimestampMsFromIso,
} from "@/shared/lib/date"

/** 루틴 슬롯의 진행 상태: 미시작 / 일부 완료 / 완전 완료 / 대체 완료 */
export type RoutineCycleSlotStatus =
  | "pending"
  | "partial"
  | "completed"
  | "substituted"

/** 하나의 루틴 슬롯에 대한 진행 정보 */
export interface RoutineCycleSlotProgress {
  index: number
  routineSession: RoutineCycleSession
  matchedSession: StoredWorkoutSession | null
  status: RoutineCycleSlotStatus
}

/** 루틴 사이클 전체 진행 요약 */
export interface RoutineCycleProgress {
  totalSessions: number
  completedSessions: number
  remainingSessions: number
  slots: RoutineCycleSlotProgress[]
}

function getTotalRoutineCycleCount(settings: RoutineCycleSettings) {
  return Math.max(1, settings.trainingCycles) + Math.max(0, settings.deloadCycles)
}

/** 루틴 파트에 required details가 있을 때, 완료된 세트가 모두 포함하는지 확인 */
function detailsMatch(required: RoutinePart, completed: WorkoutBodyPartSet) {
  if (!required.details || required.details.length === 0) {
    return true
  }

  const completedDetails = completed.details ?? []
  return required.details.every((detail) => completedDetails.includes(detail))
}

/** 루틴 파트(part + details)가 완료된 세트와 일치하는지 확인 */
function partMatches(required: RoutinePart, completed: WorkoutBodyPartSet) {
  return required.part === completed.part && detailsMatch(required, completed)
}

/** details 무시하고 part만 겹치는지 확인 (partial 판정용) */
function partOverlaps(required: RoutinePart, completed: WorkoutBodyPartSet) {
  return required.part === completed.part
}

/** 실제 운동 부위가 루틴 세션의 모든 파트를 충족하는지 판단 */
export function areBodyPartsMatchingRoutineSession(
  bodyParts: WorkoutBodyPartSet[],
  routineSession: RoutineCycleSession,
) {
  return routineSession.parts.every((required) =>
    bodyParts.some((completed) => partMatches(required, completed)),
  )
}

/** 하나의 완료 세션이 루틴 세션의 모든 파트를 충족하는지 판단 */
export function isSessionMatchingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: RoutineCycleSession,
) {
  return areBodyPartsMatchingRoutineSession(
    session.bodyParts,
    routineSession,
  )
}

/** 대체 완료 메타데이터가 특정 루틴 슬롯을 가리키는지 판단 */
function isSessionSubstitutingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: RoutineCycleSession,
  index: number,
) {
  const substitution = session.routineSubstitution
  if (!substitution) {
    return false
  }

  return (
    substitution.routineSessionId === routineSession.id &&
    substitution.routineSessionIndex === index
  )
}

/** 완전 일치하지는 않지만, 루틴 파트 중 일부만 포함하는 세션인지 판단 */
function isSessionPartiallyMatchingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: RoutineCycleSession,
) {
  if (isSessionMatchingRoutineSession(session, routineSession)) {
    return false
  }

  return routineSession.parts.some((required) =>
    session.bodyParts.some((completed) => partOverlaps(required, completed)),
  )
}

/** 완료 세션 하나가 채울 수 있는 아직 비어 있는 루틴 슬롯 ID를 찾는다. */
function getMatchingUnfilledRoutineSessionId(
  session: StoredWorkoutSession,
  routineSessions: RoutineCycleSession[],
  filledSlotIds: Set<string>,
) {
  // 사용자가 특정 루틴 슬롯의 대체 운동으로 저장한 경우 실제 부위 일치보다 우선한다.
  const substitutedSlot = routineSessions.find((routineSession, index) => {
    return (
      !filledSlotIds.has(routineSession.id) &&
      isSessionSubstitutingRoutineSession(session, routineSession, index)
    )
  })

  if (substitutedSlot) {
    return substitutedSlot.id
  }

  // 대체 메타데이터가 없으면 실제 운동 부위가 완전히 일치하는 빈 슬롯을 찾는다.
  return (
    routineSessions.find(
      (routineSession) =>
        !filledSlotIds.has(routineSession.id) &&
        isSessionMatchingRoutineSession(session, routineSession),
    )?.id ?? null
  )
}

/** 저장된 세션을 오래된 순서로 재생하기 위한 정렬 */
function sortSessionsOldestFirst(sessions: StoredWorkoutSession[]) {
  return [...sessions].sort((a, b) => {
    const startedAtComparison = a.startedAt.localeCompare(b.startedAt)

    if (startedAtComparison !== 0) {
      return startedAtComparison
    }

    return a.completedAt.localeCompare(b.completedAt)
  })
}

/** 최근 완료 세션을 먼저 보여주거나 매칭하기 위한 정렬 */
function sortSessionsNewestFirst(sessions: StoredWorkoutSession[]) {
  return [...sessions].sort((a, b) => {
    const startedAtComparison = b.startedAt.localeCompare(a.startedAt)

    if (startedAtComparison !== 0) {
      return startedAtComparison
    }

    return b.completedAt.localeCompare(a.completedAt)
  })
}

/** 현재 사이클 시작 날짜/시각 이후에 시작한 세션인지 판단 */
function isSessionInRoutineCycle(
  settings: RoutineCycleSettings,
  session: StoredWorkoutSession,
) {
  const sessionDateKey = getLocalDateKeyFromIso(session.startedAt)
  if (sessionDateKey && sessionDateKey < settings.cycleStartDateKey) {
    return false
  }

  if (!settings.cycleStartedAtIso) {
    return true
  }

  const cycleStartedAtMs = getTimestampMsFromIso(settings.cycleStartedAtIso)
  const sessionStartedAtMs = getTimestampMsFromIso(session.startedAt)

  if (cycleStartedAtMs === null || sessionStartedAtMs === null) {
    return true
  }

  return sessionStartedAtMs >= cycleStartedAtMs
}

/**
 * 완료된 운동 세션 목록을 시간순으로 재생해 저장소에 둘 루틴 사이클 진행 상태를 재구성한다.
 * 각 루틴 슬롯이 한 번씩 채워지면 하나의 사이클이 완료된 것으로 보고 다음 사이클로 넘어간다.
 */
export function buildRoutineCycleProgressStateFromSessions(
  settings: RoutineCycleSettings,
  sessions: StoredWorkoutSession[],
  currentDateKey?: string,
): RoutineCycleProgressState {
  const routineSessions = settings.sessions
  const totalCycleCount = getTotalRoutineCycleCount(settings)
  const routineSlotCount = routineSessions.length
  let completedCycleCount = 0
  let filledSlotIds = new Set<string>()

  if (routineSlotCount === 0) {
    return {
      cycleStartDateKey: settings.cycleStartDateKey,
      completedCycleCount,
      filledSlotIds: [],
    }
  }

  sortSessionsOldestFirst(
    sessions.filter((session) => isSessionInRoutineCycle(settings, session)),
  ).forEach((session) => {
    if (completedCycleCount >= totalCycleCount) {
      return
    }

    // 현재 사이클에서 아직 채우지 않은 슬롯만 매칭해 같은 슬롯 중복 채움을 방지한다.
    const matchingSlotId = getMatchingUnfilledRoutineSessionId(
      session,
      routineSessions,
      filledSlotIds,
    )
    if (!matchingSlotId) {
      return
    }

    filledSlotIds.add(matchingSlotId)

    // 오늘 완료한 슬롯은 당일에는 현재 슬롯으로 유지하고, 다음 날짜부터 다음 슬롯/회차로 넘긴다.
    if (
      currentDateKey &&
      getLocalDateKeyFromIso(session.startedAt) === currentDateKey
    ) {
      return
    }

    // 모든 루틴 슬롯을 채우면 사이클 완료 횟수를 올리고 다음 사이클 슬롯 채움을 새로 시작한다.
    if (filledSlotIds.size === routineSlotCount) {
      completedCycleCount += 1
      filledSlotIds = new Set<string>()
    }
  })

  return {
    cycleStartDateKey: settings.cycleStartDateKey,
    completedCycleCount,
    filledSlotIds: [...filledSlotIds],
  }
}

/**
 * 루틴 세션 목록과 실제 완료 세션 목록을 받아 슬롯별 진행 상태를 계산
 * - completed: 루틴 슬롯을 완전히 충족하는 세션 있음
 * - partial: 루틴 슬롯을 일부만 충족하는 세션 있음
 * - pending: 해당 루틴 슬롯을 충족하는 세션 없음
 */
export function buildRoutineCycleProgress(
  routineSessions: RoutineCycleSession[],
  sessions: StoredWorkoutSession[],
): RoutineCycleProgress {
  // 이미 completed로 매칭된 세션 ID를 추적해 중복 매칭 방지
  const usedCompletedSessionIds = new Set<string>()

  const slots = routineSessions.map<RoutineCycleSlotProgress>(
    (routineSession, index) => {
      const substitutedSession = sessions.find(
        (session) =>
          !usedCompletedSessionIds.has(session.sessionId) &&
          isSessionSubstitutingRoutineSession(session, routineSession, index),
      )

      if (substitutedSession) {
        usedCompletedSessionIds.add(substitutedSession.sessionId)
        return {
          index,
          routineSession,
          matchedSession: substitutedSession,
          status: "substituted",
        }
      }

      const matchedSession = sessions.find(
        (session) =>
          !usedCompletedSessionIds.has(session.sessionId) &&
          isSessionMatchingRoutineSession(session, routineSession),
      )

      if (matchedSession) {
        usedCompletedSessionIds.add(matchedSession.sessionId)
        return {
          index,
          routineSession,
          matchedSession,
          status: "completed",
        }
      }

      const partialSession = sessions.find((session) =>
        isSessionPartiallyMatchingRoutineSession(session, routineSession),
      )

      return {
        index,
        routineSession,
        matchedSession: partialSession ?? null,
        status: partialSession ? "partial" : "pending",
      }
    },
  )

  const completedSessions = slots.filter(
    (slot) => slot.status === "completed" || slot.status === "substituted",
  ).length

  return {
    totalSessions: routineSessions.length,
    completedSessions,
    remainingSessions: Math.max(0, routineSessions.length - completedSessions),
    slots,
  }
}

/** 슬롯 기반 루틴 진행률 계산하고, 실제 세션 목록이 있으면 저장된 슬롯 ID가 아직 유효한 완료 세션을 가리키는지 검증 */
export function buildRoutineCycleProgressFromFilledSlots(
  routineSessions: RoutineCycleSession[],
  filledSlotIds: string[],
  sessions?: StoredWorkoutSession[],
): RoutineCycleProgress {
  const filledSlotIdSet = new Set(filledSlotIds)
  const sessionProgress = sessions
    ? buildRoutineCycleProgress(
        routineSessions,
        sortSessionsNewestFirst(sessions),
      )
    : null
  const slots = routineSessions.map<RoutineCycleSlotProgress>(
    (routineSession, index) => {
      const sessionSlot = sessionProgress?.slots[index] ?? null
      if (
        filledSlotIdSet.has(routineSession.id) &&
        sessionSlot &&
        (sessionSlot.status === "completed" ||
          sessionSlot.status === "substituted")
      ) {
        return sessionSlot
      }

      if (!filledSlotIdSet.has(routineSession.id)) {
        return {
          index,
          routineSession,
          matchedSession: null,
          status: "pending",
        }
      }

      if (!sessions) {
        return {
          index,
          routineSession,
          matchedSession: null,
          status: "completed",
        }
      }

      return {
        index,
        routineSession,
        matchedSession: null,
        status: "pending",
      }
    },
  )
  const completedSessions = slots.filter(
    (slot) => slot.status === "completed" || slot.status === "substituted",
  ).length

  return {
    totalSessions: routineSessions.length,
    completedSessions,
    remainingSessions: Math.max(0, routineSessions.length - completedSessions),
    slots,
  }
}

/** 아직 완료되지 않은 첫 번째 루틴 세션을 추천으로 반환(모두 완료시 null) */
export function getNextRoutineSuggestion(
  progress: RoutineCycleProgress,
): RoutineCycleSession | null {
  return (
    progress.slots.find(
      (slot) => slot.status !== "completed" && slot.status !== "substituted",
    )?.routineSession ?? null
  )
}
