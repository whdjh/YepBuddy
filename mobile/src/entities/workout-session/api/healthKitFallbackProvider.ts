import AppleHealthKit, { type HealthValue } from "react-native-health"
import type {
  WorkoutHeartRateSample,
  WorkoutLiveStats,
} from "../model/types"
import {
  normalizeWorkoutLiveStats,
  type WorkoutMetricProvider,
} from "./workoutMetricsProvider"

// react-native-health 네이티브 메서드 존재 여부
function hasHealthKitMethod(name: keyof typeof AppleHealthKit) {
  return typeof AppleHealthKit?.[name] === "function"
}

// HealthKit 심박 샘플 조회 fallback
async function getHeartRateSamples(params: {
  endDate: string
  startDate: string
}) {
  // 미지원 런타임 빈 샘플 처리
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
          // HealthKit 조회 오류 빈 샘플 처리
          resolve([])
          return
        }

        const heartRateSamples = (results ?? []).flatMap((sample) => {
          // 비정상 심박 값 제외
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

// 활성/기초 칼로리 샘플 조회 공통 헬퍼
async function getEnergySamples(
  methodName: "getActiveEnergyBurned" | "getBasalEnergyBurned",
  params: {
    endDate: string
    startDate: string
  },
) {
  if (!hasHealthKitMethod(methodName)) {
    return []
  }

  return new Promise<HealthValue[]>((resolve) => {
    AppleHealthKit[methodName](
      {
        ascending: true,
        endDate: params.endDate,
        startDate: params.startDate,
        unit: "kcal",
      } as never,
      (error: unknown, results?: HealthValue[]) => {
        if (error) {
          // HealthKit 조회 오류 빈 샘플 처리
          resolve([])
          return
        }

        resolve(results ?? [])
      },
    )
  })
}

// 유효한 HealthValue 양수 누적합
function sumHealthValues(samples: HealthValue[]) {
  return Math.round(
    samples.reduce(
      (sum, sample) =>
        Number.isFinite(sample.value) ? sum + Math.max(0, sample.value) : sum,
      0,
    ),
  )
}

// 최근 HealthKit 샘플 기반 live stats fallback
async function readSampledLiveStats(params?: {
  startDate?: string
}): Promise<WorkoutLiveStats> {
  const endDate = new Date().toISOString()
  // startDate 미전달 시 최근 5분 조회 범위
  const startDate =
    params?.startDate ?? new Date(Date.now() - 5 * 60 * 1000).toISOString()

  // 심박/활동/기초 에너지 병렬 조회
  const [heartRateSamples, activeEnergySamples, basalEnergySamples] =
    await Promise.all([
      getHeartRateSamples({ endDate, startDate }),
      getEnergySamples("getActiveEnergyBurned", { endDate, startDate }),
      getEnergySamples("getBasalEnergyBurned", { endDate, startDate }),
    ])

  const latestHeartRate = heartRateSamples.at(-1)?.bpm ?? null
  const activeKcal = sumHealthValues(activeEnergySamples)
  const basalKcal = sumHealthValues(basalEnergySamples)

  // live stats 표준 payload 정규화
  return normalizeWorkoutLiveStats({
    heartRate: latestHeartRate,
    activeKcal,
    totalKcal: activeKcal + basalKcal,
    source: "healthKitFallback",
    status: latestHeartRate == null && activeKcal === 0 ? "waitingSensor" : "live",
    updatedAt: new Date().toISOString(),
    errorCode: latestHeartRate == null ? "heart_rate_not_available" : null,
  })
}

// WorkoutMetricProvider fallback 구현체
export const healthKitFallbackProvider: Pick<
  WorkoutMetricProvider,
  "source" | "read"
> = {
  source: "healthKitFallback",
  read: readSampledLiveStats,
}
