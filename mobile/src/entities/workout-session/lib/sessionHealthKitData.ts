import {
  getWorkoutDetail,
  getWorkoutSummariesForDate,
  getWorkoutSummariesForMonth,
} from "../api/healthKit"
import {
  getStoredWorkoutSession,
  getStoredWorkoutSessionIdByDate,
  getStoredWorkoutSessionsForMonth,
} from "../model/storedWorkoutSessionStorage"
import type {
  StoredWorkoutSession,
  WorkoutHealthKitDetail,
  WorkoutHealthKitWorkout,
} from "../model/types"
import {
  getYearMonthFromIso,
  getYearMonthKey,
  type YearMonth,
} from "@/shared/lib/date"
import {
  findWorkoutSummaryForSession,
  getWorkoutSessionKcal,
} from "./sessionWorkoutMatching"

/** 날짜별 요약 화면에서 저장 세션과 HealthKit 운동 요약을 함께 다루기 위한 데이터 */
export interface WorkoutSessionSummaryData {
  /** 해당 날짜의 대표 저장 운동 세션 */
  storedSession: StoredWorkoutSession | null
  /** 해당 날짜에 HealthKit에서 조회한 운동 summary 목록 */
  workouts: WorkoutHealthKitWorkout[]
}

/** 월별 요약 화면에서 저장 세션 목록과 HealthKit 운동 요약을 함께 다루기 위한 데이터 */
export interface WorkoutSessionMonthSummaryData {
  /** 해당 월에 저장된 운동 세션 목록 */
  storedSessions: StoredWorkoutSession[]
  /** 해당 월에 HealthKit에서 조회한 운동 summary 목록 */
  workouts: WorkoutHealthKitWorkout[]
}

/** 결과 detail 화면에서 저장 세션과 HealthKit 상세 운동 정보를 함께 다루기 위한 데이터 */
export interface WorkoutSessionDetailData {
  /** sessionId로 조회한 저장 운동 세션 */
  storedSession: StoredWorkoutSession | null
  /** sessionId로 조회한 HealthKit 운동 상세 정보 */
  healthKitDetail: WorkoutHealthKitDetail | null
}

/** 날짜 대표 저장 세션을 조회 */
async function getStoredWorkoutSessionForDate(dateKey: string) {
  const sessionId = await getStoredWorkoutSessionIdByDate(dateKey)
  return sessionId ? getStoredWorkoutSession(sessionId) : null
}

/** 여러 저장 세션이 속한 연월 목록을 중복 없이 반환 */
function getUniqueSessionYearMonths(
  sessions: Pick<StoredWorkoutSession, "startedAt">[],
) {
  const entriesByKey = new Map<string, YearMonth>()

  sessions.forEach((session) => {
    const yearMonth = getYearMonthFromIso(session.startedAt)
    if (!yearMonth) {
      return
    }

    entriesByKey.set(getYearMonthKey(yearMonth), yearMonth)
  })

  return [...entriesByKey.values()]
}

/** 날짜별 화면에 필요한 대표 저장 세션과 같은 날짜 HealthKit workout summary를 함께 조회 */
export async function getWorkoutSessionSummaryDataForDate(
  dateKey: string,
): Promise<WorkoutSessionSummaryData> {
  const [storedSession, workouts] = await Promise.all([
    getStoredWorkoutSessionForDate(dateKey),
    getWorkoutSummariesForDate(dateKey),
  ])

  return { storedSession, workouts }
}

/** 월별 화면에 필요한 저장 세션 목록과 같은 월 HealthKit workout summary를 함께 조회 */
export async function getWorkoutSessionSummaryDataForMonth(
  year: number,
  month: number,
): Promise<WorkoutSessionMonthSummaryData> {
  const [storedSessions, workouts] = await Promise.all([
    getStoredWorkoutSessionsForMonth(year, month),
    getWorkoutSummariesForMonth(year, month),
  ])

  return { storedSessions, workouts }
}

/** 결과 detail 화면에 필요한 저장 세션과 HealthKit workout detail을 sessionId 기준으로 함께 조회 */
export async function getWorkoutSessionDetailData(
  sessionId: string,
): Promise<WorkoutSessionDetailData> {
  if (!sessionId) {
    return {
      healthKitDetail: null,
      storedSession: null,
    }
  }

  const [storedSession, healthKitDetail] = await Promise.all([
    getStoredWorkoutSession(sessionId),
    getWorkoutDetail(sessionId),
  ])

  return { healthKitDetail, storedSession }
}

/** 여러 저장 세션이 속한 연월만 중복 제거한 뒤 해당 월들의 HealthKit workout summary를 조회 */
export async function getWorkoutSummariesForSessions(
  sessions: Pick<StoredWorkoutSession, "startedAt">[],
): Promise<WorkoutHealthKitWorkout[]> {
  const summariesByMonth = await Promise.all(
    getUniqueSessionYearMonths(sessions).map(({ year, month }) =>
      getWorkoutSummariesForMonth(year, month),
    ),
  )

  return summariesByMonth.flat()
}

/** 저장 세션과 HealthKit summary 목록을 매칭해 화면에 표시할 활동 kcal 값을 결정 */
export function getWorkoutSessionKcalFromSummaries(
  session: Pick<StoredWorkoutSession, "activeKcal" | "sessionId" | "startedAt">,
  workouts: WorkoutHealthKitWorkout[],
) {
  const workout = findWorkoutSummaryForSession(session, workouts)

  return getWorkoutSessionKcal({
    healthKitKcal: workout?.kcal,
    storedActiveKcal: session.activeKcal,
  })
}

/** 결과 detail 화면의 활동 kcal 표시값을 HealthKit detail 값 우선으로 결정 */
export function getWorkoutSessionDetailActiveKcal(input: {
  healthKitDetail: Pick<WorkoutHealthKitDetail, "activeKcal"> | null | undefined
  storedSession: Pick<StoredWorkoutSession, "activeKcal"> | null | undefined
}) {
  return (
    input.healthKitDetail?.activeKcal ?? input.storedSession?.activeKcal ?? null
  )
}
