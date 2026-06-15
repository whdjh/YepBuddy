import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getCurrentCycleAnchorDateKey } from "@/shared/lib/date"
import {
  createRoutineCycleProgressState,
  getRoutineCycleEditPolicy,
  getRoutineCyclePhase,
  getRoutineCycleStateFromProgress,
  restartRoutineCycle,
  shouldShowRoutineCycleSetupPrompt,
  type RoutineCyclePhase,
  type RoutineCycleProgressState,
  type RoutineCycleState,
  type RoutineCycleSetupPromptKind,
} from "../lib/routineCycleState"
import {
  buildRoutineCycleProgressSnapshot,
  loadRoutineCycleProgressSnapshot,
} from "../lib/routineCycleProgressSnapshot"
import type { RoutineCycleProgress } from "../lib/routineCycleProgress"
import type { StoredWorkoutSession } from "./types"
import {
  createDefaultRoutineCycleSettings,
  DEFAULT_ROUTINE_CYCLE_PROMPT_STATE,
  normalizeRoutineCycleSettings,
  type RoutineCycleFeatureStatus,
  type RoutineCyclePromptState,
  type RoutineCycleSettings,
} from "./routineCycle"
import {
  dismissRoutineCycleRenewalPrompt,
  loadRoutineCyclePromptState,
  resetRoutineCycleProgressState,
  saveRoutineCycleFeatureStatus,
  saveRoutineCyclePromptState,
  saveRoutineCycleSettings,
} from "./routineCycleStorage"

export interface RoutineCyclePlanResult {
  settings: RoutineCycleSettings | null
  featureStatus: RoutineCycleFeatureStatus
  isRoutineEnabled: boolean
  progress: RoutineCycleProgress
  cycleState: RoutineCycleState | null
  cyclePhase: RoutineCyclePhase | null
  promptState: RoutineCyclePromptState
  setupPromptKind: RoutineCycleSetupPromptKind | null
  currentCycleAnchorDateKey: string
  isLoading: boolean
  reload: () => Promise<void>
  updateSettings: (next: RoutineCycleSettings) => Promise<void>
  enableRoutine: () => Promise<void>
  disableRoutine: () => Promise<void>
  dismissSetupPrompt: () => Promise<void>
  restartCurrentCycle: () => Promise<void>
  hasCustomSettings: boolean
  hasRoutineStarted: boolean
  canEditRoutineStructure: boolean
  minimumTrainingCycles: number
  isDeloadCycle: boolean
}

