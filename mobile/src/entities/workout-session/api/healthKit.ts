import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import AppleHealthKit, {
  type HealthValue,
  type HKWorkoutQueriedSampleType,
} from "react-native-health"
import { getIsoAfterHours, getTimeDistanceMs } from "@/shared/lib/date"
import type {
  WorkoutHealthKitDetail,
  WorkoutHeartRateSample,
  WorkoutHealthKitWorkout,
  WorkoutLiveStats,
} from "../model/types"
import { healthKitFallbackProvider } from "./healthKitFallbackProvider"
import {
  discardIphoneLiveWorkout,
  iphoneLiveWorkoutProvider,
} from "./iphoneLiveWorkoutProvider"

const HEALTH_PERMISSIONS = {
  permissions: {
    read: ["HeartRate", "ActiveEnergyBurned", "BasalEnergyBurned", "Workout"],
    write: ["Workout"],
  },
} as const

const HEALTH_KIT_ACCESS_STORAGE_KEY = "yb:healthkit:access"

type HealthKitAccessState = "enabled" | "denied"

let healthKitInitialized = false
let healthKitAccessState: HealthKitAccessState | null | undefined

/** 현재 런타임에서 HealthKit 사용 가능 여부를 판단 */
function isHealthKitAvailable() {
  return Platform.OS === "ios"
}

/** 네이티브 브리지에 특정 HealthKit 메서드가 연결됐는지 확인 */
function hasHealthKitMethod(name: keyof typeof AppleHealthKit) {
  return typeof AppleHealthKit?.[name] === "function"
}

/** HealthKit 접근 상태 메모리/스토리지 조회 */
async function getHealthKitAccessState() {
  if (healthKitAccessState !== undefined) {
    return healthKitAccessState
  }

  const stored = await AsyncStorage.getItem(HEALTH_KIT_ACCESS_STORAGE_KEY)
  healthKitAccessState =
    stored === "enabled" || stored === "denied" ? stored : null
  return healthKitAccessState
}

/** HealthKit 접근 상태 메모리/스토리지 저장 */
async function saveHealthKitAccessState(state: HealthKitAccessState) {
  healthKitAccessState = state
  await AsyncStorage.setItem(HEALTH_KIT_ACCESS_STORAGE_KEY, state)
}

/** 지정한 기간의 workout 샘플 목록을 읽음 */
async function getWorkoutSamples(params: {
  endDate: string
  startDate: string
}) {
  if (!hasHealthKitMethod("getAnchoredWorkouts")) {
    return []
  }

  return new Promise<HKWorkoutQueriedSampleType[]>((resolve) => {
    AppleHealthKit.getAnchoredWorkouts(
      {
        endDate: params.endDate,
        startDate: params.startDate,
        type: "Workout",
      } as never,
      (
        error: { message?: string } | null,
        results?: { data?: HKWorkoutQueriedSampleType[] },
      ) => {
        if (error) {
          resolve([])
          return
        }

        resolve(results?.data ?? [])
      },
    )
  })
}

/** 날짜 키를 해당 날짜의 로컬 시작/끝 ISO 범위로 변환 */
function getLocalDateBounds(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null
  }

  const [year, month, day] = dateKey.split("-").map((value) => Number(value))
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null
  }

  const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
  const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null
  }
  if (
    startDate.getFullYear() !== year ||
    startDate.getMonth() !== month - 1 ||
    startDate.getDate() !== day
  ) {
    return null
  }

  return {
    endDate: endDate.toISOString(),
    startDate: startDate.toISOString(),
  }
}

/** 연/월을 해당 월의 로컬 시작/끝 ISO 범위로 변환 */
function getLocalMonthBounds(year: number, month: number) {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null
  }

  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null
  }

  return {
    endDate: endDate.toISOString(),
    startDate: startDate.toISOString(),
  }
}

