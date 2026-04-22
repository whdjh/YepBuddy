import { AppState } from "react-native"
import { useEffect, useState } from "react"
import {
  getStoredWorkoutSessionsInRange,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

export function useThisWeekSessions() {
  const [data, setData] = useState<StoredWorkoutSession[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 언마운트 이후 늦게 끝난 비동기 응답이 state X
    let mounted = true
    // 날짜/주차 경계가 바뀌면 주간 범위도 달라지므로 자정마다 재조회
    let midnightTimer: ReturnType<typeof setTimeout> | null = null
    // 여러 refresh가 겹칠 수 있어 가장 마지막 요청만 반영
    let requestId = 0

    const refreshThisWeekSessions = async () => {
      const currentRequestId = requestId + 1
      requestId = currentRequestId

      if (mounted) {
        setIsLoading(true)
      }

      try {
        const { startDateKey, endDateKey } = getThisWeekDateRange()
        const sessions = await getStoredWorkoutSessionsInRange(
          startDateKey,
          endDateKey,
        )

        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(sessions)
        setError(null)
      } catch (caughtError) {
        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData([])
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to load this week's workout sessions"),
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

      // 다음 자정까지 남은 시간을 계산해 날짜가 바뀌는 즉시 주간 범위를 다시 계산
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)

      midnightTimer = setTimeout(() => {
        if (!mounted) {
          return
        }

        void refreshThisWeekSessions()
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    // 최초 마운트 시 한 번 읽고, 이후 자정마다 다시 읽음
    void refreshThisWeekSessions()
    scheduleMidnightRefresh()

    // 앱이 다시 active 되면 저장소 변경을 반영하기 위해 다시 읽음
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void refreshThisWeekSessions()
      }
    })

    return () => {
      mounted = false
      subscription.remove()
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
