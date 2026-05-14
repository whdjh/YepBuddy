import {
  getWorkoutBodyPartSetLabel,
} from "@/entities/workout-session/model/bodyPartSet"
import type {
  BodyPart,
  BodyPartDetail,
  StoredWorkoutSession,
} from "@/entities/workout-session/model/types"
import type {
  WeeklyRoutineProgress,
} from "@/entities/workout-session/lib/weeklyRoutineProgress"
import type { WeeklyRoutineSession } from "@/entities/workout-session/model/weeklyRoutine"
import {
  getStoredWorkoutSessionDurationMinutes,
  getStoredWorkoutSessionSetCount,
} from "@/entities/workout-session/lib/sessionMetrics"

export type WeeklySessionRowStatus = "completed" | "planned"

export interface WeeklySessionRow {
  id: string
  sessionId: string | null
  status: WeeklySessionRowStatus
  bodyPart: string
  representativeBodyPart: BodyPart | null
  day: string
  durationMin: number | null
  sets: number | null
  kcal: number | string | null
}

interface WeeklySessionRowsFormatters {
  bodyPartLabel: (part: BodyPart) => string
  bodyPartDetailLabel: (detail: BodyPartDetail) => string
  formatDate: (date: Date) => string
}

interface BuildWeeklySessionRowsInput extends WeeklySessionRowsFormatters {
  weekSessions: StoredWorkoutSession[]
  progress: WeeklyRoutineProgress
  fallbackBodyPartLabel: string
  plannedLabel: string
}

// 완료된 운동 기록을 이번 주 세션 행으로 변환
function getActualSessionRow(
  session: StoredWorkoutSession,
  {
    fallbackBodyPartLabel,
    bodyPartLabel,
    bodyPartDetailLabel,
    formatDate,
  }: Pick<
    BuildWeeklySessionRowsInput,
    | "fallbackBodyPartLabel"
    | "bodyPartLabel"
    | "bodyPartDetailLabel"
    | "formatDate"
  >,
): WeeklySessionRow {
  return {
    id: `session:${session.sessionId}`,
    sessionId: session.sessionId,
    status: "completed",
    bodyPart:
      session.bodyParts.length === 0
        ? fallbackBodyPartLabel
        : session.bodyParts
            .map((item) =>
              getWorkoutBodyPartSetLabel(item, {
                bodyPartLabel,
                bodyPartDetailLabel,
              }),
            )
            .join(", "),
    representativeBodyPart: session.bodyParts[0]?.part ?? null,
    day: formatDate(new Date(session.startedAt)),
    durationMin: getStoredWorkoutSessionDurationMinutes(session),
    sets: getStoredWorkoutSessionSetCount(session),
    kcal: "--",
  }
}

// 루틴 세션의 부위 조합을 화면 표시용 라벨로 변환
function getRoutineSessionLabel(
  routineSession: WeeklyRoutineSession,
  { bodyPartLabel, bodyPartDetailLabel }: WeeklySessionRowsFormatters,
) {
  return routineSession.parts
    .map((part) => {
      const parentLabel = bodyPartLabel(part.part)
      const details = part.details ?? []

      if (details.length === 0) {
        return parentLabel
      }

      return `${parentLabel} ${details.map(bodyPartDetailLabel).join(", ")}`
    })
    .join(" / ")
}

// 아직 완료되지 않은 루틴 슬롯을 예정 행으로 변환
function getPlannedRoutineRow(
  routineSession: WeeklyRoutineSession,
  input: BuildWeeklySessionRowsInput,
): WeeklySessionRow {
  return {
    id: `routine:${routineSession.id}`,
    sessionId: null,
    status: "planned",
    bodyPart: getRoutineSessionLabel(routineSession, input),
    representativeBodyPart: routineSession.parts[0]?.part ?? null,
    day: input.plannedLabel,
    durationMin: null,
    sets: null,
    kcal: null,
  }
}

// 루틴 진행 상태 기준으로 실제 세션이 있으면 완료 행, 없으면 예정 행을 생성
export function buildWeeklySessionRows(
  input: BuildWeeklySessionRowsInput,
): WeeklySessionRow[] {
  const emittedSessionIds = new Set<string>()
  const rows: WeeklySessionRow[] = []

  input.progress.slots.forEach((slot) => {
    if (
      slot.status === "substituted" &&
      slot.matchedSession &&
      !emittedSessionIds.has(slot.matchedSession.sessionId)
    ) {
      emittedSessionIds.add(slot.matchedSession.sessionId)
      rows.push(getActualSessionRow(slot.matchedSession, input))
      return
    }

    if (
      slot.status === "completed" &&
      slot.matchedSession &&
      !emittedSessionIds.has(slot.matchedSession.sessionId)
    ) {
      emittedSessionIds.add(slot.matchedSession.sessionId)
      rows.push(getActualSessionRow(slot.matchedSession, input))
      return
    }

    if (slot.status !== "completed" && slot.status !== "substituted") {
      rows.push(getPlannedRoutineRow(slot.routineSession, input))
    }
  })

  input.weekSessions.forEach((session) => {
    if (!emittedSessionIds.has(session.sessionId)) {
      emittedSessionIds.add(session.sessionId)
      rows.push(getActualSessionRow(session, input))
    }
  })

  return rows
}