// 루틴 사이클 설정 로드 + 세션 단위 루틴 진행률 계산을 한 번에 제공
export function useRoutineCyclePlan(): RoutineCyclePlanResult {
  const loadRequestIdRef = useRef(0)
  const [settings, setSettings] = useState<RoutineCycleSettings | null>(null)
  const [featureStatus, setFeatureStatus] =
    useState<RoutineCycleFeatureStatus>("unasked")
  const [promptState, setPromptState] = useState<RoutineCyclePromptState>(
    DEFAULT_ROUTINE_CYCLE_PROMPT_STATE,
  )
  const [sessions, setSessions] = useState<StoredWorkoutSession[]>([])
  const [currentCycleAnchorDateKey, setCurrentCycleAnchorDateKey] = useState(
    () => getCurrentCycleAnchorDateKey(),
  )
  const [cycleProgress, setCycleProgress] =
    useState<RoutineCycleProgressState>(() =>
      createRoutineCycleProgressState(getCurrentCycleAnchorDateKey()),
    )
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId
    setIsLoading(true)

    try {
      const [snapshot, loadedPromptState] = await Promise.all([
        loadRoutineCycleProgressSnapshot(),
        loadRoutineCyclePromptState(),
      ])

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setCurrentCycleAnchorDateKey(snapshot.currentCycleAnchorDateKey)
      setSettings(snapshot.settings)
      setFeatureStatus(snapshot.featureStatus)
      setPromptState(loadedPromptState)
      setSessions(snapshot.sessions)
      setCycleProgress(snapshot.cycleProgress)
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
    async (next: RoutineCycleSettings) => {
      const requestId = loadRequestIdRef.current + 1
      loadRequestIdRef.current = requestId
      const normalized = normalizeRoutineCycleSettings(
        next,
        currentCycleAnchorDateKey,
      )

      try {
        await saveRoutineCycleSettings(normalized)
        const nextCycleProgress = await resetRoutineCycleProgressState(
          normalized.cycleStartDateKey,
        )
        await saveRoutineCycleFeatureStatus("enabled")
        await saveRoutineCyclePromptState(DEFAULT_ROUTINE_CYCLE_PROMPT_STATE)

        if (loadRequestIdRef.current !== requestId) {
          return
        }

        setSettings(normalized)
        setFeatureStatus("enabled")
        setPromptState(DEFAULT_ROUTINE_CYCLE_PROMPT_STATE)
        setCycleProgress(nextCycleProgress)
      } finally {
        if (loadRequestIdRef.current === requestId) {
          setIsLoading(false)
        }
      }
    },
    [currentCycleAnchorDateKey],
  )

  const enableRoutine = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId

    try {
      await saveRoutineCycleFeatureStatus("enabled")

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
      await saveRoutineCycleFeatureStatus("disabled")

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
      await dismissRoutineCycleRenewalPrompt(currentCycleAnchorDateKey)

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setPromptState((current) => ({
        ...current,
        cycleRenewalDismissedForAnchorDateKey: currentCycleAnchorDateKey,
      }))
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [currentCycleAnchorDateKey])

  const restartCurrentCycle = useCallback(async () => {
    const baseSettings =
      settings ?? createDefaultRoutineCycleSettings(currentCycleAnchorDateKey)

    await updateSettings(
      restartRoutineCycle(baseSettings, currentCycleAnchorDateKey),
    )
  }, [currentCycleAnchorDateKey, settings, updateSettings])

  const progressSnapshot = useMemo(
    () =>
      buildRoutineCycleProgressSnapshot({
        cycleProgress,
        currentCycleAnchorDateKey,
        featureStatus,
        sessions,
        settings,
      }),
    [currentCycleAnchorDateKey, cycleProgress, featureStatus, sessions, settings],
  )
  const normalizedSettings = progressSnapshot.settings
  const effectiveSettings = useMemo(
    () =>
      normalizedSettings ??
      createDefaultRoutineCycleSettings(currentCycleAnchorDateKey),
    [currentCycleAnchorDateKey, normalizedSettings],
  )
  const isRoutineEnabled = progressSnapshot.isRoutineEnabled
  const progress = progressSnapshot.progress

  const cycleState = useMemo(
    () =>
      isRoutineEnabled
        ? getRoutineCycleStateFromProgress(
            effectiveSettings,
            progressSnapshot.cycleProgress,
          )
        : null,
    [effectiveSettings, isRoutineEnabled, progressSnapshot.cycleProgress],
  )
  const cyclePhase = cycleState
    ? getRoutineCyclePhase(cycleState)
    : null
  const cycleEditPolicy = useMemo(
    () =>
      isRoutineEnabled
        ? getRoutineCycleEditPolicy(
            effectiveSettings,
            progressSnapshot.cycleProgress,
          )
        : {
            hasRoutineStarted: false,
            canEditRoutineStructure: true,
            minimumTrainingCycles: 1,
          },
    [effectiveSettings, isRoutineEnabled, progressSnapshot.cycleProgress],
  )

  const setupPromptKind = useMemo(
    () =>
      isRoutineEnabled
        ? shouldShowRoutineCycleSetupPrompt({
            settings: effectiveSettings,
            promptState,
            currentCycleAnchorDateKey,
            cycleState,
          })
        : null,
    [
      currentCycleAnchorDateKey,
      cycleState,
      effectiveSettings,
      isRoutineEnabled,
      promptState,
    ],
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
    currentCycleAnchorDateKey,
    isLoading,
    reload: load,
    updateSettings,
    enableRoutine,
    disableRoutine,
    dismissSetupPrompt,
    restartCurrentCycle,
    hasCustomSettings: progressSnapshot.hasCustomSettings,
    hasRoutineStarted: cycleEditPolicy.hasRoutineStarted,
    canEditRoutineStructure: cycleEditPolicy.canEditRoutineStructure,
    minimumTrainingCycles: cycleEditPolicy.minimumTrainingCycles,
    isDeloadCycle: cyclePhase === "deload",
  }
}
