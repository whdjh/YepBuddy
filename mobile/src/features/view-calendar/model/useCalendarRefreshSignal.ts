import { AppState } from "react-native"
import { useEffect, useState } from "react"

interface CalendarRefreshSignal {
  anchorDate: Date
  refreshKey: number
}

/** 캘린더 화면이 앱 복귀/자정 경계를 지날 때 한 번만 새로고침 */
export function useCalendarRefreshSignal(): CalendarRefreshSignal {
  const [anchorDate, setAnchorDate] = useState(() => new Date())  // 현재 월/오늘 계산 기준
  const [refreshKey, setRefreshKey] = useState(0) // 월별 저장 데이터 재조회 트리거

  useEffect(() => {
    let mounted = true
    let midnightTimer: ReturnType<typeof setTimeout> | null = null

    const refresh = () => {
      setAnchorDate(new Date())
      setRefreshKey((currentKey) => currentKey + 1)
    }

    const scheduleMidnightRefresh = () => {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)

      midnightTimer = setTimeout(() => {
        if (!mounted) {
          return
        }

        refresh()
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    scheduleMidnightRefresh()

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        refresh()
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
    anchorDate,
    refreshKey,
  }
}
