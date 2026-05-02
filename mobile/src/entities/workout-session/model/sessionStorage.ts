import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import type { StoredWorkoutSession } from "./types"

// 현재 진행 중인 운동 세션 스냅샷을 저장하는 키
export const CURRENT_WORKOUT_STORAGE_KEY = "yb:workout:current"
// 다음 운동 리마인더 notification identifier를 저장하는 키
export const WORKOUT_REMINDER_STORAGE_KEY = "yb:workout:reminder"
const WORKOUT_DATES_STORAGE_KEY = "yb:workout:dates"
const WORKOUT_DATE_STORAGE_PREFIX = "yb:workout:date:"
let hasVerifiedStoredWorkoutDateKeys = false

type PersistedWorkoutSession = Omit<StoredWorkoutSession, "cardioStartedAt"> &
  Partial<Pick<StoredWorkoutSession, "cardioStartedAt">>

// 완료된 운동 세션 본문은 sessionId 기준으로 저장
export const getWorkoutSessionStorageKey = (sessionId: string) =>
  `yb:workout:session:${sessionId}`

// 날짜별 대표 운동 세션은 YYYY-MM-DD 기준으로 찾기
export const getWorkoutDateStorageKey = (dateKey: string) =>
  `${WORKOUT_DATE_STORAGE_PREFIX}${dateKey}`

/** 진행 중 운동 세션 스냅샷을 저장 */
export async function saveCurrentWorkoutSnapshot<T>(snapshot: T) {
  await AsyncStorage.setItem(
    CURRENT_WORKOUT_STORAGE_KEY,
    JSON.stringify(snapshot),
  )
}

/** 진행 중 운동 세션 스냅샷 */
export async function loadCurrentWorkoutSnapshot<T>() {
  const value = await AsyncStorage.getItem(CURRENT_WORKOUT_STORAGE_KEY)
  return value ? (JSON.parse(value) as T) : null
}

/** 진행 중 운동 세션 스냅샷을 삭제 */
export async function clearCurrentWorkoutSnapshot() {
  await AsyncStorage.removeItem(CURRENT_WORKOUT_STORAGE_KEY)
}

/** 다음 운동 리마인더 identifier를 저장 */
export async function saveWorkoutReminderId(identifier: string) {
  await AsyncStorage.setItem(WORKOUT_REMINDER_STORAGE_KEY, identifier)
}

/** 저장된 운동 리마인더 identifier를 조회 */
export async function getWorkoutReminderId() {
  return AsyncStorage.getItem(WORKOUT_REMINDER_STORAGE_KEY)
}

/** 저장된 운동 리마인더 identifier를 삭제 */
export async function clearWorkoutReminderId() {
  await AsyncStorage.removeItem(WORKOUT_REMINDER_STORAGE_KEY)
}

/** 날짜별 sessionId 저장 키에서 YYYY-MM-DD 날짜 키만 추출 */
function getDateKeyFromStorageKey(storageKey: string) {
  return storageKey.slice(WORKOUT_DATE_STORAGE_PREFIX.length)
}

/** 날짜 키 목록에서 중복을 제거하고 최신 날짜순으로 정렬 */
function normalizeStoredDateKeys(dateKeys: string[]) {
  return [...new Set(dateKeys)].sort((a, b) => b.localeCompare(a))
}

/** 완료 세션이 저장된 날짜 키 인덱스를 저장 */
async function saveStoredWorkoutDateKeys(dateKeys: string[]) {
  await AsyncStorage.setItem(
    WORKOUT_DATES_STORAGE_KEY,
    JSON.stringify(normalizeStoredDateKeys(dateKeys)),
  )
}

/** 저장된 날짜 키 인덱스를 읽고, 형식이 맞지 않으면 null 반환 */
async function getStoredWorkoutDateKeysFromIndex() {
  const value = await AsyncStorage.getItem(WORKOUT_DATES_STORAGE_KEY)
  if (!value) {
    return null
  }

  const parsed = JSON.parse(value) as unknown
  if (!Array.isArray(parsed) || parsed.some((key) => typeof key !== "string")) {
    return null
  }

  return normalizeStoredDateKeys(parsed)
}

/** 날짜별 sessionId 저장 키 전체를 스캔해 날짜 키 인덱스를 다시 생성 */
async function rebuildStoredWorkoutDateKeys() {
  const dateKeys = (await AsyncStorage.getAllKeys())
    .filter((key) => key.startsWith(WORKOUT_DATE_STORAGE_PREFIX))
    .map(getDateKeyFromStorageKey)

  const normalizedDateKeys = normalizeStoredDateKeys(dateKeys)
  await saveStoredWorkoutDateKeys(normalizedDateKeys)
  return normalizedDateKeys
}

/** 저장된 날짜 키 인덱스를 가져오고, 필요하면 실제 저장 키 기준으로 재검증 */
async function getStoredWorkoutDateKeys() {
  const indexedDateKeys = await getStoredWorkoutDateKeysFromIndex()
  if (indexedDateKeys && hasVerifiedStoredWorkoutDateKeys) {
    return indexedDateKeys
  }

  const rebuiltDateKeys = await rebuildStoredWorkoutDateKeys()
  hasVerifiedStoredWorkoutDateKeys = true
  return rebuiltDateKeys
}

/** 날짜 키가 지정된 시작/종료 날짜 키 범위 안에 있는지 확인 */
function isDateKeyInRange(
  dateKey: string,
  startDateKey: string,
  endDateKey: string,
) {
  return dateKey >= startDateKey && dateKey <= endDateKey
}

/** 저장된 세션 JSON을 현재 StoredWorkoutSession 형태로 정규화 */
function parseStoredWorkoutSession(value: string) {
  const session = JSON.parse(value) as PersistedWorkoutSession
  return {
    ...session,
    cardioStartedAt: session.cardioStartedAt ?? null,
  }
}

