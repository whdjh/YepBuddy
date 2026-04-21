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

/** ISO 시작 시각을 로컬 날짜 키(YYYY-MM-DD)로 변환 */
export function getLocalDateKeyFromIso(iso: string) {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** ISO 시각 기준으로 지정한 시간 수만큼 지난 Date를 반환 */
export function getDateAfterHours(iso: string, hours: number) {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000)
}

/** ISO 시각 기준으로 지정한 시간 수만큼 지난 ISO 문자열을 반환 */
export function getIsoAfterHours(iso: string, hours: number) {
  return getDateAfterHours(iso, hours).toISOString()
}

/** 두 ISO 시각 간 절대 시간 차이(ms)를 반환 */
export function getTimeDistanceMs(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime())
}
