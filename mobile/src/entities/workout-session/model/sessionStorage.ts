import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLocalDateKeyFromIso, getTimestampMsFromIso } from "@/shared/lib/date"
import { isValidCoordinates } from "@/shared/lib/geo"
import { parseJsonOrNull } from "@/shared/lib/json"
import type { CalendarAutoAddPreference } from "../lib/calendarAutoAdd"
import { normalizeOptionalMetricCount } from "./metricNormalization"
import {
  BODY_PART_DETAILS,
  type BodyPart,
  type BodyPartDetail,
  type WorkoutRoutineSubstitution,
  type StoredWorkoutSession,
  type WorkoutBodyPartSet,
  type WorkoutLocation,
} from "./types"
import type { RoutinePart } from "./routineCycle"

// 현재 진행 중인 운동 세션 스냅샷을 저장하는 키
export const CURRENT_WORKOUT_STORAGE_KEY = "yb:workout:current"
// 다음 운동 리마인더 notification identifier를 저장하는 키
export const WORKOUT_REMINDER_STORAGE_KEY = "yb:workout:reminder"
// 운동 리마인더 사용 여부를 저장하는 키
export const WORKOUT_REMINDER_ENABLED_STORAGE_KEY =
  "yb:workout:reminder:enabled"
// 완료 운동을 기기 캘린더에 자동 추가할지 저장하는 키
export const CALENDAR_AUTO_ADD_PREFERENCE_STORAGE_KEY =
  "yb:workout:calendar:auto-add"
// 완료 세션 ID 인덱스
const WORKOUT_SESSION_IDS_STORAGE_KEY = "yb:workout:sessions"
// 완료 세션 저장 키 prefix
const WORKOUT_SESSION_STORAGE_PREFIX = "yb:workout:session:"
// 완료 세션이 존재하는 날짜 키 인덱스를 저장하는 키
const WORKOUT_DATES_STORAGE_KEY = "yb:workout:dates"
// 날짜별 대표 세션 ID를 가리키는 저장 키 prefix
const WORKOUT_DATE_STORAGE_PREFIX = "yb:workout:date:"
// 세션 ID 인덱스 검증 상태
let hasVerifiedStoredWorkoutSessionIds = false
// 앱 실행 후 한 번이라도 날짜 키 인덱스를 실제 저장소와 검증했는지 플래그
let hasVerifiedStoredWorkoutDateKeys = false

// 과거 저장 포맷과의 호환을 위해 일부 필드를 옵셔널로 허용하는 디스크 표현 타입
type PersistedWorkoutSession = Omit<
  StoredWorkoutSession,
  | "activeKcal"
  | "averageHeartRate"
  | "cardioStartedAt"
  | "healthKitWorkoutUUID"
  | "isDeload"
  | "routineSubstitution"
  | "totalKcal"
> &
  Partial<
    Pick<
      StoredWorkoutSession,
      | "activeKcal"
      | "averageHeartRate"
      | "cardioStartedAt"
      | "healthKitWorkoutUUID"
      | "isDeload"
      | "routineSubstitution"
      | "totalKcal"
    >
  >

// 지원하는 운동 부위 키 목록 (검증용 화이트리스트)
const BODY_PART_KEYS = Object.keys(BODY_PART_DETAILS) as BodyPart[]

/** 저장값이 현재 앱에서 지원하는 운동 부위 키인지 확인 */
function isBodyPart(value: unknown): value is BodyPart {
  return typeof value === "string" && BODY_PART_KEYS.includes(value as BodyPart)
}

/** 저장값이 해당 운동 부위에 허용된 세부 부위인지 확인 */
function isBodyPartDetail(
  part: BodyPart,
  value: unknown,
): value is BodyPartDetail {
  return (
    typeof value === "string" &&
    BODY_PART_DETAILS[part].includes(value as BodyPartDetail)
  )
}

/** 저장된 운동 부위/세트 값을 현재 WorkoutBodyPartSet 형태로 정규화 */
function normalizeWorkoutBodyPartSet(
  value: unknown,
): WorkoutBodyPartSet | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const item = value as Partial<WorkoutBodyPartSet>

  if (
    !isBodyPart(item.part) ||
    typeof item.setCount !== "number" ||
    !Number.isFinite(item.setCount)
  ) {
    return null
  }

  const part = item.part
  const detail = isBodyPartDetail(part, item.detail) ? item.detail : undefined
  const details = Array.isArray(item.details)
    ? item.details.filter((detail): detail is BodyPartDetail =>
        isBodyPartDetail(part, detail),
      )
    : []

  return {
    part,
    ...(detail ? { detail } : {}),
    ...(details.length > 0 ? { details } : {}),
    setCount: Math.max(1, Math.round(item.setCount)),
  }
}

