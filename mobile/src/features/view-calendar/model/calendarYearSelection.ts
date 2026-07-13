import type { YearMonth } from "@/shared/lib/date"

export interface MonthEntry {
  year: number
  month: number
}

interface CalendarYearSelection {
  months: MonthEntry[]
  selectedYear: number
  years: number[]
}

/** 첫 운동 월부터 현재 월까지 선택 가능한 연도와 선택 연도의 월을 계산 */
export function buildCalendarYearSelection(
  current: YearMonth,
  firstWorkout: YearMonth | null,
  requestedYear: number,
): CalendarYearSelection {
  const first = firstWorkout ?? current
  const years = Array.from(
    { length: current.year - first.year + 1 },
    (_, index) => current.year - index,
  )
  const selectedYear = years.includes(requestedYear)
    ? requestedYear
    : current.year
  const startMonth = selectedYear === current.year ? current.month : 12
  const endMonth = selectedYear === first.year ? first.month : 1
  const months = Array.from(
    { length: startMonth - endMonth + 1 },
    (_, index) => ({ year: selectedYear, month: startMonth - index }),
  )

  return { months, selectedYear, years }
}
