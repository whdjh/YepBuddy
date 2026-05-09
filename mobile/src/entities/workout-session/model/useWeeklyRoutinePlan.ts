import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getThisWeekDateRange } from "@/shared/lib/date"
import {
  getWeeklyRoutineCyclePhase,
  getWeeklyRoutineCycleState,
  restartWeeklyRoutineCycle,
  shouldShowWeeklyRoutineSetupPrompt,
  type WeeklyRoutineCyclePhase,
  type WeeklyRoutineCycleState,
  type WeeklyRoutineSetupPromptKind,
} from "../lib/weeklyRoutineCycle"
import {
  buildWeeklyRoutineProgressSnapshot,
  loadWeeklyRoutineProgressSnapshot,
} from "../lib/weeklyRoutineProgressSnapshot"
import type { WeeklyRoutineProgress } from "../lib/weeklyRoutineProgress"
import type { StoredWorkoutSession } from "./types"
import {
  createDefaultWeeklyRoutineSettings,
  DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  normalizeWeeklyRoutineSettings,
  type WeeklyRoutineFeatureStatus,
  type WeeklyRoutinePromptState,
  type WeeklyRoutineSettings,
} from "./weeklyRoutine"
import {
  dismissWeeklyRoutineCycleRenewalPrompt,
  loadWeeklyRoutinePromptState,
  saveWeeklyRoutineFeatureStatus,
  saveWeeklyRoutinePromptState,
  saveWeeklyRoutineSettings,
} from "./weeklyRoutineStorage"

export interface WeeklyRoutinePlanResult {
  settings: WeeklyRoutineSettings | null
  featureStatus: WeeklyRoutineFeatureStatus
  isRoutineEnabled: boolean
  progress: WeeklyRoutineProgress
  cycleState: WeeklyRoutineCycleState | null
  cyclePhase: WeeklyRoutineCyclePhase | null
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
}

// 주간 루틴 설정 로드 + 이번 주 진행률 계산을 한 번에 제공
export function useWeeklyRoutinePlan(): WeeklyRoutinePlanResult {
  const loadRequestIdRef = useRef(0)
  const [settings, setSettings] = useState<WeeklyRoutineSettings | null>(null)
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

  const load = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId
    setIsLoading(true)

    try {
      const [snapshot, loadedPromptState] = await Promise.all([
        loadWeeklyRoutineProgressSnapshot(),
        loadWeeklyRoutinePromptState(),
      ])

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setCurrentWeekStartDateKey(snapshot.currentWeekStartDateKey)
      setSettings(snapshot.settings)
      setFeatureStatus(snapshot.featureStatus)
      setPromptState(loadedPromptState)
      setSessions(snapshot.sessions)
    } catch {
      // 저장소/권한 오류가 있어도 화면 로딩 상태는 종료한다.
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void load()

    return () => {
      loadRequestIdRef.current += 1
    }
  }, [load])

  const updateSettings = useCallback(
    async (next: WeeklyRoutineSettings) => {
      const requestId = loadRequestIdRef.current + 1
      loadRequestIdRef.current = requestId
      const normalized = normalizeWeeklyRoutineSettings(
        next,
        currentWeekStartDateKey,
      )

      try {
        await saveWeeklyRoutineSettings(normalized)
        await saveWeeklyRoutineFeatureStatus("enabled")
        await saveWeeklyRoutinePromptState(DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE)

        if (loadRequestIdRef.current !== requestId) {
          return
        }

        setSettings(normalized)
        setFeatureStatus("enabled")
        setPromptState(DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE)
      } finally {
        if (loadRequestIdRef.current === requestId) {
          setIsLoading(false)
        }
      }
    },
    [currentWeekStartDateKey],
  )

  const enableRoutine = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId

    try {
      await saveWeeklyRoutineFeatureStatus("enabled")

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setFeatureStatus("enabled")
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  const disableRoutine = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId

    try {
      await saveWeeklyRoutineFeatureStatus("disabled")

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setFeatureStatus("disabled")
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  const dismissSetupPrompt = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId

    try {
      await dismissWeeklyRoutineCycleRenewalPrompt(currentWeekStartDateKey)

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setPromptState((current) => ({
        ...current,
        cycleRenewalDismissedForWeekStartDateKey: currentWeekStartDateKey,
      }))
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [currentWeekStartDateKey])

  const restartCurrentCycle = useCallback(async () => {
    const baseSettings =
      settings ?? createDefaultWeeklyRoutineSettings(currentWeekStartDateKey)

    await updateSettings(
      restartWeeklyRoutineCycle(baseSettings, currentWeekStartDateKey),
    )
  }, [currentWeekStartDateKey, settings, updateSettings])

  const progressSnapshot = useMemo(
    () =>
      buildWeeklyRoutineProgressSnapshot({
        currentWeekStartDateKey,
        featureStatus,
        sessions,
        settings,
      }),
    [currentWeekStartDateKey, featureStatus, sessions, settings],
  )
  const normalizedSettings = progressSnapshot.settings
  const isRoutineEnabled = progressSnapshot.isRoutineEnabled
  const progress = progressSnapshot.progress

  const cycleState = useMemo(
    () =>
      isRoutineEnabled && normalizedSettings
        ? getWeeklyRoutineCycleState(
            normalizedSettings,
            currentWeekStartDateKey,
          )
        : null,
    [currentWeekStartDateKey, isRoutineEnabled, normalizedSettings],
  )
  const cyclePhase = cycleState
    ? getWeeklyRoutineCyclePhase(cycleState)
    : null

  const setupPromptKind = useMemo(
    () =>
      isRoutineEnabled
        ? shouldShowWeeklyRoutineSetupPrompt({
            settings: normalizedSettings,
            promptState,
            currentWeekStartDateKey,
          })
        : null,
    [currentWeekStartDateKey, isRoutineEnabled, normalizedSettings, promptState],
  )

  return {
    settings: normalizedSettings,
    featureStatus,
    isRoutineEnabled,
    progress,
    cycleState,
    cyclePhase,
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
    hasCustomSettings: progressSnapshot.hasCustomSettings,
    isDeloadWeek: cyclePhase === "deload",
  }
}
