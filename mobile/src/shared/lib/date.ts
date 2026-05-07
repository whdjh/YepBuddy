function isValidDate(date: Date) {
  return Number.isFinite(date.getTime())
}

function pad2(value: number) {
  return String(value).padStart(2, "0")
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
  return getLocalDateKey(date)
}

/** Date를 로컬 날짜 키(YYYY-MM-DD)로 변환 */
export function getLocalDateKey(date: Date) {
  if (!isValidDate(date)) {
    return ""
  }

  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  return `${year}-${month}-${day}`
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

/** YYYY-MM-DD 형식의 날짜 키를 UTC 자정 timestamp로 변환 */
export function getUtcMsFromDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return timestamp
}

/** 두 날짜 키 사이에 지난 전체 주 수를 반환. 시작일보다 이전이면 0 */
export function getElapsedWeeksBetweenDateKeys(
  startDateKey: string,
  endDateKey: string,
) {
  const startMs = getUtcMsFromDateKey(startDateKey)
  const endMs = getUtcMsFromDateKey(endDateKey)
  if (startMs === null || endMs === null) {
    return 0
  }

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
  const timestamp = getTimestampMsFromIso(iso)
  if (timestamp === null || !Number.isFinite(hours)) {
    return null
  }

  return new Date(timestamp + hours * 60 * 60 * 1000)
}

/** ISO 시각 기준으로 지정한 시간 수만큼 지난 ISO 문자열을 반환 */
export function getIsoAfterHours(iso: string, hours: number) {
  return getDateAfterHours(iso, hours)?.toISOString() ?? ""
}

/** 두 ISO 시각 간 절대 시간 차이(ms)를 반환 */
export function getTimeDistanceMs(a: string, b: string) {
  const left = getTimestampMsFromIso(a)
  const right = getTimestampMsFromIso(b)
  if (left === null || right === null) {
    return Number.MAX_SAFE_INTEGER
  }

  return Math.abs(left - right)
}

/** ISO 시각 문자열을 ms timestamp로 바꾸고, 잘못된 값은 null로 처리 */
export function getTimestampMsFromIso(iso: string) {
  const timestamp = new Date(iso).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}
