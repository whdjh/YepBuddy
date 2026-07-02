import {
  getStoredWorkoutSessionDurationMinutes,
  getStoredWorkoutSessionSetCount,
  getWorkoutBodyPartSetLabel,
  getWorkoutSessionKcalFromSummaries,
  type BodyPart,
  type BodyPartDetail,
  type RoutineCycleProgress,
  type RoutineCycleSession,
  type StoredWorkoutSession,
  type WorkoutHealthKitWorkout,
} from "@/entities/workout-session"

export type RoutineCycleSessionRowStatus = "completed" | "planned" | "deload"

export interface RoutineCycleSessionRow {
  id: string
  sessionId: string | null
  status: RoutineCycleSessionRowStatus
  bodyPart: string
  representativeBodyPart: BodyPart | null
  day: string
  isDeload: boolean
  durationMin: number | null
  sets: number | null
  kcal: number | string | null
}

interface RoutineCycleSessionRowsFormatters {
  bodyPartLabel: (part: BodyPart) => string
  bodyPartDetailLabel: (detail: BodyPartDetail) => string
  formatDate: (date: Date) => string
}

interface BuildRoutineCycleSessionRowsInput extends RoutineCycleSessionRowsFormatters {
  progress: RoutineCycleProgress
  deloadLabel?: string
  fallbackBodyPartLabel: string
  hidePlannedRows?: boolean
  isDeloadCycle?: boolean
  plannedLabel: string
  workouts?: WorkoutHealthKitWorkout[]
}

// 루틴 슬롯에 매칭된 완료 운동 기록을 카드 행으로 변환
function getActualSessionRow(
  session: StoredWorkoutSession,
  {
    fallbackBodyPartLabel,
    bodyPartLabel,
    bodyPartDetailLabel,
    formatDate,
    workouts = [],
  }: Pick<
    BuildRoutineCycleSessionRowsInput,
    | "fallbackBodyPartLabel"
    | "bodyPartLabel"
    | "bodyPartDetailLabel"
    | "formatDate"
    | "workouts"
  >,
): RoutineCycleSessionRow {
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
    isDeload: session.isDeload === true,
    durationMin: getStoredWorkoutSessionDurationMinutes(session),
    sets: getStoredWorkoutSessionSetCount(session),
    kcal: getWorkoutSessionKcalFromSummaries(session, workouts) ?? "--",
  }
}

// 루틴 세션의 부위 조합을 화면 표시용 라벨로 변환
function getRoutineSessionLabel(
  routineSession: RoutineCycleSession,
  { bodyPartLabel, bodyPartDetailLabel }: RoutineCycleSessionRowsFormatters,
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
  routineSession: RoutineCycleSession,
  input: BuildRoutineCycleSessionRowsInput,
): RoutineCycleSessionRow {
  const isDeloadCycle = input.isDeloadCycle === true

  return {
    id: `routine:${routineSession.id}`,
    sessionId: null,
    status: isDeloadCycle ? "deload" : "planned",
    bodyPart: getRoutineSessionLabel(routineSession, input),
    representativeBodyPart: routineSession.parts[0]?.part ?? null,
    day: isDeloadCycle
      ? (input.deloadLabel ?? input.plannedLabel)
      : input.plannedLabel,
    isDeload: isDeloadCycle,
    durationMin: null,
    sets: null,
    kcal: null,
  }
}

// 현재 루틴 사이클의 슬롯만 카드 행으로 생성
export function buildRoutineCycleSessionRows(
  input: BuildRoutineCycleSessionRowsInput,
): RoutineCycleSessionRow[] {
  const emittedSessionIds = new Set<string>()
  const rows: RoutineCycleSessionRow[] = []

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

    if (
      slot.status !== "completed" &&
      slot.status !== "substituted" &&
      !input.hidePlannedRows
    ) {
      rows.push(getPlannedRoutineRow(slot.routineSession, input))
    }
  })

  return rows
}
