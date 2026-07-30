import AsyncStorage from "@react-native-async-storage/async-storage"
import { getTimestampMsFromIso } from "@/shared/lib/date"
import { parseJsonOrNull } from "@/shared/lib/json"

export const WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY =
  "yb:workout-place-reminder:enabled"
export const WORKOUT_PLACE_REMINDER_BLOCKED_AT_STORAGE_KEY =
  "yb:workout-place-reminder:cooldown-started-at"
export const WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY =
  "yb:workout-place-reminder:pending-prompt"
export const WORKOUT_PLACE_REMINDER_SYNC_STATUS_STORAGE_KEY =
  "yb:workout-place-reminder:sync-status"

/** 운동 장소 진입 후 사용자에게 표시할 대기 중 알림 정보 */
export interface PendingWorkoutPlaceReminderPrompt {
  placeId: string
  createdAt: string
}

/** 운동 장소 알림 동기화 결과를 구분하는 사유 */
export type WorkoutPlaceReminderSyncStatusReason =
  | "disabled"
  | "permission-denied"
  | "no-place"
  | "registered"
  | "registration-failed"

/** 운동 장소 알림의 동작 가능 여부와 최근 동기화 결과 */
export interface WorkoutPlaceReminderSyncStatus {
  operational: boolean
  reason: WorkoutPlaceReminderSyncStatusReason
}

/** 값이 유효한 ISO 날짜 문자열인지 확인 */
function isValidIso(value: unknown): value is string {
  return typeof value === "string" && getTimestampMsFromIso(value) !== null
}

/** 운동 장소 알림 활성화 여부 조회 */
export async function getWorkoutPlaceReminderEnabled() {
  return (
    (await AsyncStorage.getItem(WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY)) ===
    "true"
  )
}

/** 운동 장소 알림 활성화 여부 저장 */
export async function setWorkoutPlaceReminderEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY,
    enabled ? "true" : "false",
  )
}

/** 차단 시각 변경을 호출 순서대로 반영하기 위한 업데이트 큐 */
let blockedAtUpdate = Promise.resolve()

/** 기존 값보다 최신인 경우에만 운동 장소 알림 차단 시각 갱신 */
export function markWorkoutPlaceReminderBlockedAt(at: string) {
  if (!isValidIso(at)) {
    return Promise.resolve()
  }

  blockedAtUpdate = blockedAtUpdate
    .catch(() => undefined)
    .then(async () => {
      const current = await AsyncStorage.getItem(
        WORKOUT_PLACE_REMINDER_BLOCKED_AT_STORAGE_KEY,
      )
      const currentMs = current ? getTimestampMsFromIso(current) : null
      const nextMs = getTimestampMsFromIso(at)
      if (currentMs !== null && nextMs !== null && currentMs >= nextMs) {
        return
      }
      await AsyncStorage.setItem(
        WORKOUT_PLACE_REMINDER_BLOCKED_AT_STORAGE_KEY,
        at,
      )
    })
  return blockedAtUpdate
}

/** 저장된 운동 장소 알림 차단 시각 조회 */
export async function getWorkoutPlaceReminderBlockedAt() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_BLOCKED_AT_STORAGE_KEY,
  )
  return isValidIso(value) ? value : null
}

/** 값이 지원하는 동기화 상태 사유인지 확인 */
function isSyncStatusReason(
  value: unknown,
): value is WorkoutPlaceReminderSyncStatusReason {
  return (
    value === "disabled" ||
    value === "permission-denied" ||
    value === "no-place" ||
    value === "registered" ||
    value === "registration-failed"
  )
}

/** 저장소에서 읽은 값을 검증하고 동기화 상태로 변환 */
function normalizeSyncStatus(
  value: unknown,
): WorkoutPlaceReminderSyncStatus | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const status = value as Partial<WorkoutPlaceReminderSyncStatus>
  return typeof status.operational === "boolean" &&
    isSyncStatusReason(status.reason)
    ? { operational: status.operational, reason: status.reason }
    : null
}

/** 최근 운동 장소 알림 동기화 상태 조회 */
export async function getWorkoutPlaceReminderSyncStatus() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_SYNC_STATUS_STORAGE_KEY,
  )
  return value
    ? normalizeSyncStatus(parseJsonOrNull<unknown>(value))
    : null
}

/** 운동 장소 알림 동기화 상태 저장 */
export function saveWorkoutPlaceReminderSyncStatus(
  status: WorkoutPlaceReminderSyncStatus,
) {
  return AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_SYNC_STATUS_STORAGE_KEY,
    JSON.stringify(status),
  )
}

/** 사용자에게 아직 표시하지 않은 장소 알림 정보 조회 */
export async function getPendingWorkoutPlaceReminderPrompt() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
  )
  const parsed = value
    ? parseJsonOrNull<Partial<PendingWorkoutPlaceReminderPrompt>>(value)
    : null
  return parsed &&
    typeof parsed.placeId === "string" &&
    isValidIso(parsed.createdAt)
    ? { placeId: parsed.placeId, createdAt: parsed.createdAt }
    : null
}

/** 사용자에게 표시할 대기 중 장소 알림 정보 저장 */
export function savePendingWorkoutPlaceReminderPrompt(
  prompt: PendingWorkoutPlaceReminderPrompt,
) {
  return AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
    JSON.stringify(prompt),
  )
}

/** 저장된 대기 중 장소 알림 정보 삭제 */
export function clearPendingWorkoutPlaceReminderPrompt() {
  return AsyncStorage.removeItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
  )
}
