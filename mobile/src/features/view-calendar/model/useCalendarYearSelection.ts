import { useEffect, useMemo, useState } from "react"
import { getAllStoredWorkoutSessions } from "@/entities/workout-session"
import {
  getYearMonthFromIso,
  type YearMonth,
} from "@/shared/lib/date"
import { buildCalendarYearSelection } from "./calendarYearSelection"

function getMonthIndex({ year, month }: YearMonth) {
  return year * 12 + month
}

/** 첫 운동 연도부터 현재 연도까지 탐색하고 선택 연도의 월만 제공 */
export function useCalendarYearSelection(anchorDate: Date) {
  const current = useMemo(
    () => ({
      month: anchorDate.getMonth() + 1,
      year: anchorDate.getFullYear(),
    }),
    [anchorDate],
  )
  const [firstWorkout, setFirstWorkout] = useState<YearMonth | null>(null)
  const [requestedYear, setSelectedYear] = useState(current.year)

  useEffect(() => {
    let active = true

    const loadFirstWorkout = async () => {
      try {
        const currentMonthIndex = getMonthIndex(current)
        const first = (await getAllStoredWorkoutSessions())
          .map((session) => getYearMonthFromIso(session.startedAt))
          .filter(
            (yearMonth): yearMonth is YearMonth =>
              yearMonth !== null &&
              getMonthIndex(yearMonth) <= currentMonthIndex,
          )
          .reduce<YearMonth | null>(
            (oldest, yearMonth) =>
              !oldest || getMonthIndex(yearMonth) < getMonthIndex(oldest)
                ? yearMonth
                : oldest,
            null,
          )

        if (active) {
          setFirstWorkout(first)
        }
      } catch {
        if (active) {
          setFirstWorkout(null)
        }
      }
    }

    void loadFirstWorkout()

    return () => {
      active = false
    }
  }, [current])

  const selection = useMemo(
    () => buildCalendarYearSelection(current, firstWorkout, requestedYear),
    [current, firstWorkout, requestedYear],
  )

  useEffect(() => {
    if (requestedYear !== selection.selectedYear) {
      setSelectedYear(selection.selectedYear)
    }
  }, [requestedYear, selection.selectedYear])

  return {
    ...selection,
    setSelectedYear,
  }
}
