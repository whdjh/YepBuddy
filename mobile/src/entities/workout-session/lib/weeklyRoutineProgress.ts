import type { StoredWorkoutSession, WorkoutBodyPartSet } from "../model/types"
import type {
  RoutinePart,
  WeeklyRoutineSession,
  WeeklyRoutineSettings,
} from "../model/weeklyRoutine"
import type { WeeklyRoutineCycleProgress } from "./weeklyRoutineCycle"

/** 루틴 슬롯의 진행 상태: 미시작 / 일부 완료 / 완전 완료 / 대체 완료 */
export type WeeklyRoutineSlotStatus =
  | "pending"
  | "partial"
  | "completed"
  | "substituted"

/** 하나의 루틴 슬롯에 대한 진행 정보 */
export interface WeeklyRoutineSlotProgress {
  index: number
  routineSession: WeeklyRoutineSession
  matchedSession: StoredWorkoutSession | null
  status: WeeklyRoutineSlotStatus
}

/** 루틴 사이클 전체 진행 요약 */
export interface WeeklyRoutineProgress {
  totalSessions: number
  completedSessions: number
  remainingSessions: number
  slots: WeeklyRoutineSlotProgress[]
}

function getTotalRoutineCycleCount(settings: WeeklyRoutineSettings) {
  return Math.max(1, settings.trainingWeeks) + Math.max(0, settings.deloadWeeks)
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
  routineSession: WeeklyRoutineSession,
) {
  return routineSession.parts.every((required) =>
    bodyParts.some((completed) => partMatches(required, completed)),
  )
}

/** 하나의 완료 세션이 루틴 세션의 모든 파트를 충족하는지 판단 */
export function isSessionMatchingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: WeeklyRoutineSession,
) {
  return areBodyPartsMatchingRoutineSession(
    session.bodyParts,
    routineSession,
  )
}

/** 대체 완료 메타데이터가 특정 루틴 슬롯을 가리키는지 판단 */
function isSessionSubstitutingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: WeeklyRoutineSession,
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

/**
 * 완전 일치하지는 않지만, 루틴 파트 중 일부만 포함하는 세션인지 판단 (partial용)
 */
function isSessionPartiallyMatchingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: WeeklyRoutineSession,
) {
  if (isSessionMatchingRoutineSession(session, routineSession)) {
    return false
  }

  return routineSession.parts.some((required) =>
    session.bodyParts.some((completed) => partOverlaps(required, completed)),
  )
}

function getMatchingUnfilledRoutineSessionId(
  session: StoredWorkoutSession,
  routineSessions: WeeklyRoutineSession[],
  filledSlotIds: Set<string>,
) {
  const substitutedSlot = routineSessions.find((routineSession, index) => {
    return (
      !filledSlotIds.has(routineSession.id) &&
      isSessionSubstitutingRoutineSession(session, routineSession, index)
    )
  })

  if (substitutedSlot) {
    return substitutedSlot.id
  }

  return (
    routineSessions.find(
      (routineSession) =>
        !filledSlotIds.has(routineSession.id) &&
        isSessionMatchingRoutineSession(session, routineSession),
    )?.id ?? null
  )
}

function sortSessionsOldestFirst(sessions: StoredWorkoutSession[]) {
  return [...sessions].sort((a, b) => {
    const startedAtComparison = a.startedAt.localeCompare(b.startedAt)

    if (startedAtComparison !== 0) {
      return startedAtComparison
    }

    return a.completedAt.localeCompare(b.completedAt)
  })
}

function sortSessionsNewestFirst(sessions: StoredWorkoutSession[]) {
  return [...sessions].sort((a, b) => {
    const startedAtComparison = b.startedAt.localeCompare(a.startedAt)

    if (startedAtComparison !== 0) {
      return startedAtComparison
    }

    return b.completedAt.localeCompare(a.completedAt)
  })
}

export function buildWeeklyRoutineCycleProgressFromSessions(
  settings: WeeklyRoutineSettings,
  sessions: StoredWorkoutSession[],
): WeeklyRoutineCycleProgress {
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

  sortSessionsOldestFirst(sessions).forEach((session) => {
    if (completedCycleCount >= totalCycleCount) {
      return
    }

    const matchingSlotId = getMatchingUnfilledRoutineSessionId(
      session,
      routineSessions,
      filledSlotIds,
    )
    if (!matchingSlotId) {
      return
    }

    filledSlotIds.add(matchingSlotId)

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
export function buildWeeklyRoutineProgress(
  routineSessions: WeeklyRoutineSession[],
  sessions: StoredWorkoutSession[],
): WeeklyRoutineProgress {
  // 이미 completed로 매칭된 세션 ID를 추적해 중복 매칭 방지
  const usedCompletedSessionIds = new Set<string>()

  const slots = routineSessions.map<WeeklyRoutineSlotProgress>(
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

/**
 * 슬롯 기반 루틴 진행률 계산.
 * 실제 세션 목록이 있으면 저장된 슬롯 ID가 아직 유효한 완료 세션을 가리키는지 검증한다.
 */
export function buildWeeklyRoutineProgressFromFilledSlots(
  routineSessions: WeeklyRoutineSession[],
  filledSlotIds: string[],
  sessions?: StoredWorkoutSession[],
): WeeklyRoutineProgress {
  const filledSlotIdSet = new Set(filledSlotIds)
  const sessionProgress = sessions
    ? buildWeeklyRoutineProgress(
        routineSessions,
        sortSessionsNewestFirst(sessions),
      )
    : null
  const slots = routineSessions.map<WeeklyRoutineSlotProgress>(
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

/**
 * 아직 완료되지 않은 첫 번째 루틴 세션을 추천으로 반환
 * - 모두 완료됐으면 null 반환
 */
export function getNextRoutineSuggestion(
  progress: WeeklyRoutineProgress,
): WeeklyRoutineSession | null {
  return (
    progress.slots.find(
      (slot) => slot.status !== "completed" && slot.status !== "substituted",
    )?.routineSession ?? null
  )
}