/** 저장된 위치값이 유효한 위도/경도인지 검증하고 앱 위치 타입으로 정리 */
function normalizeWorkoutLocation(value: unknown): WorkoutLocation | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const location = value as Partial<WorkoutLocation>

  if (
    typeof location.lat !== "number" ||
    typeof location.lng !== "number" ||
    !isValidCoordinates(location.lat, location.lng)
  ) {
    return null
  }

  return {
    lat: location.lat,
    lng: location.lng,
  }
}

/** 저장된 루틴 대체 정보를 검증하고 WorkoutRoutineSubstitution 형태로 정규화 */
function normalizeRoutineSubstitution(
  value: unknown,
): WorkoutRoutineSubstitution | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const substitution = value as Partial<WorkoutRoutineSubstitution> & {
    weekStartDateKey?: unknown
  }
  const cycleAnchorDateKey =
    typeof substitution.cycleAnchorDateKey === "string"
      ? substitution.cycleAnchorDateKey
      : substitution.weekStartDateKey
  const originalParts = Array.isArray(substitution.originalParts)
    ? substitution.originalParts
        .map((part): RoutinePart | null => {
          if (!part || typeof part !== "object" || !isBodyPart(part.part)) {
            return null
          }

          const details = Array.isArray(part.details)
            ? part.details.filter((detail): detail is BodyPartDetail =>
                isBodyPartDetail(part.part, detail),
              )
            : []

          return {
            part: part.part,
            ...(details.length > 0 ? { details } : {}),
          }
        })
        .filter((part): part is RoutinePart => part !== null)
    : []

  if (
    typeof cycleAnchorDateKey !== "string" ||
    typeof substitution.routineSessionId !== "string" ||
    typeof substitution.routineSessionIndex !== "number" ||
    !Number.isInteger(substitution.routineSessionIndex) ||
    originalParts.length === 0
  ) {
    return null
  }

  return {
    cycleAnchorDateKey,
    routineSessionId: substitution.routineSessionId,
    routineSessionIndex: Math.max(0, substitution.routineSessionIndex),
    originalParts,
  }
}

// 완료된 운동 세션 본문은 sessionId 기준으로 저장
export const getWorkoutSessionStorageKey = (sessionId: string) =>
  `${WORKOUT_SESSION_STORAGE_PREFIX}${sessionId}`

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
  return value ? parseJsonOrNull<T>(value) : null
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

/** 운동 리마인더 활성화 저장값을 조회 */
export async function getWorkoutReminderEnabled() {
  return (
    (await AsyncStorage.getItem(WORKOUT_REMINDER_ENABLED_STORAGE_KEY)) === "true"
  )
}

/** 운동 리마인더 활성화 저장값을 저장 */
export async function setWorkoutReminderEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    WORKOUT_REMINDER_ENABLED_STORAGE_KEY,
    enabled ? "true" : "false",
  )
}

/** 캘린더 자동 추가 선호값을 조회 */
export async function getCalendarAutoAddPreference(): Promise<CalendarAutoAddPreference> {
  const value = await AsyncStorage.getItem(
    CALENDAR_AUTO_ADD_PREFERENCE_STORAGE_KEY,
  )

  return value === "enabled" || value === "disabled" ? value : "unknown"
}

/** 캘린더 자동 추가 선호값을 저장 */
export async function setCalendarAutoAddPreference(
  preference: CalendarAutoAddPreference,
) {
  await AsyncStorage.setItem(
    CALENDAR_AUTO_ADD_PREFERENCE_STORAGE_KEY,
    preference,
  )
}

/** 완료 세션 저장 키에서 sessionId 추출 */
function getSessionIdFromStorageKey(storageKey: string) {
  return storageKey.slice(WORKOUT_SESSION_STORAGE_PREFIX.length)
}

/** 세션 ID 목록 정규화 */
function normalizeStoredWorkoutSessionIds(sessionIds: string[]) {
  return [...new Set(sessionIds)]
    .filter((sessionId) => sessionId.length > 0)
    .sort((a, b) => b.localeCompare(a))
}

/** 완료 세션 ID 인덱스 저장 */
async function saveStoredWorkoutSessionIds(sessionIds: string[]) {
  await AsyncStorage.setItem(
    WORKOUT_SESSION_IDS_STORAGE_KEY,
    JSON.stringify(normalizeStoredWorkoutSessionIds(sessionIds)),
  )
}

/** 완료 세션 ID 인덱스 조회 */
async function getStoredWorkoutSessionIdsFromIndex() {
  const value = await AsyncStorage.getItem(WORKOUT_SESSION_IDS_STORAGE_KEY)
  if (!value) {
    return null
  }

  const parsed = parseJsonOrNull<unknown>(value)
  if (!Array.isArray(parsed) || parsed.some((key) => typeof key !== "string")) {
    return null
  }

  return normalizeStoredWorkoutSessionIds(parsed)
}

