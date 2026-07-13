import { AppState } from "react-native"
import { useCallback, useEffect, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"

interface CalendarRefreshSignal {
  anchorDate: Date
  refreshKey: number
}

/** 캘린더 화면 focus/앱 복귀/자정 경계에서 조회 기준을 새로고침 */
export function useCalendarRefreshSignal(): CalendarRefreshSignal {
  const [anchorDate, setAnchorDate] = useState(() => new Date())  // 현재 월/오늘 계산 기준
  const [refreshKey, setRefreshKey] = useState(0) // 월별 저장 데이터 재조회 트리거

  const refresh = useCallback(() => {
    setAnchorDate(new Date())
    setRefreshKey((currentKey) => currentKey + 1)
  }, [])

  useFocusEffect(refresh)

  useEffect(() => {
    let mounted = true
    let midnightTimer: ReturnType<typeof setTimeout> | null = null

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
  }, [refresh])

  return {
    anchorDate,
    refreshKey,
  }
}
