import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  buildWeeklyRoutineProgress,
  createDefaultWeeklyRoutineSettings,
  DEFAULT_WEEKLY_ROUTINE_SESSIONS,
  DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  dismissWeeklyRoutineCycleRenewalPrompt,
  getWeeklyRoutineCycleState,
  getStoredWorkoutSessionsInRange,
  loadWeeklyRoutineSettings,
  loadWeeklyRoutinePromptState,
  normalizeWeeklyRoutineSettings,
  restartWeeklyRoutineCycle,
  saveWeeklyRoutinePromptState,
  saveWeeklyRoutineSettings,
  shouldShowWeeklyRoutineSetupPrompt,
} from "@/entities/workout-session"
import type {
  StoredWorkoutSession,
  WeeklyRoutineCycleState,
  WeeklyRoutinePromptState,
  WeeklyRoutineSetupPromptKind,
  WeeklyRoutineSettings,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

export interface WeeklyRoutinePlanResult {
  settings: WeeklyRoutineSettings | null
  progress: ReturnType<typeof buildWeeklyRoutineProgress>
  cycleState: WeeklyRoutineCycleState | null
  promptState: WeeklyRoutinePromptState
  setupPromptKind: WeeklyRoutineSetupPromptKind | null
  currentWeekStartDateKey: string
  isLoading: boolean
  reload: () => Promise<void>
  updateSettings: (next: WeeklyRoutineSettings) => Promise<void>
  dismissSetupPrompt: () => Promise<void>
  restartCurrentCycle: () => Promise<void>
  hasCustomSettings: boolean
  isDeloadWeek: boolean
  summaryText: string
  remainingText: string
  cycleText: string
}

// 주간 루틴 설정 로드 + 이번 주 진행률 계산을 한 번에 제공
export function useWeeklyRoutinePlan(): WeeklyRoutinePlanResult {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<WeeklyRoutineSettings | null>(null)
  const [promptState, setPromptState] = useState<WeeklyRoutinePromptState>(
    DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  )
  const [sessions, setSessions] = useState<StoredWorkoutSession[]>([])
  const [currentWeekStartDateKey, setCurrentWeekStartDateKey] = useState(
    () => getThisWeekDateRange().startDateKey,
  )
  const [isLoading, setIsLoading] = useState(true)

  // 설정, 안내 모달 상태, 이번 주 운동 기록을 함께 로드
  const load = useCallback(async () => {
    setIsLoading(true)
    const { startDateKey, endDateKey } = getThisWeekDateRange()
    const [loadedSettings, loadedPromptState, weekSessions] =
      await Promise.all([
        loadWeeklyRoutineSettings(),
        loadWeeklyRoutinePromptState(),
        getStoredWorkoutSessionsInRange(startDateKey, endDateKey),
      ])

    setCurrentWeekStartDateKey(startDateKey)
    setSettings(
      loadedSettings
        ? normalizeWeeklyRoutineSettings(loadedSettings, startDateKey)
        : null,
    )
    setPromptState(loadedPromptState)
    setSessions(weekSessions)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateSettings = useCallback(
    async (next: WeeklyRoutineSettings) => {
      // 저장 시 누락된 사이클 필드를 보강하고 안내 모달 상태를 초기화
      const normalized = normalizeWeeklyRoutineSettings(
        next,
        currentWeekStartDateKey,
      )
      await saveWeeklyRoutineSettings(normalized)
      await saveWeeklyRoutinePromptState(DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE)
      setSettings(normalized)
      setPromptState(DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE)
    },
    [currentWeekStartDateKey],
  )

  const dismissSetupPrompt = useCallback(async () => {
    // 사이클 완료 안내는 현재 주차에만 dismiss
    await dismissWeeklyRoutineCycleRenewalPrompt(currentWeekStartDateKey)

    setPromptState(await loadWeeklyRoutinePromptState())
  }, [currentWeekStartDateKey])

  // 현재 주차를 기준으로 루틴 사이클을 새로 시작
  const restartCurrentCycle = useCallback(async () => {
    const baseSettings =
      settings ?? createDefaultWeeklyRoutineSettings(currentWeekStartDateKey)

    await updateSettings(
      restartWeeklyRoutineCycle(baseSettings, currentWeekStartDateKey),
    )
  }, [currentWeekStartDateKey, settings, updateSettings])

  // 사용자가 저장한 루틴이 없으면 기본 루틴 사용
  const effectiveSessions =
    settings?.sessions ?? DEFAULT_WEEKLY_ROUTINE_SESSIONS

  const progress = useMemo(
    () => buildWeeklyRoutineProgress(effectiveSessions, sessions),
    [effectiveSessions, sessions],
  )

  // 저장된 루틴이 있을 때만 사이클 상태를 계산
  const cycleState = useMemo(
    () =>
      settings
        ? getWeeklyRoutineCycleState(settings, currentWeekStartDateKey)
        : null,
    [currentWeekStartDateKey, settings],
  )

  // 루틴 사이클 종료 시 안내 모달 노출 여부 계산
  const setupPromptKind = useMemo(
    () =>
      shouldShowWeeklyRoutineSetupPrompt({
        settings,
        promptState,
        currentWeekStartDateKey,
      }),
    [currentWeekStartDateKey, promptState, settings],
  )

  const isDeloadWeek = cycleState?.isDeloadWeek ?? false

  return {
    settings,
    progress,
    cycleState,
    promptState,
    setupPromptKind,
    currentWeekStartDateKey,
    isLoading,
    reload: load,
    updateSettings,
    dismissSetupPrompt,
    restartCurrentCycle,
    hasCustomSettings: settings !== null,
    isDeloadWeek,
    summaryText: t("workout.weeklyRoutine.summary", {
      completed: progress.completedSessions,
      total: progress.totalSessions,
    }),
    remainingText: t("workout.weeklyRoutine.remaining", {
      remaining: progress.remainingSessions,
    }),
    cycleText: cycleState
      ? t(
          isDeloadWeek
            ? "workout.weeklyRoutine.cycle.deload"
            : "workout.weeklyRoutine.cycle.regular",
          {
            current: Math.min(
              cycleState.currentWeekNumber,
              cycleState.totalCycleWeeks,
            ),
            total: cycleState.totalCycleWeeks,
          },
        )
      : t("workout.weeklyRoutine.cycle.notConfigured"),
  }
}