/** 완료 세션 ID 인덱스 재생성 */
async function rebuildStoredWorkoutSessionIds() {
  const sessionIds = (await AsyncStorage.getAllKeys())
    .filter((key) => key.startsWith(WORKOUT_SESSION_STORAGE_PREFIX))
    .map(getSessionIdFromStorageKey)

  const normalizedSessionIds = normalizeStoredWorkoutSessionIds(sessionIds)
  await saveStoredWorkoutSessionIds(normalizedSessionIds)
  return normalizedSessionIds
}

/** 완료 세션 ID 인덱스 */
async function getStoredWorkoutSessionIds() {
  const indexedSessionIds = await getStoredWorkoutSessionIdsFromIndex()
  if (indexedSessionIds && hasVerifiedStoredWorkoutSessionIds) {
    return indexedSessionIds
  }

  const rebuiltSessionIds = await rebuildStoredWorkoutSessionIds()
  hasVerifiedStoredWorkoutSessionIds = true
  return rebuiltSessionIds
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

  const parsed = parseJsonOrNull<unknown>(value)
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

/** 완료 세션 최신순 정렬 */
function sortStoredWorkoutSessions(sessions: StoredWorkoutSession[]) {
  return [...sessions].sort((a, b) => {
    const completedAtComparison = b.completedAt.localeCompare(a.completedAt)

    if (completedAtComparison !== 0) {
      return completedAtComparison
    }

    return b.startedAt.localeCompare(a.startedAt)
  })
}

/** 세션 ID 기준 완료 세션 조회 */
async function getStoredWorkoutSessionsByIds(sessionIds: string[]) {
  const sessionEntries = await Promise.all(
    sessionIds.map(async (sessionId) => {
      const value = await AsyncStorage.getItem(
        getWorkoutSessionStorageKey(sessionId),
      )
      return value ? parseStoredWorkoutSession(value) : null
    }),
  )

  return sortStoredWorkoutSessions(
    sessionEntries.filter(
      (session): session is StoredWorkoutSession => session !== null,
    ),
  )
}

/** 날짜 대표 세션 ID */
async function getRepresentativeWorkoutSessionIdByDate(
  dateKey: string,
  sessionIds: string[],
  pendingSession?: StoredWorkoutSession,
) {
  const sessions = await getStoredWorkoutSessionsByIds(sessionIds)
  const candidates = pendingSession
    ? [
        pendingSession,
        ...sessions.filter(
          (session) => session.sessionId !== pendingSession.sessionId,
        ),
      ]
    : sessions

  return (
    sortStoredWorkoutSessions(
      candidates.filter(
        (session) => getLocalDateKeyFromIso(session.startedAt) === dateKey,
      ),
    )[0]?.sessionId ?? null
  )
}

/** 저장된 세션 JSON을 현재 StoredWorkoutSession 형태로 정규화 */
function parseStoredWorkoutSession(value: string) {
  const session = parseJsonOrNull<PersistedWorkoutSession>(value)
  if (
    !session ||
    typeof session.sessionId !== "string" ||
    typeof session.startedAt !== "string" ||
    getTimestampMsFromIso(session.startedAt) === null ||
    typeof session.completedAt !== "string" ||
    getTimestampMsFromIso(session.completedAt) === null ||
    !Array.isArray(session.bodyParts) ||
    typeof session.memo !== "string"
  ) {
    return null
  }

  const bodyParts = session.bodyParts
    .map(normalizeWorkoutBodyPartSet)
    .filter((item): item is WorkoutBodyPartSet => item !== null)

  return {
    ...session,
    bodyParts,
    cardioStartedAt: session.cardioStartedAt ?? null,
    activeKcal: normalizeOptionalMetricCount(session.activeKcal),
    averageHeartRate: normalizeOptionalMetricCount(session.averageHeartRate),
    totalKcal: normalizeOptionalMetricCount(session.totalKcal),
    healthKitWorkoutUUID:
      typeof session.healthKitWorkoutUUID === "string" &&
      session.healthKitWorkoutUUID.length > 0
        ? session.healthKitWorkoutUUID
        : null,
    isDeload: session.isDeload === true,
    routineSubstitution: normalizeRoutineSubstitution(
      session.routineSubstitution,
    ),
    location: normalizeWorkoutLocation(session.location),
  }
}

/** 완료 세션 본문과 날짜별 sessionId 인덱스를 함께 저장 */
export async function saveCompletedWorkoutSession(
  session: StoredWorkoutSession,
) {
  const dateKey = getLocalDateKeyFromIso(session.startedAt)
  if (!dateKey) {
    throw new Error("Invalid workout session start date")
  }

  const storedDateKeys = await getStoredWorkoutDateKeys()
  const storedSessionIds = await getStoredWorkoutSessionIds()
  const nextDateKeys = storedDateKeys.includes(dateKey)
    ? storedDateKeys
    : [...storedDateKeys, dateKey]
  const nextSessionIds = storedSessionIds.includes(session.sessionId)
    ? storedSessionIds
    : [...storedSessionIds, session.sessionId]
  const representativeSessionId = await getRepresentativeWorkoutSessionIdByDate(
    dateKey,
    nextSessionIds,
    session,
  )

  await Promise.all([
    AsyncStorage.setItem(
      getWorkoutSessionStorageKey(session.sessionId),
      JSON.stringify(session),
    ),
    AsyncStorage.setItem(
      getWorkoutDateStorageKey(dateKey),
      representativeSessionId ?? session.sessionId,
    ),
    saveStoredWorkoutDateKeys(nextDateKeys),
    saveStoredWorkoutSessionIds(nextSessionIds),
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

/** 완료 세션에 HealthKit 종료 후 확정된 지표를 병합 */
export async function updateStoredWorkoutHealthKitMetrics(
  sessionId: string,
  metrics: {
    averageHeartRate?: number | null
    healthKitWorkoutUUID?: string | null
  },
) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const nextAverageHeartRate = normalizeOptionalMetricCount(
    metrics.averageHeartRate,
  )
  const nextHealthKitWorkoutUUID =
    typeof metrics.healthKitWorkoutUUID === "string" &&
    metrics.healthKitWorkoutUUID.length > 0
      ? metrics.healthKitWorkoutUUID
      : null

  const nextSession = {
    ...session,
    averageHeartRate: nextAverageHeartRate ?? session.averageHeartRate,
    healthKitWorkoutUUID:
      nextHealthKitWorkoutUUID ?? session.healthKitWorkoutUUID,
  }
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
  if (!dateKey) {
    const storedSessionIds = await getStoredWorkoutSessionIds()
    await Promise.all([
      AsyncStorage.removeItem(getWorkoutSessionStorageKey(sessionId)),
      saveStoredWorkoutSessionIds(
        storedSessionIds.filter((key) => key !== sessionId),
      ),
    ])
    return session
  }

  const storedDateKeys = await getStoredWorkoutDateKeys()
  const storedSessionIds = await getStoredWorkoutSessionIds()
  const nextSessionIds = storedSessionIds.filter((key) => key !== sessionId)
  const representativeSessionId = await getRepresentativeWorkoutSessionIdByDate(
    dateKey,
    nextSessionIds,
  )
  const nextDateKeys = representativeSessionId
    ? storedDateKeys
    : storedDateKeys.filter((key) => key !== dateKey)

  await Promise.all([
    AsyncStorage.removeItem(getWorkoutSessionStorageKey(sessionId)),
    representativeSessionId
      ? AsyncStorage.setItem(
          getWorkoutDateStorageKey(dateKey),
          representativeSessionId,
        )
      : AsyncStorage.removeItem(getWorkoutDateStorageKey(dateKey)),
    saveStoredWorkoutDateKeys(nextDateKeys),
    saveStoredWorkoutSessionIds(nextSessionIds),
  ])

  return session
}

/** 날짜 키로 완료 세션의 sessionId를 조회 */
export async function getStoredWorkoutSessionIdByDate(dateKey: string) {
  const indexedSessionId = await AsyncStorage.getItem(
    getWorkoutDateStorageKey(dateKey),
  )

  if (indexedSessionId) {
    return indexedSessionId
  }

  const representativeSessionId = await getRepresentativeWorkoutSessionIdByDate(
    dateKey,
    await getStoredWorkoutSessionIds(),
  )

  if (!representativeSessionId) {
    return null
  }

  const storedDateKeys = await getStoredWorkoutDateKeys()
  await Promise.all([
    AsyncStorage.setItem(
      getWorkoutDateStorageKey(dateKey),
      representativeSessionId,
    ),
    saveStoredWorkoutDateKeys(
      storedDateKeys.includes(dateKey)
        ? storedDateKeys
        : [...storedDateKeys, dateKey],
    ),
  ])

  return representativeSessionId
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

  const sessions = await getStoredWorkoutSessionsByIds(
    await getStoredWorkoutSessionIds(),
  )

  return sessions
    .filter((session) => {
      const dateKey = getLocalDateKeyFromIso(session.startedAt)
      return dateKey && isDateKeyInRange(dateKey, normalizedStart, normalizedEnd)
    })
    .map((session) => session.sessionId)
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

/** 저장된 완료 세션 전체를 최신순으로 조회 */
export async function getAllStoredWorkoutSessions() {
  return getStoredWorkoutSessionsByIds(await getStoredWorkoutSessionIds())
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
  return (await getAllStoredWorkoutSessions())[0] ?? null
}
