import { AppState } from "react-native"
import { useEffect, useState } from "react"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import { getStoredWorkoutSessionIdByDate } from "@/entities/workout-session"

export function useTodayCompleted() {
  const [todayCompleted, setTodayCompleted] = useState(false)

  useEffect(() => {
    // 언마운트 이후 늦게 끝난 비동기 응답이 stateX
    let mounted = true
    // 오늘 여부는 자정이 지나면 바뀌므로 자정마다 다시 읽음
    let midnightTimer: ReturnType<typeof setTimeout> | null = null
    // 여러 refresh가 겹칠 수 있어 가장 마지막 요청만 반영
    let requestId = 0

    const refreshTodayCompleted = async () => {
      const currentRequestId = requestId + 1
      requestId = currentRequestId

      try {
        const dateKey = getLocalDateKeyFromIso(new Date().toISOString())
        const sessionId = await getStoredWorkoutSessionIdByDate(dateKey)

        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setTodayCompleted(sessionId !== null)
      } catch {
        if (!mounted || currentRequestId !== requestId) {
          return
        }

        setTodayCompleted(false)
      }
    }

    const scheduleMidnightRefresh = () => {
      if (!mounted) {
        return
      }

      // 다음 자정까지 남은 시간을 계산해 날짜가 바뀌는 즉시 오늘 완료 여부를 다시 계산
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)

      midnightTimer = setTimeout(() => {
        if (!mounted) {
          return
        }

        void refreshTodayCompleted()
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    // 최초 마운트 시 한 번 읽고, 이후 자정마다 다시 읽음
    void refreshTodayCompleted()
    scheduleMidnightRefresh()

    // 앱이 다시 active 되면 저장소 변경을 반영하기 위해 다시 읽음
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void refreshTodayCompleted()
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

  return todayCompleted
}