/** 지정한 운동 구간의 심박수 샘플을 읽어 앱 타입으로 정규화 */
async function getHeartRateSamples(params: {
  endDate: string
  startDate: string
}) {
  if (!hasHealthKitMethod("getHeartRateSamples")) {
    return []
  }

  return new Promise<WorkoutHeartRateSample[]>((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      {
        ascending: true,
        endDate: params.endDate,
        startDate: params.startDate,
        unit: "bpm",
      } as never,
      (error: unknown, results?: HealthValue[]) => {
        if (error) {
          resolve([])
          return
        }

        const heartRateSamples = (results ?? []).flatMap((sample) => {
          if (!Number.isFinite(sample.value)) {
            return []
          }

          return [
            {
              bpm: Math.round(sample.value),
              endDate: sample.endDate,
              startDate: sample.startDate,
            },
          ]
        })
        resolve(heartRateSamples)
      },
    )
  })
}

/** HealthKit 네이티브 초기화/권한 요청을 실제로 실행하고 결과를 캐시 */
async function authorizeHealthKit() {
  if (!isHealthKitAvailable() || healthKitInitialized) {
    return healthKitInitialized
  }

  // 시뮬레이터나 현재 런타임에서 네이티브 메서드가 비어 있으면 false로 처리
  if (!hasHealthKitMethod("initHealthKit")) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    AppleHealthKit.initHealthKit(
      HEALTH_PERMISSIONS as never,
      (error: unknown) => {
        healthKitInitialized = !error
        resolve(!error)
      },
    )
  })
}

/** HealthKit 초기화 상태 확인 및 선택적 권한 요청 */
async function ensureHealthKitReady(options?: { prompt?: boolean }) {
  if (healthKitInitialized) {
    return true
  }

  if (options?.prompt) {
    return requestHealthKitAccess()
  }

  const accessState = await getHealthKitAccessState()
  if (accessState !== "enabled") {
    return false
  }

  return authorizeHealthKit()
}

/** 사용자가 운동 시작 등 명시적 행동을 했을 때만 HealthKit 연결을 요청 */
export async function requestHealthKitAccess() {
  const ready = await authorizeHealthKit()
  await saveHealthKitAccessState(ready ? "enabled" : "denied")
  return ready
}

/** 운동 시작 시점에 HealthKit 권한/세션 사용 준비 */
export async function startWorkoutSession() {
  if (iphoneLiveWorkoutProvider.isAvailable()) {
    const stats = await iphoneLiveWorkoutProvider.start()
    if (stats.status !== "error") {
      await saveHealthKitAccessState("enabled").catch(() => undefined)
    }
    return stats
  }

  const ready = await ensureHealthKitReady({ prompt: true })
  if (!ready) {
    return iphoneLiveWorkoutProvider.start()
  }

  return healthKitFallbackProvider.read()
}

/** 저장하지 않고 운동을 취소할 때 HealthKit live session도 종료 */
export async function discardWorkoutSession() {
  return discardIphoneLiveWorkout()
}

/** 운동 일시정지를 HealthKit live session에도 반영 */
export async function pauseWorkoutSession() {
  return iphoneLiveWorkoutProvider.pause()
}

/** 운동 재개를 HealthKit live session에도 반영 */
export async function resumeWorkoutSession() {
  return iphoneLiveWorkoutProvider.resume()
}

/** 운동 종료 시 완료 구간을 HealthKit workout 하나로 저장 */
export async function endWorkoutSession(params: {
  startedAt: string
  endedAt: string
  activeKcal: number
  totalKcal: number
}) {
  const endedStats = await iphoneLiveWorkoutProvider.end()

  if (endedStats.status === "ended") {
    return true
  }

  const ready = await ensureHealthKitReady()
  if (!ready || !hasHealthKitMethod("saveWorkout")) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    AppleHealthKit.saveWorkout(
      {
        startDate: params.startedAt,
        endDate: params.endedAt,
        type: "TraditionalStrengthTraining",
        energyBurned: params.activeKcal || params.totalKcal || 0,
      } as never,
      (error: unknown) => resolve(!error),
    )
  })
}