/** 완료 세션 본문과 날짜별 sessionId 인덱스를 함께 저장 */
export async function saveCompletedWorkoutSession(
  session: StoredWorkoutSession,
) {
  const dateKey = getLocalDateKeyFromIso(session.startedAt)
  const storedDateKeys = await getStoredWorkoutDateKeys()
  const nextDateKeys = storedDateKeys.includes(dateKey)
    ? storedDateKeys
    : [...storedDateKeys, dateKey]

  await Promise.all([
    AsyncStorage.setItem(
      getWorkoutSessionStorageKey(session.sessionId),
      JSON.stringify(session),
    ),
    AsyncStorage.setItem(getWorkoutDateStorageKey(dateKey), session.sessionId),
    saveStoredWorkoutDateKeys(nextDateKeys),
  ])
}

/** sessionId로 완료 세션 하나를 조회 */
export async function getStoredWorkoutSession(sessionId: string) {
  const value = await AsyncStorage.getItem(getWorkoutSessionStorageKey(sessionId))
  return value ? parseStoredWorkoutSession(value) : null
}

/** 완료 세션 메모만 수정한 뒤 다시 저장 */
export async function updateStoredWorkoutMemo(sessionId: string, memo: string) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const nextSession = { ...session, memo }
  await saveCompletedWorkoutSession(nextSession)
  return nextSession
}

/** 완료 세션 본문과 날짜별 sessionId 인덱스를 함께 삭제 */
export async function deleteStoredWorkoutSession(sessionId: string) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const dateKey = getLocalDateKeyFromIso(session.startedAt)
  const storedDateKeys = await getStoredWorkoutDateKeys()
  const nextDateKeys = storedDateKeys.filter((key) => key !== dateKey)

  await Promise.all([
    AsyncStorage.removeItem(getWorkoutSessionStorageKey(sessionId)),
    AsyncStorage.removeItem(getWorkoutDateStorageKey(dateKey)),
    saveStoredWorkoutDateKeys(nextDateKeys),
  ])

  return session
}

/** 날짜 키로 완료 세션의 sessionId를 조회 */
export async function getStoredWorkoutSessionIdByDate(dateKey: string) {
  return AsyncStorage.getItem(getWorkoutDateStorageKey(dateKey))
}

/** 날짜 키 범위 안에 있는 완료 세션 id 목록을 최신 날짜순으로 조회 */
async function getStoredWorkoutSessionIdsByDateRange(
  startDateKey: string,
  endDateKey: string,
) {
  const [normalizedStart, normalizedEnd] =
    startDateKey <= endDateKey
      ? [startDateKey, endDateKey]
      : [endDateKey, startDateKey]

  const dateKeys = (await getStoredWorkoutDateKeys()).filter((dateKey) =>
    isDateKeyInRange(dateKey, normalizedStart, normalizedEnd),
  )

  if (dateKeys.length === 0) {
    return []
  }

  const indexEntries = await Promise.all(
    dateKeys.map(async (dateKey) => {
      const sessionId = await AsyncStorage.getItem(
        getWorkoutDateStorageKey(dateKey),
      )
      return [dateKey, sessionId] as const
    }),
  )

  return indexEntries
    .map(([, sessionId]) => sessionId)
    .filter((sessionId): sessionId is string => sessionId !== null)
}

/** 완료 세션을 날짜 키 범위 내에서 최신순으로 조회 */
export async function getStoredWorkoutSessionsInRange(
  startDateKey: string,
  endDateKey: string,
) {
  const sessionIds = await getStoredWorkoutSessionIdsByDateRange(
    startDateKey,
    endDateKey,
  )

  if (sessionIds.length === 0) {
    return []
  }

  const sessionEntries = await Promise.all(
    sessionIds.map(async (sessionId) => {
      const value = await AsyncStorage.getItem(
        getWorkoutSessionStorageKey(sessionId),
      )
      return [sessionId, value] as const
    }),
  )

  return sessionEntries
    .map(([, value]) => (value ? parseStoredWorkoutSession(value) : null))
    .filter((session): session is StoredWorkoutSession => session !== null)
}

/** 특정 월의 완료 세션을 최신순으로 조회 */
export async function getStoredWorkoutSessionsForMonth(
  year: number,
  month: number,
) {
  const startDateKey = `${year}-${String(month).padStart(2, "0")}-01`
  const endDateKey = `${year}-${String(month).padStart(2, "0")}-${String(
    new Date(year, month, 0).getDate(),
  ).padStart(2, "0")}`

  return getStoredWorkoutSessionsInRange(startDateKey, endDateKey)
}

/** 저장된 완료 세션 중 가장 최신 세션을 조회 */
export async function getLatestStoredWorkoutSession() {
  const dateKeys = await getStoredWorkoutDateKeys()

  if (dateKeys.length === 0) {
    return null
  }

  const indexEntries = await Promise.all(
    dateKeys.map(async (dateKey) => {
      const sessionId = await AsyncStorage.getItem(
        getWorkoutDateStorageKey(dateKey),
      )
      return [dateKey, sessionId] as const
    }),
  )
  const sessionIds = indexEntries
    .map(([, sessionId]) => sessionId)
    .filter((sessionId): sessionId is string => sessionId !== null)

  if (sessionIds.length === 0) {
    return null
  }

  for (const sessionId of sessionIds) {
    const value = await AsyncStorage.getItem(
      getWorkoutSessionStorageKey(sessionId),
    )
    const session = value ? parseStoredWorkoutSession(value) : null
    if (session) {
      return session
    }
  }

  return null
}
