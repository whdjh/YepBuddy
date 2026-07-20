import AsyncStorage from "@react-native-async-storage/async-storage"
import { getTimestampMsFromIso } from "@/shared/lib/date"
import { isValidCoordinates } from "@/shared/lib/geo"
import { parseJsonOrNull } from "@/shared/lib/json"

export const WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY =
  "yb:workout-place-reminder:enabled"
export const WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_STORAGE_KEY =
  "yb:workout-place-reminder:confirmed-place"
export const WORKOUT_PLACE_REMINDER_COOLDOWN_STORAGE_KEY =
  "yb:workout-place-reminder:cooldown-started-at"
export const WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY =
  "yb:workout-place-reminder:pending-prompt"
export const WORKOUT_PLACE_REMINDER_SYNC_STATUS_STORAGE_KEY =
  "yb:workout-place-reminder:sync-status"
export const WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID =
  "confirmed-workout-place"

/** 사용자가 확정한 단일 운동 장소 */
export interface ConfirmedWorkoutPlace {
  /** 단일 등록 장소의 고정 식별자 */
  id: typeof WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID
  /** 등록 장소 위도 */
  latitude: number
  /** 등록 장소 경도 */
  longitude: number
  /** 현재 위치로 등록한 시각 */
  confirmedAt: string
}

/** 운동 장소 알림 탭 후 표시할 prompt 상태 */
export interface PendingWorkoutPlaceReminderPrompt {
  /** 알림을 발생시킨 장소 식별자 */
  placeId: string
  /** 알림 탭 처리 시각 */
  createdAt: string
}

/** geofence 동기화 결과 사유 */
export type WorkoutPlaceReminderSyncStatusReason =
  | "disabled"
  | "permission-denied"
  | "no-place"
  | "registered"
  | "registration-failed"

/** geofence 동기화 상태 */
export interface WorkoutPlaceReminderSyncStatus {
  /** geofence가 현재 동작 가능한지 여부 */
  operational: boolean
  /** 마지막 동기화 결과 */
  reason: WorkoutPlaceReminderSyncStatusReason
}

/** ISO 시각 문자열인지 확인한다. */
function isValidIso(value: unknown): value is string {
  return typeof value === "string" && getTimestampMsFromIso(value) !== null
}

/** 저장값을 단일 등록 장소 타입으로 정규화 */
function normalizeConfirmedWorkoutPlace(
  value: unknown,
): ConfirmedWorkoutPlace | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const place = value as Partial<ConfirmedWorkoutPlace>
  if (
    place.id !== WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID ||
    typeof place.latitude !== "number" ||
    typeof place.longitude !== "number" ||
    !isValidCoordinates(place.latitude, place.longitude) ||
    !isValidIso(place.confirmedAt)
  ) {
    return null
  }

  return {
    id: WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_ID,
    latitude: place.latitude,
    longitude: place.longitude,
    confirmedAt: place.confirmedAt,
  }
}

/** 저장 가능한 동기화 사유인지 확인 */
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

/** 저장값을 geofence 동기화 상태로 정규화 */
function normalizeWorkoutPlaceReminderSyncStatus(
  value: unknown,
): WorkoutPlaceReminderSyncStatus | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const status = value as Partial<WorkoutPlaceReminderSyncStatus>
  if (
    typeof status.operational !== "boolean" ||
    !isSyncStatusReason(status.reason)
  ) {
    return null
  }

  return {
    operational: status.operational,
    reason: status.reason,
  }
}

/** 운동 장소 알림 활성화 여부를 조회 */
export async function getWorkoutPlaceReminderEnabled() {
  return (
    (await AsyncStorage.getItem(
      WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY,
    )) === "true"
  )
}

/** 운동 장소 알림 활성화 여부를 저장 */
export async function setWorkoutPlaceReminderEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_ENABLED_STORAGE_KEY,
    enabled ? "true" : "false",
  )
}

/** 사용자가 등록한 단일 운동 장소를 조회 */
export async function getConfirmedWorkoutPlace() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_STORAGE_KEY,
  )
  return value
    ? normalizeConfirmedWorkoutPlace(parseJsonOrNull<unknown>(value))
    : null
}

