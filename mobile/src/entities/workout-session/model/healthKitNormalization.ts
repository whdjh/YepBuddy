import type { WorkoutSessionEndResult } from "./types"

/** UUID 앞뒤 공백과 대소문자를 정리하고 빈 값은 null로 변환 */
export function normalizeHealthKitWorkoutUUID(value: unknown): string | null {
  return typeof value === "string" ? value.trim().toLowerCase() || null : null
}

/** 과거 boolean 응답과 네이티브 종료 payload를 저장 가능한 값으로 정규화 */
export function normalizeWorkoutEndResult(result: unknown): WorkoutSessionEndResult {
  const empty = { averageHeartRate: null, ended: false, healthKitWorkoutUUID: null }
  if (typeof result === "boolean") return { ...empty, ended: result }
  if (!result || typeof result !== "object" || !("ended" in result)) return empty
  if (result.ended !== true) return empty

  const average = "averageHeartRate" in result ? result.averageHeartRate : null

  return {
    ended: true,
    averageHeartRate:
      typeof average === "number" && Number.isFinite(average) && average > 0
        ? Math.round(average)
        : null,
    healthKitWorkoutUUID: normalizeHealthKitWorkoutUUID(
      "workoutUUID" in result ? result.workoutUUID : null,
    ),
  }
}