/** 최근 심박 샘플을 읽어 라이브 운동 수치 형태로 정리 */
export async function readLiveWorkoutStats(params?: {
  startDate?: string
}): Promise<WorkoutLiveStats> {
  const nativeStats = await iphoneLiveWorkoutProvider.read(params)
  if (nativeStats.status === "live" || nativeStats.status === "paused") {
    return nativeStats
  }

  const ready = await ensureHealthKitReady()
  if (!ready) {
    return nativeStats
  }

  const sampledStats = await healthKitFallbackProvider.read(params)
  if (nativeStats.heartRate != null || nativeStats.activeKcal > 0) {
    return nativeStats
  }

  return sampledStats
}

/** live workout stats 이벤트 구독 */
export function subscribeLiveWorkoutStats(
  listener: (stats: WorkoutLiveStats) => void,
) {
  return iphoneLiveWorkoutProvider.subscribe(listener)
}

/** sessionId 근처의 HealthKit workout 하나를 찾아 결과 화면용 상세로 변환 */
export async function getWorkoutDetail(
  sessionId: string,
): Promise<WorkoutHealthKitDetail | null> {
  const ready = await ensureHealthKitReady()
  if (!ready) {
    return null
  }

  const startedAtMs = new Date(sessionId).getTime()
  if (Number.isNaN(startedAtMs)) {
    return null
  }

  const workoutSamples = await getWorkoutSamples({
    endDate: getIsoAfterHours(sessionId, 24),
    startDate: sessionId,
  })

  const workout = workoutSamples
    .filter((sample) => Boolean(sample.start))
    .sort(
      (left, right) =>
        getTimeDistanceMs(left.start, sessionId) -
        getTimeDistanceMs(right.start, sessionId),
    )[0]

  if (!workout) {
    return null
  }

  const heartRateSamples = await getHeartRateSamples({
    endDate: workout.end,
    startDate: workout.start,
  })

  return {
    activeKcal:
      typeof workout.calories === "number" ? Math.round(workout.calories) : null,
    duration:
      typeof workout.duration === "number" ? Math.round(workout.duration) : null,
    heartRateSamples,
    totalKcal:
      typeof workout.calories === "number" ? Math.round(workout.calories) : null,
  }
}

/** 특정 날짜의 workout 목록을 요약 카드에서 쓰기 쉬운 형태로 반환 */
export async function getWorkoutSummariesForDate(
  dateKey: string,
): Promise<WorkoutHealthKitWorkout[]> {
  const ready = await ensureHealthKitReady()
  if (!ready) {
    return []
  }

  const bounds = getLocalDateBounds(dateKey)
  if (!bounds) {
    return []
  }

  const { startDate, endDate } = bounds
  const workoutSamples = await getWorkoutSamples({ endDate, startDate })

  return workoutSamples
    .filter((sample) => Boolean(sample.start))
    .map((sample) => ({
      startDate: sample.start,
      endDate: sample.end,
      duration:
        typeof sample.duration === "number" ? Math.round(sample.duration) : 0,
      kcal:
        typeof sample.calories === "number" ? Math.round(sample.calories) : 0,
    }))
}

/** 특정 월의 workout 목록을 세션 목록 화면에서 쓰기 쉬운 형태로 반환 */
export async function getWorkoutSummariesForMonth(
  year: number,
  month: number,
): Promise<WorkoutHealthKitWorkout[]> {
  const ready = await ensureHealthKitReady()
  if (!ready) {
    return []
  }

  const bounds = getLocalMonthBounds(year, month)
  if (!bounds) {
    return []
  }

  const { startDate, endDate } = bounds
  const workoutSamples = await getWorkoutSamples({ endDate, startDate })

  return workoutSamples
    .filter((sample) => Boolean(sample.start))
    .map((sample) => ({
      startDate: sample.start,
      endDate: sample.end,
      duration:
        typeof sample.duration === "number" ? Math.round(sample.duration) : 0,
      kcal:
        typeof sample.calories === "number" ? Math.round(sample.calories) : 0,
    }))
}
