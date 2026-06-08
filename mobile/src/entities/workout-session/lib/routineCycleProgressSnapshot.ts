import { getThisWeekDateRange } from "@/shared/lib/date"
import {
  createRoutineCycleProgressState,
  getRoutineCycleStateFromProgress,
  type RoutineCycleProgressState,
} from "./routineCycleState"
import {
  DEFAULT_ROUTINE_CYCLE_SESSIONS,
  createDefaultRoutineCycleSettings,
  normalizeRoutineCycleSettings,
  type RoutineCycleFeatureStatus,
  type RoutineCycleSession,
  type RoutineCycleSettings,
} from "../model/routineCycle"
import {
  getAllStoredWorkoutSessions,
} from "../model/sessionStorage"
import {
  loadRoutineCycleProgressState,
  loadRoutineCycleFeatureStatus,
  loadRoutineCycleSettings,
} from "../model/routineCycleStorage"
import type { StoredWorkoutSession } from "../model/types"
import {
  buildRoutineCycleProgressStateFromSessions,
  buildRoutineCycleProgressFromFilledSlots,
  getNextRoutineSuggestion,
  type RoutineCycleProgress,
} from "./routineCycleProgress"

interface CycleAnchorDateRange {
  startDateKey: string
  endDateKey: string
}

interface RoutineCycleProgressSnapshotInput {
  cycleProgress: RoutineCycleProgressState | null
  currentCycleAnchorDateKey: string
  featureStatus: RoutineCycleFeatureStatus
  sessions: StoredWorkoutSession[]
  settings: RoutineCycleSettings | null
}

interface LoadRoutineCycleProgressSnapshotOptions {
  getAllStoredWorkoutSessions?: typeof getAllStoredWorkoutSessions
  getCycleAnchorDateRange?: () => CycleAnchorDateRange
  loadRoutineCycleProgressState?: typeof loadRoutineCycleProgressState
  loadRoutineCycleFeatureStatus?: typeof loadRoutineCycleFeatureStatus
  loadRoutineCycleSettings?: typeof loadRoutineCycleSettings
}

export interface RoutineCycleProgressSnapshot {
  cycleProgress: RoutineCycleProgressState
  currentCycleAnchorDateKey: string
  featureStatus: RoutineCycleFeatureStatus
  hasCustomSettings: boolean
  isRoutineEnabled: boolean
  nextSuggestion: RoutineCycleSession | null
  progress: RoutineCycleProgress
  sessions: StoredWorkoutSession[]
  settings: RoutineCycleSettings | null
}

// 전달받은 설정과 세션 목록으로 현재 루틴 사이클의 진행 상태 스냅샷을 만든다.
export function buildRoutineCycleProgressSnapshot({
  cycleProgress,
  currentCycleAnchorDateKey,
  featureStatus,
  sessions,
  settings,
}: RoutineCycleProgressSnapshotInput): RoutineCycleProgressSnapshot {
  const fallbackSettings = createDefaultRoutineCycleSettings(
    currentCycleAnchorDateKey,
  )
  const normalizedSettings = normalizeRoutineCycleSettings(
    settings ?? fallbackSettings,
    currentCycleAnchorDateKey,
  )
  const isRoutineEnabled = featureStatus === "enabled"
  const routineSessions = isRoutineEnabled
    ? normalizedSettings.sessions ?? DEFAULT_ROUTINE_CYCLE_SESSIONS
    : []
  const normalizedCycleProgress =
    cycleProgress ??
    createRoutineCycleProgressState(normalizedSettings.cycleStartDateKey)
  const sessionCycleProgress = isRoutineEnabled
    ? buildRoutineCycleProgressStateFromSessions(normalizedSettings, sessions)
    : normalizedCycleProgress
  const resolvedCycleProgress = isRoutineEnabled
    ? sessionCycleProgress
    : normalizedCycleProgress
  const resolvedCycleState = getRoutineCycleStateFromProgress(
    normalizedSettings,
    resolvedCycleProgress,
  )
  const filledSlotIds = resolvedCycleState.isCycleComplete
    ? routineSessions.map((session) => session.id)
    : resolvedCycleProgress.filledSlotIds
  const progress = buildRoutineCycleProgressFromFilledSlots(
    routineSessions,
    filledSlotIds,
    sessions,
  )

  return {
    cycleProgress: resolvedCycleProgress,
    currentCycleAnchorDateKey,
    featureStatus,
    hasCustomSettings: settings !== null,
    isRoutineEnabled,
    nextSuggestion: isRoutineEnabled && !resolvedCycleState.isCycleComplete
      ? getNextRoutineSuggestion(progress)
      : null,
    progress,
    sessions,
    settings: settings ? normalizedSettings : null,
  }
}

// 저장된 루틴 설정과 전체 운동 세션을 불러와 세션 단위 진행 상태 스냅샷을 만든다.
export async function loadRoutineCycleProgressSnapshot({
  getAllStoredWorkoutSessions: loadSessions = getAllStoredWorkoutSessions,
  getCycleAnchorDateRange = getThisWeekDateRange,
  loadRoutineCycleProgressState: loadCycleProgress = loadRoutineCycleProgressState,
  loadRoutineCycleFeatureStatus: loadFeatureStatus = loadRoutineCycleFeatureStatus,
  loadRoutineCycleSettings: loadSettings = loadRoutineCycleSettings,
}: LoadRoutineCycleProgressSnapshotOptions = {}) {
  const { startDateKey } = getCycleAnchorDateRange()
  const [settings, featureStatus] = await Promise.all([
    loadSettings(),
    loadFeatureStatus(),
  ])
  const normalizedSettings = normalizeRoutineCycleSettings(
    settings ?? createDefaultRoutineCycleSettings(startDateKey),
    startDateKey,
  )
  const [cycleProgress, sessions] = await Promise.all([
    loadCycleProgress(normalizedSettings.cycleStartDateKey),
    loadSessions(),
  ])

  return buildRoutineCycleProgressSnapshot({
    cycleProgress,
    currentCycleAnchorDateKey: startDateKey,
    featureStatus,
    sessions,
    settings,
  })
}
