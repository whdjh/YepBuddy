/** 현재 월부터 과거 방향으로 count개의 { year, month } 배열 생성 */
export function generateMonths(count: number): Array<{ year: number; month: number }> {
  const now = new Date()
  const months: Array<{ year: number; month: number }> = []

  let y = now.getFullYear()
  let m = now.getMonth() + 1
  
  for (let i = 0; i < count; i++) {
    months.push({ year: y, month: m })
    m--
    if (m === 0) {
      m = 12
      y--
    }
  }
  return months
}

/** 해당 월 1일의 요일 (월=0, 일=6) */
export function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

/** 해당 월의 총 일수 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
