import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  buildWeeklyRoutineProgress,
  DEFAULT_WEEKLY_ROUTINE_SESSIONS,
  getStoredWorkoutSessionsInRange,
  loadWeeklyRoutineSettings,
  saveWeeklyRoutineSettings,
} from "@/entities/workout-session"
import type {
  StoredWorkoutSession,
  WeeklyRoutineSettings,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

// 주간 루틴 설정 로드 + 이번 주 진행률 계산을 한 번에 제공
export function useWeeklyRoutinePlan() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<WeeklyRoutineSettings | null>(null)
  const [sessions, setSessions] = useState<StoredWorkoutSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const loadedSettings = await loadWeeklyRoutineSettings()
    const { startDateKey, endDateKey } = getThisWeekDateRange()
    const weekSessions = await getStoredWorkoutSessionsInRange(
      startDateKey,
      endDateKey,
    )
    setSettings(loadedSettings)
    setSessions(weekSessions)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const updateSettings = useCallback(async (next: WeeklyRoutineSettings) => {
    await saveWeeklyRoutineSettings(next)
    setSettings(next)
  }, [])

  // 사용자가 저장한 루틴이 없으면 기본 루틴 사용
  const effectiveSessions =
    settings?.sessions ?? DEFAULT_WEEKLY_ROUTINE_SESSIONS

  const progress = useMemo(
    () => buildWeeklyRoutineProgress(effectiveSessions, sessions),
    [effectiveSessions, sessions],
  )

  return {
    settings,
    progress,
    isLoading,
    reload: load,
    updateSettings,
    hasCustomSettings: settings !== null,
    summaryText: t("workout.weeklyRoutine.summary", {
      completed: progress.completedSessions,
      total: progress.totalSessions,
    }),
    remainingText: t("workout.weeklyRoutine.remaining", {
      remaining: progress.remainingSessions,
    }),
  }
}
