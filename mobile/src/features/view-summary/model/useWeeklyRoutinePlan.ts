import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  buildWeeklyRoutineProgress,
  createDefaultWeeklyRoutineSettings,
  DEFAULT_WEEKLY_ROUTINE_SESSIONS,
  DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  dismissWeeklyRoutineCycleRenewalPrompt,
  getWeeklyRoutineCycleState,
  getStoredWorkoutSessionsInRange,
  loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings,
  loadWeeklyRoutinePromptState,
  normalizeWeeklyRoutineSettings,
  restartWeeklyRoutineCycle,
  saveWeeklyRoutineFeatureStatus,
  saveWeeklyRoutinePromptState,
  saveWeeklyRoutineSettings,
  shouldShowWeeklyRoutineSetupPrompt,
} from "@/entities/workout-session"
import type {
  StoredWorkoutSession,
  WeeklyRoutineCycleState,
  WeeklyRoutineFeatureStatus,
  WeeklyRoutinePromptState,
  WeeklyRoutineSetupPromptKind,
  WeeklyRoutineSettings,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

export interface WeeklyRoutinePlanResult {
  settings: WeeklyRoutineSettings | null
  featureStatus: WeeklyRoutineFeatureStatus
  isRoutineEnabled: boolean
  progress: ReturnType<typeof buildWeeklyRoutineProgress>
  cycleState: WeeklyRoutineCycleState | null
  promptState: WeeklyRoutinePromptState
  setupPromptKind: WeeklyRoutineSetupPromptKind | null
  currentWeekStartDateKey: string
  isLoading: boolean
  reload: () => Promise<void>
  updateSettings: (next: WeeklyRoutineSettings) => Promise<void>
  enableRoutine: () => Promise<void>
  disableRoutine: () => Promise<void>
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
  const loadRequestIdRef = useRef(0)
  const [settings, setSettings] = useState<WeeklyRoutineSettings | null>(null)
  // 최초 안내 모달에서 사용자가 선택한 루틴 ON/OFF 상태
  const [featureStatus, setFeatureStatus] =
    useState<WeeklyRoutineFeatureStatus>("unasked")
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
    // 빠르게 reload가 겹쳐도 마지막 요청 결과만 화면 상태에 반영
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId
    setIsLoading(true)
    const { startDateKey, endDateKey } = getThisWeekDateRange()
    const [loadedSettings, loadedFeatureStatus, loadedPromptState, weekSessions] =
      await Promise.all([
        loadWeeklyRoutineSettings(),
        loadWeeklyRoutineFeatureStatus(),
        loadWeeklyRoutinePromptState(),
        getStoredWorkoutSessionsInRange(startDateKey, endDateKey),
      ])

    if (loadRequestIdRef.current !== requestId) {
      return
    }

    setCurrentWeekStartDateKey(startDateKey)
    setSettings(
      loadedSettings
        ? normalizeWeeklyRoutineSettings(loadedSettings, startDateKey)
        : null,
    )
    setFeatureStatus(loadedFeatureStatus)
    setPromptState(loadedPromptState)
    setSessions(weekSessions)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateSettings = useCallback(
    async (next: WeeklyRoutineSettings) => {
      const normalized = normalizeWeeklyRoutineSettings(
        next,
        currentWeekStartDateKey,
      )
      await saveWeeklyRoutineSettings(normalized)
      await saveWeeklyRoutineFeatureStatus("enabled")
      await saveWeeklyRoutinePromptState(DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE)
      loadRequestIdRef.current += 1
      setSettings(normalized)
      setFeatureStatus("enabled")
      setPromptState(DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE)
      setIsLoading(false)
    },
    [currentWeekStartDateKey],
  )

  // 저장된 설정을 그대로 두고 루틴 기능만 다시 켬
  const enableRoutine = useCallback(async () => {
    await saveWeeklyRoutineFeatureStatus("enabled")
    loadRequestIdRef.current += 1
    setFeatureStatus("enabled")
    setIsLoading(false)
  }, [])

  // 저장된 설정은 유지하고 루틴 진행률/추천만 숨기도록 기능 상태를 끔
  const disableRoutine = useCallback(async () => {
    await saveWeeklyRoutineFeatureStatus("disabled")
    loadRequestIdRef.current += 1
    setFeatureStatus("disabled")
    setIsLoading(false)
  }, [])

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

  // disabled/unasked 상태에서는 진행률, 사이클, 안내 모달을 계산하지 않음
  const isRoutineEnabled = featureStatus === "enabled"

  // 루틴 OFF 상태에서는 이번 주 세션 카드가 빈 루틴 진행률을 보도록 세션 목록을 비움
  const progress = useMemo(() => {
    const effectiveSessions = isRoutineEnabled
      ? settings?.sessions ?? DEFAULT_WEEKLY_ROUTINE_SESSIONS
      : []

    return buildWeeklyRoutineProgress(effectiveSessions, sessions)
  }, [isRoutineEnabled, sessions, settings])

  // 저장된 루틴이 있을 때만 사이클 상태를 계산
  const cycleState = useMemo(
    () =>
      isRoutineEnabled && settings
        ? getWeeklyRoutineCycleState(settings, currentWeekStartDateKey)
        : null,
    [currentWeekStartDateKey, isRoutineEnabled, settings],
  )

  // 루틴 사이클 종료 시 안내 모달 노출 여부 계산
  const setupPromptKind = useMemo(
    () =>
      isRoutineEnabled
        ? shouldShowWeeklyRoutineSetupPrompt({
            settings,
            promptState,
            currentWeekStartDateKey,
          })
        : null,
    [currentWeekStartDateKey, isRoutineEnabled, promptState, settings],
  )

  const isDeloadWeek = cycleState?.isDeloadWeek ?? false

  return {
    settings,
    featureStatus,
    isRoutineEnabled,
    progress,
    cycleState,
    promptState,
    setupPromptKind,
    currentWeekStartDateKey,
    isLoading,
    reload: load,
    updateSettings,
    enableRoutine,
    disableRoutine,
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
