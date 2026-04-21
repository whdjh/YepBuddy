import i18n from "@/shared/i18n/i18n"

/** Date → "MM.DD 요일" */
export function formatDateWithDay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const dayName = i18n.t(`common.daysShort.${date.getDay()}`)
  return `${m}.${d} ${dayName}`
}

/** Date → "YYYY년 M월" */
export function formatMonthYear(date: Date): string {
  return i18n.t("sessions.monthHeader", {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  })
}

/** bodyPart key → 번역된 라벨 */
export function bodyPartLabel(key: string): string {
  return i18n.t(`workout.bodyParts.${key}`)
}

/** HKWorkout.duration(초) → "H:MM:SS" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** 밀리초 → "MM:SS.CC" */
export function formatElapsedMs(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centiseconds = Math.floor((ms % 1000) / 10)

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`
}

/** ISO timestamp → "H:MM" (24시간) */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}
