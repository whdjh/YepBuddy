import i18n from "@/shared/i18n/i18n"

function isValidDate(date: Date) {
  return Number.isFinite(date.getTime())
}

function safePositiveNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

/** Date → "MM.DD 요일" */
export function formatDateWithDay(date: Date): string {
  if (!isValidDate(date)) {
    return ""
  }

  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const mondayFirstDayIndex = (date.getDay() + 6) % 7
  const dayName = i18n.t(`common.daysShort.${mondayFirstDayIndex}`)
  return `${m}.${d} ${dayName}`
}

/** Date → "YYYY년 M월" */
export function formatMonthYear(date: Date): string {
  if (!isValidDate(date)) {
    return ""
  }

  return i18n.t("sessions.monthHeader", {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  })
}

/** bodyPart key → 번역된 라벨 */
export function bodyPartLabel(key: string): string {
  return i18n.t(`workout.bodyParts.${key}`)
}

/** bodyPartDetail key → 번역된 라벨 */
export function bodyPartDetailLabel(key: string): string {
  return i18n.t(`workout.bodyPartDetails.${key}`)
}

/** HKWorkout.duration(초) → "H:MM:SS" */
export function formatDuration(seconds: number): string {
  const safeSeconds = safePositiveNumber(seconds)
  const h = Math.floor(safeSeconds / 3600)
  const m = Math.floor((safeSeconds % 3600) / 60)
  const s = Math.floor(safeSeconds % 60)
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** 밀리초 → "MM:SS.CC" */
export function formatElapsedMs(ms: number): string {
  const safeMs = safePositiveNumber(ms)
  const minutes = Math.floor(safeMs / 60000)
  const seconds = Math.floor((safeMs % 60000) / 1000)
  const centiseconds = Math.floor((safeMs % 1000) / 10)

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`
}

/** ISO timestamp → "H:MM" (24시간) */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (!isValidDate(d)) {
    return ""
  }

  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}
