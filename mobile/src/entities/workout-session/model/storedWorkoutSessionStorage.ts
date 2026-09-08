import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import { getWorkoutBodyPartSetKey } from "./bodyPartSet"
import { normalizeOptionalMetricCount } from "./metricNormalization"
import { normalizeHealthKitWorkoutUUID } from "./healthKitNormalization"
import { parseStoredWorkoutSession } from "./storedWorkoutSessionParser"
import type {
  StoredWorkoutSession,
  WorkoutSetCountUpdate,
} from "./types"

const WORKOUT_SESSION_STORAGE_PREFIX = "yb:workout:session:"
const WORKOUT_DATE_STORAGE_PREFIX = "yb:workout:date:"

const getWorkoutSessionStorageKey = (sessionId: string) =>
  `${WORKOUT_SESSION_STORAGE_PREFIX}${sessionId}`

const getWorkoutDateStorageKey = (dateKey: string) =>
  `${WORKOUT_DATE_STORAGE_PREFIX}${dateKey}`

/** 실제 세션 저장 키를 스캔해 최신순 sessionId 목록 조회 */
async function getStoredWorkoutSessionIds() {
  return (await AsyncStorage.getAllKeys())
    .filter((key) => key.startsWith(WORKOUT_SESSION_STORAGE_PREFIX))
    .map((key) => key.slice(WORKOUT_SESSION_STORAGE_PREFIX.length))
    .filter((sessionId) => sessionId.length > 0)
}

/** 완료 세션 최신순 정렬 */
function sortStoredWorkoutSessions(sessions: StoredWorkoutSession[]) {
  return [...sessions].sort((left, right) => {
    const completedAtComparison = right.completedAt.localeCompare(
      left.completedAt,
    )

    return completedAtComparison !== 0
      ? completedAtComparison
      : right.startedAt.localeCompare(left.startedAt)
  })
}

/** sessionId 목록에 해당하는 유효한 완료 세션 조회 */
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

/** 해당 날짜의 가장 최근 완료 세션 ID 계산 */
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

/** 완료 세션 본문과 날짜별 대표 sessionId를 함께 저장 */
export async function saveCompletedWorkoutSession(
  session: StoredWorkoutSession,
) {
  const dateKey = getLocalDateKeyFromIso(session.startedAt)
  if (!dateKey) {
    throw new Error("Invalid workout session start date")
  }

  const storedSessionIds = await getStoredWorkoutSessionIds()
  const sessionIds = storedSessionIds.includes(session.sessionId)
    ? storedSessionIds
    : [...storedSessionIds, session.sessionId]
  const representativeSessionId = await getRepresentativeWorkoutSessionIdByDate(
    dateKey,
    sessionIds,
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
  ])
}

/** sessionId로 완료 세션 하나 조회 */
export async function getStoredWorkoutSession(sessionId: string) {
  const value = await AsyncStorage.getItem(
    getWorkoutSessionStorageKey(sessionId),
  )
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

/** 현재 저장된 운동 항목 구조를 유지한 채 세트 수만 수정 */
export async function updateStoredWorkoutSetCounts(
  sessionId: string,
  updates: WorkoutSetCountUpdate[],
) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session || !Array.isArray(updates)) {
    return null
  }

  const currentKeys = session.bodyParts.map(getWorkoutBodyPartSetKey)
  const updateKeys = updates.map((update) => update?.key)
  const hasInvalidUpdate = updates.some(
    (update) =>
      !update ||
      typeof update.key !== "string" ||
      typeof update.setCount !== "number" ||
      !Number.isFinite(update.setCount),
  )

  if (
    hasInvalidUpdate ||
    new Set(currentKeys).size !== currentKeys.length ||
    new Set(updateKeys).size !== updateKeys.length ||
    currentKeys.length !== updateKeys.length ||
    currentKeys.some((key) => !updateKeys.includes(key))
  ) {
    return null
  }

  const setCountByKey = new Map(
    updates.map((update) => [
      update.key,
      Math.max(1, Math.round(update.setCount)),
    ]),
  )
  const nextSession = {
    ...session,
    bodyParts: session.bodyParts.map((item) => ({
      ...item,
      setCount:
        setCountByKey.get(getWorkoutBodyPartSetKey(item)) ?? item.setCount,
    })),
  }

  await saveCompletedWorkoutSession(nextSession)
  return nextSession
}

/** 캘린더 등록 뒤 완료 세션에 네이티브 이벤트 ID 병합 */
export async function updateStoredWorkoutCalendarEventId(
  sessionId: string,
  calendarEventId: string,
) {
  if (!calendarEventId) {
    return null
  }

  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const nextSession = { ...session, calendarEventId }
  await saveCompletedWorkoutSession(nextSession)
  return nextSession
}

/** 완료 세션에 HealthKit 종료 후 확정된 지표 병합 */
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
  const nextHealthKitWorkoutUUID = normalizeHealthKitWorkoutUUID(
    metrics.healthKitWorkoutUUID,
  )

  const nextSession = {
    ...session,
    averageHeartRate: nextAverageHeartRate ?? session.averageHeartRate,
    healthKitWorkoutUUID:
      nextHealthKitWorkoutUUID ?? session.healthKitWorkoutUUID,
  }
  await saveCompletedWorkoutSession(nextSession)
  return nextSession
}

/** 완료 세션 본문과 날짜별 대표 sessionId를 함께 삭제 */
export async function deleteStoredWorkoutSession(sessionId: string) {
  const session = await getStoredWorkoutSession(sessionId)
  if (!session) {
    return null
  }

  const dateKey = getLocalDateKeyFromIso(session.startedAt)
  if (!dateKey) {
    await AsyncStorage.removeItem(getWorkoutSessionStorageKey(sessionId))
    return session
  }

  const sessionIds = (await getStoredWorkoutSessionIds()).filter(
    (candidate) => candidate !== sessionId,
  )
  const representativeSessionId = await getRepresentativeWorkoutSessionIdByDate(
    dateKey,
    sessionIds,
  )

  await Promise.all([
    AsyncStorage.removeItem(getWorkoutSessionStorageKey(sessionId)),
    representativeSessionId
      ? AsyncStorage.setItem(
          getWorkoutDateStorageKey(dateKey),
          representativeSessionId,
        )
      : AsyncStorage.removeItem(getWorkoutDateStorageKey(dateKey)),
  ])

  return session
}

/** 날짜 키로 완료 세션의 대표 sessionId 조회 */
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

  await AsyncStorage.setItem(
    getWorkoutDateStorageKey(dateKey),
    representativeSessionId,
  )
  return representativeSessionId
}

/** 완료 세션을 날짜 키 범위 내에서 최신순으로 조회 */
export async function getStoredWorkoutSessionsInRange(
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

  return sessions.filter((session) => {
    const dateKey = getLocalDateKeyFromIso(session.startedAt)
    return dateKey && dateKey >= normalizedStart && dateKey <= normalizedEnd
  })
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

/** 저장된 완료 세션 중 가장 최신 세션 조회 */
export async function getLatestStoredWorkoutSession() {
  return (await getAllStoredWorkoutSessions())[0] ?? null
}
