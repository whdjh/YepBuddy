import { AppState } from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { loadSessionsByMonth } from "./useSessionsByMonth"
import type { SessionListItem, SessionMonthEntry } from "./types"

const INITIAL_MONTH_COUNT = 3

function getCurrentMonthEntry(date = new Date()): SessionMonthEntry {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

function getPreviousMonth(entry: SessionMonthEntry): SessionMonthEntry {
  if (entry.month === 1) {
    return { year: entry.year - 1, month: 12 }
  }

  return { year: entry.year, month: entry.month - 1 }
}

function getMonthKey(entry: SessionMonthEntry) {
  return `${entry.year}-${String(entry.month).padStart(2, "0")}`
}

function mergeSessions(
  existingSessions: SessionListItem[],
  nextSessions: SessionListItem[],
) {
  // 같은 세션이 다시 로드되면 최신 값으로 덮어쓰고, 전체 목록은 시작 시간 역순으로 유지
  const sessionMap = new Map(
    existingSessions.map((session) => [session.sessionId, session]),
  )

  for (const session of nextSessions) {
    sessionMap.set(session.sessionId, session)
  }

  return [...sessionMap.values()].sort(
    (left, right) =>
      new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime(),
  )
}

export function useInfiniteSessions() {
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loadedMonths, setLoadedMonths] = useState<SessionMonthEntry[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const requestIdRef = useRef(0)
  // 값이 바뀌면 초기 로딩 effect가 다시 실행되어 전체 월 목록을 새로 가져옴
  const [refreshKey, setRefreshKey] = useState(0)

  const loadMonthEntry = useCallback(
    async (entry: SessionMonthEntry, requestId = requestIdRef.current) => {
      try {
        const nextSessions = await loadSessionsByMonth(entry.year, entry.month)
        if (requestId !== requestIdRef.current) {
          return false
        }

        // 월별 응답을 기존 목록에 합치되, sessionId 기준으로 중복을 제거한다.
        setSessions((currentSessions) =>
          mergeSessions(currentSessions, nextSessions),
        )
        setLoadedMonths((currentMonths) => {
          const monthKey = getMonthKey(entry)
          if (
            currentMonths.some(
              (currentMonth) => getMonthKey(currentMonth) === monthKey,
            )
          ) {
            return currentMonths
          }

          return [...currentMonths, entry]
        })
        return true
      } catch {
        return false
      }
    },
    [],
  )

  const loadInitialMonths = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    const firstMonth = getCurrentMonthEntry()
    const monthEntries: SessionMonthEntry[] = []
    let currentMonth = firstMonth

    // "이번 달부터 과거 N개월" 범위를 순서대로
    for (let index = 0; index < INITIAL_MONTH_COUNT; index += 1) {
      monthEntries.push(currentMonth)
      currentMonth = getPreviousMonth(currentMonth)
    }

    // 새로고침 시에는 이전 결과를 버리고 처음부터 다시 적재
    setSessions([])
    setLoadedMonths([])

    // 월별 로딩을 순차 실행해서 loadedMonths의 순서를 안정적으로 유지
    for (const monthEntry of monthEntries) {
      const loaded = await loadMonthEntry(monthEntry, requestId)
      if (!loaded || requestId !== requestIdRef.current) {
        return
      }
    }
  }, [loadMonthEntry])

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoadingInitial(true)

      try {
        // 최초 진입 또는 refreshKey 변경 시 초기 월 묶음을 다시 불러옴
        await loadInitialMonths()
      } finally {
        if (active) {
          setIsLoadingInitial(false)
        }
      }
    }

    void load()

    return () => {
      active = false
      requestIdRef.current += 1
    }
  }, [loadInitialMonths, refreshKey])

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

        // 날짜가 바뀌면 "현재 달" 기준이 달라질 수 있으므로 전체 목록을 다시 계산
        setRefreshKey((currentKey) => currentKey + 1)
        scheduleMidnightRefresh()
      }, nextMidnight.getTime() - now.getTime())
    }

    scheduleMidnightRefresh()

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // 백그라운드에 있던 동안 데이터가 바뀌었을 수 있어 포그라운드 복귀 시 새로고침
        setRefreshKey((currentKey) => currentKey + 1)
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

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isLoadingInitial) {
      return
    }

    setIsLoadingMore(true)
    const requestId = requestIdRef.current

    try {
      // 마지막으로 적재한 월의 바로 이전 달을 이어서 가져옴
      const lastLoadedMonth =
        loadedMonths[loadedMonths.length - 1] ?? getCurrentMonthEntry()
      const nextMonth = getPreviousMonth(lastLoadedMonth)
      await loadMonthEntry(nextMonth, requestId)
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingMore(false)
      }
    }
  }, [isLoadingInitial, isLoadingMore, loadMonthEntry, loadedMonths])

  return useMemo(
    () => ({
      sessions,
      isLoadingInitial,
      isLoadingMore,
      loadMore,
    }),
    [isLoadingInitial, isLoadingMore, loadMore, sessions],
  )
}
