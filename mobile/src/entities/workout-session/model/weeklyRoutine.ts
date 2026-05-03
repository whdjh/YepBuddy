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
  trainingWeeks: number
  deloadWeeks: number
  splitCount: number
}

// 루틴 기능을 아직 묻지 않았는지, 켰는지, 껐는지 나타내는 사용자 선택 상태
export type WeeklyRoutineFeatureStatus =
  | "unasked"
  | "enabled"
  | "disabled"

export interface WeeklyRoutinePromptState {
  cycleRenewalDismissedForWeekStartDateKey: string | null
}

// 기본 루틴 사이클: 4주 훈련 + 1주 디로드
export const DEFAULT_WEEKLY_ROUTINE_TRAINING_WEEKS = 4
export const DEFAULT_WEEKLY_ROUTINE_DELOAD_WEEKS = 1
export const DEFAULT_WEEKLY_ROUTINE_SPLIT_COUNT = 5
export const MIN_WEEKLY_ROUTINE_SPLIT_COUNT = 1
export const MAX_WEEKLY_ROUTINE_SPLIT_COUNT = 7

// 사용자 설정 없을 때 사용하는 기본 주간 루틴
export const DEFAULT_WEEKLY_ROUTINE_SESSIONS: WeeklyRoutineSession[] = [
  { id: "chest", parts: [{ part: "chest" }] },
  { id: "back", parts: [{ part: "back" }] },
  { id: "shoulders", parts: [{ part: "shoulders" }] },
  { id: "arms", parts: [{ part: "arms" }] },
  { id: "legs", parts: [{ part: "legs" }] },
]

const WEEKLY_ROUTINE_SESSION_PRESETS: RoutinePart[][] = [
  [{ part: "chest" }],
  [{ part: "back" }],
  [{ part: "shoulders" }],
  [{ part: "arms" }],
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
    trainingWeeks: DEFAULT_WEEKLY_ROUTINE_TRAINING_WEEKS,
    deloadWeeks: DEFAULT_WEEKLY_ROUTINE_DELOAD_WEEKS,
    splitCount: DEFAULT_WEEKLY_ROUTINE_SPLIT_COUNT,
  }
}

type LegacyWeeklyRoutineSettings = Partial<WeeklyRoutineSettings> & {
  regularWeeks?: number
}

// 이전 버전 저장값에 새 필드가 없어도 안전하게 기본값을 채움
export function normalizeWeeklyRoutineSettings(
  settings: LegacyWeeklyRoutineSettings,
  fallbackCycleStartDateKey: string,
): WeeklyRoutineSettings {
  const legacyRegularWeeks = settings.regularWeeks
  const trainingWeeks = Math.max(
    1,
    settings.trainingWeeks ??
      legacyRegularWeeks ??
      DEFAULT_WEEKLY_ROUTINE_TRAINING_WEEKS,
  )
  const deloadWeeks = Math.max(
    0,
    settings.deloadWeeks ?? DEFAULT_WEEKLY_ROUTINE_DELOAD_WEEKS,
  )
  const splitCount = Math.min(
    MAX_WEEKLY_ROUTINE_SPLIT_COUNT,
    Math.max(
      MIN_WEEKLY_ROUTINE_SPLIT_COUNT,
      settings.splitCount ??
        legacyRegularWeeks ??
        DEFAULT_WEEKLY_ROUTINE_SPLIT_COUNT,
    ),
  )
  const baseSessions =
    settings.sessions && settings.sessions.length > 0
      ? settings.sessions
      : DEFAULT_WEEKLY_ROUTINE_SESSIONS

  return {
    sessions: resizeWeeklyRoutineSessions(baseSessions, splitCount),
    cycleStartDateKey:
      settings.cycleStartDateKey ?? fallbackCycleStartDateKey,
    trainingWeeks,
    deloadWeeks,
    splitCount,
  }
}

// 분할 수가 바뀌면 루틴 세션 개수도 같은 수로 맞춤
export function resizeWeeklyRoutineSessions(
  sessions: WeeklyRoutineSession[],
  nextCount: number,
): WeeklyRoutineSession[] {
  const normalizedCount = Math.min(
    MAX_WEEKLY_ROUTINE_SPLIT_COUNT,
    Math.max(MIN_WEEKLY_ROUTINE_SPLIT_COUNT, Math.floor(nextCount)),
  )

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
