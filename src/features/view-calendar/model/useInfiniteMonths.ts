import { useMemo } from "react"

interface MonthEntry {
  year: number
  month: number
}

function buildMonths(anchorDate: Date, count: number): MonthEntry[] {
  const months: MonthEntry[] = []
  let year = anchorDate.getFullYear()
  let month = anchorDate.getMonth() + 1

  for (let i = 0; i < count; i++) {
    months.push({ year, month })
    month -= 1
    if (month === 0) {
      month = 12
      year -= 1
    }
  }

  return months
}

/** 주어진 기준 날짜를 바탕으로 현재 월부터 과거 방향의 월 목록을 만듦 */
export function useInfiniteMonths(anchorDate: Date, count = 6) {
  return useMemo(() => buildMonths(anchorDate, count), [anchorDate, count])
}
