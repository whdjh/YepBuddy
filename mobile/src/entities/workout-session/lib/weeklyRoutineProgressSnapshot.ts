import { getThisWeekDateRange } from "@/shared/lib/date"
import {
  DEFAULT_WEEKLY_ROUTINE_SESSIONS,
  normalizeWeeklyRoutineSettings,
  type WeeklyRoutineFeatureStatus,
  type WeeklyRoutineSession,
  type WeeklyRoutineSettings,
} from "../model/weeklyRoutine"
import {
  getStoredWorkoutSessionsInRange,
} from "../model/sessionStorage"
import {
  loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings,
} from "../model/weeklyRoutineStorage"
import type { StoredWorkoutSession } from "../model/types"
import {
  buildWeeklyRoutineProgress,
  getNextRoutineSuggestion,
  type WeeklyRoutineProgress,
} from "./weeklyRoutineProgress"

interface WeekDateRange {
  startDateKey: string
  endDateKey: string
}

interface WeeklyRoutineProgressSnapshotInput {
  currentWeekStartDateKey: string
  featureStatus: WeeklyRoutineFeatureStatus
  sessions: StoredWorkoutSession[]
  settings: WeeklyRoutineSettings | null
}

interface LoadWeeklyRoutineProgressSnapshotOptions {
  getStoredWorkoutSessionsInRange?: typeof getStoredWorkoutSessionsInRange
  getWeekDateRange?: () => WeekDateRange
  loadWeeklyRoutineFeatureStatus?: typeof loadWeeklyRoutineFeatureStatus
  loadWeeklyRoutineSettings?: typeof loadWeeklyRoutineSettings
}

export interface WeeklyRoutineProgressSnapshot {
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
  currentWeekStartDateKey,
  featureStatus,
  sessions,
  settings,
}: WeeklyRoutineProgressSnapshotInput): WeeklyRoutineProgressSnapshot {
  const normalizedSettings = settings
    ? normalizeWeeklyRoutineSettings(settings, currentWeekStartDateKey)
    : null
  const isRoutineEnabled = featureStatus === "enabled"
  const routineSessions = isRoutineEnabled
    ? normalizedSettings?.sessions ?? DEFAULT_WEEKLY_ROUTINE_SESSIONS
    : []
  const progress = buildWeeklyRoutineProgress(routineSessions, sessions)

  return {
    currentWeekStartDateKey,
    featureStatus,
    hasCustomSettings: normalizedSettings !== null,
    isRoutineEnabled,
    nextSuggestion: isRoutineEnabled
      ? getNextRoutineSuggestion(progress)
      : null,
    progress,
    sessions,
    settings: normalizedSettings,
  }
}

// 저장된 루틴 설정과 이번 주 운동 기록을 불러와 진행 상태 스냅샷을 만든다.
export async function loadWeeklyRoutineProgressSnapshot({
  getStoredWorkoutSessionsInRange: loadWeekSessions = getStoredWorkoutSessionsInRange,
  getWeekDateRange = getThisWeekDateRange,
  loadWeeklyRoutineFeatureStatus: loadFeatureStatus = loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings: loadSettings = loadWeeklyRoutineSettings,
}: LoadWeeklyRoutineProgressSnapshotOptions = {}) {
  const { startDateKey, endDateKey } = getWeekDateRange()
  const [settings, featureStatus, sessions] = await Promise.all([
    loadSettings(),
    loadFeatureStatus(),
    loadWeekSessions(startDateKey, endDateKey),
  ])

  return buildWeeklyRoutineProgressSnapshot({
    currentWeekStartDateKey: startDateKey,
    featureStatus,
    sessions,
    settings,
  })
}
