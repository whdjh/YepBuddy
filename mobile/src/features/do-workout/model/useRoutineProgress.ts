import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  buildWeeklyRoutineProgress,
  getNextRoutineSuggestion,
  getStoredWorkoutSessionsInRange,
  loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings,
  normalizeWeeklyRoutineSettings,
  type StoredWorkoutSession,
  type WeeklyRoutineFeatureStatus,
  type WeeklyRoutineProgress,
  type WeeklyRoutineSession,
  type WeeklyRoutineSettings,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

export interface RoutineProgressResult {
  hasCustomSettings: boolean
  isRoutineEnabled: boolean
  progress: WeeklyRoutineProgress
  nextSuggestion: WeeklyRoutineSession | null
  isLoading: boolean
  reload: () => Promise<void>
}

// 운동 중 화면에서 주간 루틴 진행률과 다음 추천 세션을 계산
export function useRoutineProgress(): RoutineProgressResult {
  const loadRequestIdRef = useRef(0)
  const [settings, setSettings] = useState<WeeklyRoutineSettings | null>(null)
  const [featureStatus, setFeatureStatus] =
    useState<WeeklyRoutineFeatureStatus>("unasked")
  const [sessions, setSessions] = useState<StoredWorkoutSession[]>([])
  const [currentWeekStartDateKey, setCurrentWeekStartDateKey] = useState(
    () => getThisWeekDateRange().startDateKey,
  )
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    // 빠르게 reload가 겹쳐도 마지막 요청 결과만 화면 상태에 반영
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId
    setIsLoading(true)
    try {
      const { startDateKey, endDateKey } = getThisWeekDateRange()
      const [raw, loadedFeatureStatus, weekSessions] = await Promise.all([
        loadWeeklyRoutineSettings(),
        loadWeeklyRoutineFeatureStatus(),
        getStoredWorkoutSessionsInRange(startDateKey, endDateKey),
      ])

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setCurrentWeekStartDateKey(startDateKey)
      setSettings(raw)
      setFeatureStatus(loadedFeatureStatus)
      setSessions(weekSessions)
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const isRoutineEnabled = featureStatus === "enabled"

  // 루틴 OFF 상태에서는 진행률과 다음 추천이 표시되지 않도록 세션 목록을 비움
  const routineSessions = useMemo(
    () =>
      isRoutineEnabled
        ? normalizeWeeklyRoutineSettings(
            settings ?? {},
            currentWeekStartDateKey,
          ).sessions
        : [],
    [currentWeekStartDateKey, isRoutineEnabled, settings],
  )

  const progress = useMemo(
    () => buildWeeklyRoutineProgress(routineSessions, sessions),
    [routineSessions, sessions],
  )

  const nextSuggestion = useMemo(
    () => (isRoutineEnabled ? getNextRoutineSuggestion(progress) : null),
    [isRoutineEnabled, progress],
  )

  return {
    hasCustomSettings: settings !== null,
    isRoutineEnabled,
    progress,
    nextSuggestion,
    isLoading,
    reload: load,
  }
}
