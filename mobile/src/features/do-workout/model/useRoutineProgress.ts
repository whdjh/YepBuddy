import { useCallback, useEffect, useMemo, useState } from "react"
import {
  buildWeeklyRoutineProgress,
  getNextRoutineSuggestion,
  getStoredWorkoutSessionsInRange,
  loadWeeklyRoutineSettings,
  normalizeWeeklyRoutineSettings,
  type StoredWorkoutSession,
  type WeeklyRoutineProgress,
  type WeeklyRoutineSession,
  type WeeklyRoutineSettings,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

export interface RoutineProgressResult {
  hasCustomSettings: boolean
  progress: WeeklyRoutineProgress
  nextSuggestion: WeeklyRoutineSession | null
  isLoading: boolean
  reload: () => Promise<void>
}

export function useRoutineProgress(): RoutineProgressResult {
  const [settings, setSettings] = useState<WeeklyRoutineSettings | null>(null)
  const [sessions, setSessions] = useState<StoredWorkoutSession[]>([])
  const [currentWeekStartDateKey, setCurrentWeekStartDateKey] = useState(
    () => getThisWeekDateRange().startDateKey,
  )
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const { startDateKey, endDateKey } = getThisWeekDateRange()
      const [raw, weekSessions] = await Promise.all([
        loadWeeklyRoutineSettings(),
        getStoredWorkoutSessionsInRange(startDateKey, endDateKey),
      ])

      setCurrentWeekStartDateKey(startDateKey)
      setSettings(raw)
      setSessions(weekSessions)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const normalized = useMemo(
    () =>
      normalizeWeeklyRoutineSettings(settings ?? {}, currentWeekStartDateKey),
    [currentWeekStartDateKey, settings],
  )

  const progress = useMemo(
    () => buildWeeklyRoutineProgress(normalized.sessions, sessions),
    [normalized.sessions, sessions],
  )

  const nextSuggestion = useMemo(
    () => getNextRoutineSuggestion(progress),
    [progress],
  )

  return {
    hasCustomSettings: settings !== null,
    progress,
    nextSuggestion,
    isLoading,
    reload: load,
  }
}
