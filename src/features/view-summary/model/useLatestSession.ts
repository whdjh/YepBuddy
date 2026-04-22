import { AppState } from "react-native"
import { useEffect, useState } from "react"
import {
  getLatestStoredWorkoutSession,
  type StoredWorkoutSession,
} from "@/entities/workout-session"

export function useLatestSession() {
  const [data, setData] = useState<StoredWorkoutSession | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true  // 언마운트 이후 늦게 끝난 비동기 응답이 state 방지
    let midnightTimer: ReturnType<typeof setTimeout> | null = null  // 날짜 기준 데이터이므로 자정이 지나면 다시 읽음
    let requestId = 0 // 여러 refresh가 겹칠 수 있어 가장 마지막 요청만 반영

    const refreshLatestSession = async () => {
      const currentRequestId = requestId + 1
      requestId = currentRequestId

      if (mounted) {
        setIsLoading(true)
      }

      try {
        const session = await getLatestStoredWorkoutSession()

        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(session)
        setError(null)
      } catch (caughtError) {
        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(null)
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("가장 최근 세션 업로드 오류 발생"),
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

      // 다음 자정까지 남은 시간을 계산해 날짜 경계가 바뀌는 시점에 재조회
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)

      midnightTimer = setTimeout(() => {
        if (!mounted) {
          return
        }

        void refreshLatestSession()
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    // 최초 마운트 시 한 번 읽고, 이후 자정마다 다시 읽음
    void refreshLatestSession()
    scheduleMidnightRefresh()

    // 백그라운드에 있다가 돌아오면 저장소 값이 바뀌었을 수 있어 다시 읽음
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void refreshLatestSession()
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
