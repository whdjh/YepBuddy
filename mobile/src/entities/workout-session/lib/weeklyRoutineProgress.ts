import type { StoredWorkoutSession, WorkoutBodyPartSet } from "../model/types"
import type { RoutinePart, WeeklyRoutineSession } from "../model/weeklyRoutine"

/** 루틴 슬롯의 진행 상태: 미시작 / 일부 완료 / 완전 완료 */
export type WeeklyRoutineSlotStatus = "pending" | "partial" | "completed"

/** 하나의 루틴 슬롯에 대한 진행 정보 */
export interface WeeklyRoutineSlotProgress {
  index: number
  routineSession: WeeklyRoutineSession
  matchedSession: StoredWorkoutSession | null
  status: WeeklyRoutineSlotStatus
}

/** 주간 루틴 전체 진행 요약 */
export interface WeeklyRoutineProgress {
  totalSessions: number
  completedSessions: number
  remainingSessions: number
  slots: WeeklyRoutineSlotProgress[]
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

/** 하나의 완료 세션이 루틴 세션의 모든 파트를 충족하는지 판단하고 루틴에 정의된 모든 part(+details)가 세션에 있어야 true
 */
export function isSessionMatchingRoutineSession(
  session: StoredWorkoutSession,
  routineSession: WeeklyRoutineSession,
) {
  return routineSession.parts.every((required) =>
    session.bodyParts.some((completed) => partMatches(required, completed)),
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

/**
 * 주간 루틴 세션 목록과 실제 완료 세션 목록을 받아 슬롯별 진행 상태를 계산
 * - completed: 루틴 슬롯을 완전히 충족하는 세션 있음
 * - partial: 루틴 슬롯을 일부만 충족하는 세션 있음
 * - pending: 해당 루틴 슬롯을 충족하는 세션 없음
 */
export function buildWeeklyRoutineProgress(
  routineSessions: WeeklyRoutineSession[],
  weekSessions: StoredWorkoutSession[],
): WeeklyRoutineProgress {
  // 이미 completed로 매칭된 세션 ID를 추적해 중복 매칭 방지
  const usedCompletedSessionIds = new Set<string>()

  const slots = routineSessions.map<WeeklyRoutineSlotProgress>(
    (routineSession, index) => {
      const matchedSession = weekSessions.find(
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

      const partialSession = weekSessions.find((session) =>
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
    (slot) => slot.status === "completed",
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
    progress.slots.find((slot) => slot.status !== "completed")
      ?.routineSession ?? null
  )
}
