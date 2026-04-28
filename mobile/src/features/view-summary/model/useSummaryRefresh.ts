import { AppState } from "react-native"
import { useEffect, useState } from "react"

interface UseSummaryRefreshOptions<T> {
  initialData: T
  load: () => Promise<T>
}

/**
 * 메인 요약 화면의 날짜 기반 조회 패턴을 공통화한다.
 * - 최초 마운트 시 1회 조회
 * - 앱이 다시 active 되면 재조회
 * - 자정이 지나면 재조회
 * - 오래된 응답은 requestId로 무시
 */
export function useSummaryRefresh<T>({
  initialData,
  load,
}: UseSummaryRefreshOptions<T>) {
  const [data, setData] = useState<T>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let midnightTimer: ReturnType<typeof setTimeout> | null = null
    let requestId = 0

    const refresh = async () => {
      const currentRequestId = requestId + 1
      requestId = currentRequestId

      if (mounted) {
        setIsLoading(true)
      }

      try {
        const nextData = await load()

        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(nextData)
        setError(null)
      } catch (caughtError) {
        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setData(initialData)
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to refresh summary data"),
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

        void refresh()
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    void refresh()
    scheduleMidnightRefresh()

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void refresh()
      }
    })

    return () => {
      mounted = false
      subscription.remove()
      if (midnightTimer) {
        clearTimeout(midnightTimer)
      }
    }
  }, [initialData, load])

  return {
    data,
    error,
    isLoading,
  }
}
