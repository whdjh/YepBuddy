import type { BodyPart, BodyPartDetail } from "./types"

// 루틴 세션 내 단일 운동 부위 항목
export interface RoutinePart {
  part: BodyPart
  details?: BodyPartDetail[]
}

// 하나의 루틴 세션
export interface RoutineCycleSession {
  id: string
  parts: RoutinePart[]
}

// 사용자가 저장한 루틴 사이클 전체 설정
export interface RoutineCycleSettings {
  sessions: RoutineCycleSession[]
  cycleStartDateKey: string
  cycleStartedAtIso: string | null
  trainingCycles: number
  deloadCycles: number
  splitCount: number
}

// 루틴 기능을 아직 묻지 않았는지, 켰는지, 껐는지 나타내는 사용자 선택 상태
export type RoutineCycleFeatureStatus =
  | "unasked"
  | "enabled"
  | "disabled"

export interface RoutineCyclePromptState {
  cycleRenewalDismissedForAnchorDateKey: string | null
}

// 기본 루틴 사이클: 4회 훈련 + 1회 디로드
export const DEFAULT_ROUTINE_CYCLE_TRAINING_CYCLES = 4
export const DEFAULT_ROUTINE_CYCLE_DELOAD_CYCLES = 1
export const DEFAULT_ROUTINE_CYCLE_SPLIT_COUNT = 5
export const MIN_ROUTINE_CYCLE_SPLIT_COUNT = 1
export const MAX_ROUTINE_CYCLE_SPLIT_COUNT = 7

// 사용자 설정 없을 때 사용하는 기본 루틴 사이클
export const DEFAULT_ROUTINE_CYCLE_SESSIONS: RoutineCycleSession[] = [
  { id: "chest", parts: [{ part: "chest" }] },
  { id: "back", parts: [{ part: "back" }] },
  { id: "shoulders", parts: [{ part: "shoulders" }] },
  { id: "arms", parts: [{ part: "arms" }] },
  { id: "legs", parts: [{ part: "legs" }] },
]

const ROUTINE_CYCLE_SESSION_PRESETS: RoutinePart[][] = [
  [{ part: "chest" }],
  [{ part: "back" }],
  [{ part: "shoulders" }],
  [{ part: "arms" }],
  [{ part: "legs" }],
  [{ part: "core" }],
]

// 루틴 안내 모달의 기본 노출 상태
export const DEFAULT_ROUTINE_CYCLE_PROMPT_STATE: RoutineCyclePromptState = {
  cycleRenewalDismissedForAnchorDateKey: null,
}

// 이전 버전에 저장된 루틴 설정이 있으면 기존 사용자는 루틴 ON 상태로 간주
export function resolveRoutineCycleFeatureStatus(
  storedStatus: RoutineCycleFeatureStatus | null,
  hasStoredSettings: boolean,
): RoutineCycleFeatureStatus {
  if (storedStatus) {
    return storedStatus
  }

  return hasStoredSettings ? "enabled" : "unasked"
}

// 새 사용자를 위한 기본 루틴 사이클 설정 생성
export function createDefaultRoutineCycleSettings(
  cycleStartDateKey: string,
): RoutineCycleSettings {
  return {
    sessions: DEFAULT_ROUTINE_CYCLE_SESSIONS,
    cycleStartDateKey,
    cycleStartedAtIso: null,
    trainingCycles: DEFAULT_ROUTINE_CYCLE_TRAINING_CYCLES,
    deloadCycles: DEFAULT_ROUTINE_CYCLE_DELOAD_CYCLES,
    splitCount: DEFAULT_ROUTINE_CYCLE_SPLIT_COUNT,
  }
}

type LegacyRoutineCycleSettings = Partial<RoutineCycleSettings> & {
  deloadWeeks?: number
  regularCycles?: number
  regularWeeks?: number
  trainingWeeks?: number
}

// 이전 버전 저장값에 새 필드가 없어도 안전하게 기본값을 채움
export function normalizeRoutineCycleSettings(
  settings: LegacyRoutineCycleSettings,
  fallbackCycleStartDateKey: string,
): RoutineCycleSettings {
  const legacyRegularCycleCount = settings.regularCycles ?? settings.regularWeeks
  const trainingCycles = Math.max(
    1,
    settings.trainingCycles ??
      settings.trainingWeeks ??
      legacyRegularCycleCount ??
      DEFAULT_ROUTINE_CYCLE_TRAINING_CYCLES,
  )
  const deloadCycles = Math.max(
    0,
    settings.deloadCycles ??
      settings.deloadWeeks ??
      DEFAULT_ROUTINE_CYCLE_DELOAD_CYCLES,
  )
  const splitCount = Math.min(
    MAX_ROUTINE_CYCLE_SPLIT_COUNT,
    Math.max(
      MIN_ROUTINE_CYCLE_SPLIT_COUNT,
      settings.splitCount ??
        legacyRegularCycleCount ??
        DEFAULT_ROUTINE_CYCLE_SPLIT_COUNT,
    ),
  )
  const baseSessions =
    settings.sessions && settings.sessions.length > 0
      ? settings.sessions
      : DEFAULT_ROUTINE_CYCLE_SESSIONS

  return {
    sessions: resizeRoutineCycleSessions(baseSessions, splitCount),
    cycleStartDateKey:
      settings.cycleStartDateKey ?? fallbackCycleStartDateKey,
    cycleStartedAtIso:
      typeof settings.cycleStartedAtIso === "string" &&
      Number.isFinite(new Date(settings.cycleStartedAtIso).getTime())
        ? settings.cycleStartedAtIso
        : null,
    trainingCycles,
    deloadCycles,
    splitCount,
  }
}

// 분할 수가 바뀌면 루틴 세션 개수도 같은 수로 맞춤
export function resizeRoutineCycleSessions(
  sessions: RoutineCycleSession[],
  nextCount: number,
): RoutineCycleSession[] {
  const normalizedCount = Math.min(
    MAX_ROUTINE_CYCLE_SPLIT_COUNT,
    Math.max(MIN_ROUTINE_CYCLE_SPLIT_COUNT, Math.floor(nextCount)),
  )

  if (sessions.length >= normalizedCount) {
    return sessions.slice(0, normalizedCount)
  }

  const nextSessions = [...sessions]

  while (nextSessions.length < normalizedCount) {
    const index = nextSessions.length
    const preset =
      ROUTINE_CYCLE_SESSION_PRESETS[index] ??
      ROUTINE_CYCLE_SESSION_PRESETS[
        index % ROUTINE_CYCLE_SESSION_PRESETS.length
      ]

    nextSessions.push({
      id: `routine-${index + 1}`,
      parts: preset,
    })
  }

  return nextSessions
}