/** 등록 장소와 등록 시점 cooldown을 함께 저장 */
export async function saveConfirmedWorkoutPlace(
  place: ConfirmedWorkoutPlace,
  cooldownStartedAt: string,
) {
  const normalized = normalizeConfirmedWorkoutPlace(place)
  if (!normalized || !isValidIso(cooldownStartedAt)) {
    throw new Error("Invalid confirmed workout place")
  }

  await AsyncStorage.multiSet([
    [
      WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_STORAGE_KEY,
      JSON.stringify(normalized),
    ],
    [WORKOUT_PLACE_REMINDER_COOLDOWN_STORAGE_KEY, cooldownStartedAt],
  ])
}

/** 등록 장소와 연결된 cooldown을 삭제 */
export async function clearConfirmedWorkoutPlace() {
  await AsyncStorage.multiRemove([
    WORKOUT_PLACE_REMINDER_CONFIRMED_PLACE_STORAGE_KEY,
    WORKOUT_PLACE_REMINDER_COOLDOWN_STORAGE_KEY,
  ])
}

let cooldownUpdate = Promise.resolve()

/** 기존 값보다 늦은 시각으로 cooldown을 갱신 */
export function markWorkoutPlaceReminderCooldown(at: string) {
  if (!isValidIso(at)) {
    return Promise.resolve()
  }

  cooldownUpdate = cooldownUpdate.catch(() => undefined).then(async () => {
    const current = await AsyncStorage.getItem(
      WORKOUT_PLACE_REMINDER_COOLDOWN_STORAGE_KEY,
    )
    const currentCooldownMs = current ? getTimestampMsFromIso(current) : null
    const nextCooldownMs = getTimestampMsFromIso(at)
    if (
      currentCooldownMs !== null &&
      nextCooldownMs !== null &&
      currentCooldownMs >= nextCooldownMs
    ) {
      return
    }
    await AsyncStorage.setItem(WORKOUT_PLACE_REMINDER_COOLDOWN_STORAGE_KEY, at)
  })
  return cooldownUpdate
}

/** 현재 cooldown 시작 시각을 조회 */
export async function getWorkoutPlaceReminderCooldownStartedAt() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_COOLDOWN_STORAGE_KEY,
  )
  return isValidIso(value) ? value : null
}

/** 마지막 geofence 동기화 상태를 조회 */
export async function getWorkoutPlaceReminderSyncStatus() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_SYNC_STATUS_STORAGE_KEY,
  )
  return value
    ? normalizeWorkoutPlaceReminderSyncStatus(parseJsonOrNull<unknown>(value))
    : null
}

/** geofence 동기화 상태를 저장 */
export async function saveWorkoutPlaceReminderSyncStatus(
  status: WorkoutPlaceReminderSyncStatus,
) {
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_SYNC_STATUS_STORAGE_KEY,
    JSON.stringify(status),
  )
}

/** 알림 탭 후 표시할 운동 시작 prompt를 조회 */
export async function getPendingWorkoutPlaceReminderPrompt() {
  const value = await AsyncStorage.getItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
  )
  if (!value) {
    return null
  }

  const parsed =
    parseJsonOrNull<Partial<PendingWorkoutPlaceReminderPrompt>>(value)
  return parsed && typeof parsed.placeId === "string" && isValidIso(parsed.createdAt)
    ? { placeId: parsed.placeId, createdAt: parsed.createdAt }
    : null
}

/** 알림 탭 후 표시할 운동 시작 prompt를 저장 */
export async function savePendingWorkoutPlaceReminderPrompt(
  prompt: PendingWorkoutPlaceReminderPrompt,
) {
  await AsyncStorage.setItem(
    WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY,
    JSON.stringify(prompt),
  )
}

/** 처리한 운동 시작 prompt를 삭제 */
export async function clearPendingWorkoutPlaceReminderPrompt() {
  await AsyncStorage.removeItem(WORKOUT_PLACE_REMINDER_PENDING_PROMPT_STORAGE_KEY)
}
