import { getThisWeekDateRange } from "@/shared/lib/date"
import {
  createWeeklyRoutineCycleProgress,
  getWeeklyRoutineCycleStateFromProgress,
  type WeeklyRoutineCycleProgress,
} from "./weeklyRoutineCycle"
import {
  DEFAULT_WEEKLY_ROUTINE_SESSIONS,
  createDefaultWeeklyRoutineSettings,
  normalizeWeeklyRoutineSettings,
  type WeeklyRoutineFeatureStatus,
  type WeeklyRoutineSession,
  type WeeklyRoutineSettings,
} from "../model/weeklyRoutine"
import {
  getAllStoredWorkoutSessions,
} from "../model/sessionStorage"
import {
  loadWeeklyRoutineCycleProgress,
  loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings,
} from "../model/weeklyRoutineStorage"
import type { StoredWorkoutSession } from "../model/types"
import {
  buildWeeklyRoutineCycleProgressFromSessions,
  buildWeeklyRoutineProgressFromFilledSlots,
  getNextRoutineSuggestion,
  type WeeklyRoutineProgress,
} from "./weeklyRoutineProgress"

interface WeekDateRange {
  startDateKey: string
  endDateKey: string
}

interface WeeklyRoutineProgressSnapshotInput {
  cycleProgress: WeeklyRoutineCycleProgress | null
  currentWeekStartDateKey: string
  featureStatus: WeeklyRoutineFeatureStatus
  sessions: StoredWorkoutSession[]
  settings: WeeklyRoutineSettings | null
}

interface LoadWeeklyRoutineProgressSnapshotOptions {
  getAllStoredWorkoutSessions?: typeof getAllStoredWorkoutSessions
  getWeekDateRange?: () => WeekDateRange
  loadWeeklyRoutineCycleProgress?: typeof loadWeeklyRoutineCycleProgress
  loadWeeklyRoutineFeatureStatus?: typeof loadWeeklyRoutineFeatureStatus
  loadWeeklyRoutineSettings?: typeof loadWeeklyRoutineSettings
}

export interface WeeklyRoutineProgressSnapshot {
  cycleProgress: WeeklyRoutineCycleProgress
  currentWeekStartDateKey: string
  featureStatus: WeeklyRoutineFeatureStatus
  hasCustomSettings: boolean
  isRoutineEnabled: boolean
  nextSuggestion: WeeklyRoutineSession | null
  progress: WeeklyRoutineProgress
  sessions: StoredWorkoutSession[]
  settings: WeeklyRoutineSettings | null
}

// 전달받은 설정과 세션 목록으로 현재 루틴 사이클의 진행 상태 스냅샷을 만든다.
export function buildWeeklyRoutineProgressSnapshot({
  cycleProgress,
  currentWeekStartDateKey,
  featureStatus,
  sessions,
  settings,
}: WeeklyRoutineProgressSnapshotInput): WeeklyRoutineProgressSnapshot {
  const fallbackSettings = createDefaultWeeklyRoutineSettings(
    currentWeekStartDateKey,
  )
  const normalizedSettings = normalizeWeeklyRoutineSettings(
    settings ?? fallbackSettings,
    currentWeekStartDateKey,
  )
  const isRoutineEnabled = featureStatus === "enabled"
  const routineSessions = isRoutineEnabled
    ? normalizedSettings.sessions ?? DEFAULT_WEEKLY_ROUTINE_SESSIONS
    : []
  const normalizedCycleProgress =
    cycleProgress ??
    createWeeklyRoutineCycleProgress(normalizedSettings.cycleStartDateKey)
  const sessionCycleProgress = isRoutineEnabled
    ? buildWeeklyRoutineCycleProgressFromSessions(normalizedSettings, sessions)
    : normalizedCycleProgress
  const resolvedCycleProgress = isRoutineEnabled
    ? sessionCycleProgress
    : normalizedCycleProgress
  const resolvedCycleState = getWeeklyRoutineCycleStateFromProgress(
    normalizedSettings,
    resolvedCycleProgress,
  )
  const filledSlotIds = resolvedCycleState.isCycleComplete
    ? routineSessions.map((session) => session.id)
    : resolvedCycleProgress.filledSlotIds
  const progress = buildWeeklyRoutineProgressFromFilledSlots(
    routineSessions,
    filledSlotIds,
    sessions,
  )

  return {
    cycleProgress: resolvedCycleProgress,
    currentWeekStartDateKey,
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
export async function loadWeeklyRoutineProgressSnapshot({
  getAllStoredWorkoutSessions: loadSessions = getAllStoredWorkoutSessions,
  getWeekDateRange = getThisWeekDateRange,
  loadWeeklyRoutineCycleProgress: loadCycleProgress = loadWeeklyRoutineCycleProgress,
  loadWeeklyRoutineFeatureStatus: loadFeatureStatus = loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings: loadSettings = loadWeeklyRoutineSettings,
}: LoadWeeklyRoutineProgressSnapshotOptions = {}) {
  const { startDateKey } = getWeekDateRange()
  const [settings, featureStatus] = await Promise.all([
    loadSettings(),
    loadFeatureStatus(),
  ])
  const normalizedSettings = normalizeWeeklyRoutineSettings(
    settings ?? createDefaultWeeklyRoutineSettings(startDateKey),
    startDateKey,
  )
  const [cycleProgress, sessions] = await Promise.all([
    loadCycleProgress(normalizedSettings.cycleStartDateKey),
    loadSessions(),
  ])

  return buildWeeklyRoutineProgressSnapshot({
    cycleProgress,
    currentWeekStartDateKey: startDateKey,
    featureStatus,
    sessions,
    settings,
  })
}
