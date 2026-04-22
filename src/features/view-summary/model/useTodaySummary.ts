import { AppState } from "react-native"
import { useEffect, useState } from "react"
import { getLocalDateKey } from "@/shared/lib/date"
import {
  getStoredWorkoutSession,
  getStoredWorkoutSessionIdByDate,
  getWorkoutSummariesForDate,
} from "@/entities/workout-session"
import {
  EMPTY_TODAY_SUMMARY,
  mergeTodaySummary,
  type TodaySummary,
} from "./todaySummary"

export function useTodaySummary() {
  const [data, setData] = useState<TodaySummary>(EMPTY_TODAY_SUMMARY)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let midnightTimer: ReturnType<typeof setTimeout> | null = null
    let requestId = 0

    const refreshTodaySummary = async () => {
      const currentRequestId = requestId + 1
      requestId = currentRequestId

      if (mounted) {
        setIsLoading(true)
      }

      try {
        const dateKey = getLocalDateKey(new Date())
        const [sessionId, hkWorkouts] = await Promise.all([
          getStoredWorkoutSessionIdByDate(dateKey),
          getWorkoutSummariesForDate(dateKey),
        ])
        const storedSession = sessionId
          ? await getStoredWorkoutSession(sessionId)
          : null

        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(
          mergeTodaySummary({
            hkWorkouts,
            storedSession,
          }),
        )
        setError(null)
      } catch (caughtError) {
        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(EMPTY_TODAY_SUMMARY)
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to load today summary"),
        )
      } finally {
        if (mounted && currentRequestId === requestId) {
          setIsLoading(false)
        }
      }
    }

    const scheduleMidnightRefresh = () => {
      if (!mounted) {
        return
      }

      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)

      midnightTimer = setTimeout(() => {
        if (!mounted) {
          return
        }

        void refreshTodaySummary()
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    void refreshTodaySummary()
    scheduleMidnightRefresh()

    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void refreshTodaySummary()
      }
    })

    return () => {
      mounted = false
      appStateSubscription.remove()
      if (midnightTimer) {
        clearTimeout(midnightTimer)
      }
    }
  }, [])

  return {
    data,
    error,
    isLoading,
  }
}
