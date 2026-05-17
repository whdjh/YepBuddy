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
  getStoredWorkoutSessionsInRange,
} from "../model/sessionStorage"
import {
  loadWeeklyRoutineCycleProgress,
  loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings,
} from "../model/weeklyRoutineStorage"
import type { StoredWorkoutSession } from "../model/types"
import {
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
  getStoredWorkoutSessionsInRange?: typeof getStoredWorkoutSessionsInRange
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

// 전달받은 설정과 세션 목록으로 이번 주 루틴 진행 상태 스냅샷을 만든다.
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
  const cycleState = getWeeklyRoutineCycleStateFromProgress(
    normalizedSettings,
    normalizedCycleProgress,
  )
  const filledSlotIds = cycleState.isCycleComplete
    ? routineSessions.map((session) => session.id)
    : normalizedCycleProgress.filledSlotIds
  const progress = buildWeeklyRoutineProgressFromFilledSlots(
    routineSessions,
    filledSlotIds,
  )

  return {
    cycleProgress: normalizedCycleProgress,
    currentWeekStartDateKey,
    featureStatus,
    hasCustomSettings: settings !== null,
    isRoutineEnabled,
    nextSuggestion: isRoutineEnabled && !cycleState.isCycleComplete
      ? getNextRoutineSuggestion(progress)
      : null,
    progress,
    sessions,
    settings: settings ? normalizedSettings : null,
  }
}

// 저장된 루틴 설정과 이번 주 운동 기록을 불러와 진행 상태 스냅샷을 만든다.
export async function loadWeeklyRoutineProgressSnapshot({
  getStoredWorkoutSessionsInRange: loadWeekSessions = getStoredWorkoutSessionsInRange,
  getWeekDateRange = getThisWeekDateRange,
  loadWeeklyRoutineCycleProgress: loadCycleProgress = loadWeeklyRoutineCycleProgress,
  loadWeeklyRoutineFeatureStatus: loadFeatureStatus = loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings: loadSettings = loadWeeklyRoutineSettings,
}: LoadWeeklyRoutineProgressSnapshotOptions = {}) {
  const { startDateKey, endDateKey } = getWeekDateRange()
  const [settings, featureStatus, sessions] = await Promise.all([
    loadSettings(),
    loadFeatureStatus(),
    loadWeekSessions(startDateKey, endDateKey),
  ])
  const normalizedSettings = normalizeWeeklyRoutineSettings(
    settings ?? createDefaultWeeklyRoutineSettings(startDateKey),
    startDateKey,
  )
  const cycleProgress = await loadCycleProgress(
    normalizedSettings.cycleStartDateKey,
  )

  return buildWeeklyRoutineProgressSnapshot({
    cycleProgress,
    currentWeekStartDateKey: startDateKey,
    featureStatus,
    sessions,
    settings,
  })
}
