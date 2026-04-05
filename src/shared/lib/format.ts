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
