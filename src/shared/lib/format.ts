import i18next from "i18next"

/** Date → "MM.DD 요일" */
export function formatDateWithDay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const dayName = i18next.t(`sessions.days.${date.getDay()}`)
  return `${m}.${d} ${dayName}`
}

/** Date → "YYYY년 M월" */
export function formatMonthYear(date: Date): string {
  return i18next.t("sessions.monthHeader", { year: date.getFullYear(), month: date.getMonth() + 1 })
}

/** bodyPart key → 번역된 라벨 */
export function bodyPartLabel(key: string): string {
  return i18next.t(`workout.bodyParts.${key}`)
}

/** HKWorkout.duration(초) → "H:MM:SS" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** ISO timestamp → "H:MM" (24시간) */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}
