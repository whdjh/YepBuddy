/** 현재 월부터 과거 방향으로 count개의 { year, month } 배열 생성 */
export function generateMonths(count: number): { year: number; month: number }[] {
  const now = new Date()
  const months: { year: number; month: number }[] = []

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

/** Date를 로컬 날짜 키(YYYY-MM-DD)로 변환 */
export function getLocalDateKey(date: Date) {
  return getLocalDateKeyFromIso(date.toISOString())
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

/** YYYY-MM-DD 형식의 날짜 키를 UTC 자정 timestamp로 변환 */
export function getUtcMsFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return Date.UTC(year, month - 1, day)
}

/** 두 날짜 키 사이에 지난 전체 주 수를 반환. 시작일보다 이전이면 0 */
export function getElapsedWeeksBetweenDateKeys(
  startDateKey: string,
  endDateKey: string,
) {
  const startMs = getUtcMsFromDateKey(startDateKey)
  const endMs = getUtcMsFromDateKey(endDateKey)
  return Math.max(0, Math.floor((endMs - startMs) / MS_PER_WEEK))
}

/** 이번 주 로컬 날짜 키 범위(월요일 ~ 일요일)를 반환 */
export function getThisWeekDateRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const startDate = new Date(now)
  startDate.setDate(now.getDate() + mondayOffset)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)

  return {
    endDateKey: getLocalDateKey(endDate),
    startDateKey: getLocalDateKey(startDate),
  }
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

/** ISO 시각 문자열을 ms timestamp로 바꾸고, 잘못된 값은 null로 처리 */
export function getTimestampMsFromIso(iso: string) {
  const timestamp = new Date(iso).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}
