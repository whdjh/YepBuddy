import type { BodyPart, BodyPartDetail } from "./types"

// 루틴 세션 내 단일 운동 부위 항목
export interface RoutinePart {
  part: BodyPart
  details?: BodyPartDetail[]
}

// 하나의 루틴 세션
export interface WeeklyRoutineSession {
  id: string
  parts: RoutinePart[]
}

// 사용자가 저장한 주간 루틴 전체 설정
export interface WeeklyRoutineSettings {
  sessions: WeeklyRoutineSession[]
  cycleStartDateKey: string
  regularWeeks: number
  deloadWeeks: number
}

// 루틴 기능을 아직 묻지 않았는지, 켰는지, 껐는지 나타내는 사용자 선택 상태
export type WeeklyRoutineFeatureStatus =
  | "unasked"
  | "enabled"
  | "disabled"

export interface WeeklyRoutinePromptState {
  cycleRenewalDismissedForWeekStartDateKey: string | null
}

// 기본 루틴 사이클: 4주 일반 루틴 + 1주 디로드
export const DEFAULT_WEEKLY_ROUTINE_REGULAR_WEEKS = 4
export const DEFAULT_WEEKLY_ROUTINE_DELOAD_WEEKS = 1

// 사용자 설정 없을 때 사용하는 기본 주간 루틴
export const DEFAULT_WEEKLY_ROUTINE_SESSIONS: WeeklyRoutineSession[] = [
  { id: "chest", parts: [{ part: "chest" }] },
  { id: "back", parts: [{ part: "back" }] },
  {
    id: "shoulders-arms",
    parts: [{ part: "shoulders" }, { part: "arms" }],
  },
  { id: "legs", parts: [{ part: "legs" }] },
]

const WEEKLY_ROUTINE_SESSION_PRESETS: RoutinePart[][] = [
  [{ part: "chest" }],
  [{ part: "back" }],
  [{ part: "shoulders" }, { part: "arms" }],
  [{ part: "legs" }],
  [{ part: "core" }],
]

// 루틴 안내 모달의 기본 노출 상태
export const DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE: WeeklyRoutinePromptState = {
  cycleRenewalDismissedForWeekStartDateKey: null,
}

// 이전 버전에 저장된 루틴 설정이 있으면 기존 사용자는 루틴 ON 상태로 간주
export function resolveWeeklyRoutineFeatureStatus(
  storedStatus: WeeklyRoutineFeatureStatus | null,
  hasStoredSettings: boolean,
): WeeklyRoutineFeatureStatus {
  if (storedStatus) {
    return storedStatus
  }

  return hasStoredSettings ? "enabled" : "unasked"
}

// 새 사용자를 위한 기본 주간 루틴 설정 생성
export function createDefaultWeeklyRoutineSettings(
  cycleStartDateKey: string,
): WeeklyRoutineSettings {
  return {
    sessions: DEFAULT_WEEKLY_ROUTINE_SESSIONS,
    cycleStartDateKey,
    regularWeeks: DEFAULT_WEEKLY_ROUTINE_REGULAR_WEEKS,
    deloadWeeks: DEFAULT_WEEKLY_ROUTINE_DELOAD_WEEKS,
  }
}

// 이전 버전 저장값에 새 필드가 없어도 안전하게 기본값을 채움
export function normalizeWeeklyRoutineSettings(
  settings: Partial<WeeklyRoutineSettings>,
  fallbackCycleStartDateKey: string,
): WeeklyRoutineSettings {
  return {
    sessions:
      settings.sessions && settings.sessions.length > 0
        ? settings.sessions
        : DEFAULT_WEEKLY_ROUTINE_SESSIONS,
    cycleStartDateKey:
      settings.cycleStartDateKey ?? fallbackCycleStartDateKey,
    regularWeeks:
      settings.regularWeeks ?? DEFAULT_WEEKLY_ROUTINE_REGULAR_WEEKS,
    deloadWeeks:
      settings.deloadWeeks ?? DEFAULT_WEEKLY_ROUTINE_DELOAD_WEEKS,
  }
}

// 일반 주차 수가 바뀌면 루틴 세션 개수도 같은 수로 맞춤
export function resizeWeeklyRoutineSessions(
  sessions: WeeklyRoutineSession[],
  nextCount: number,
): WeeklyRoutineSession[] {
  const normalizedCount = Math.max(1, Math.floor(nextCount))

  if (sessions.length >= normalizedCount) {
    return sessions.slice(0, normalizedCount)
  }

  const nextSessions = [...sessions]

  while (nextSessions.length < normalizedCount) {
    const index = nextSessions.length
    const preset =
      WEEKLY_ROUTINE_SESSION_PRESETS[index] ??
      WEEKLY_ROUTINE_SESSION_PRESETS[
        index % WEEKLY_ROUTINE_SESSION_PRESETS.length
      ]

    nextSessions.push({
      id: `routine-${index + 1}`,
      parts: preset,
    })
  }

  return nextSessions
}
