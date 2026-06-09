import type { WorkoutHeartRateSample } from "@/entities/workout-session"

interface ResultAverageHeartRateInput {
  // HealthKit 제공 평균 심박수
  healthKitAverageHeartRate?: number | null
  // 원시 심박수 샘플 목록
  heartRateSamples?: WorkoutHeartRateSample[] | null
  // 저장된 결과 평균 심박수
  storedAverageHeartRate?: number | null
}

// 평균 심박수 정규화
function normalizeAverageHeartRate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null
}

// 결과 평균 심박수 결정
export function resolveResultAverageHeartRate({
  healthKitAverageHeartRate,
  heartRateSamples,
  storedAverageHeartRate,
}: ResultAverageHeartRateInput) {
  const storedAverage = normalizeAverageHeartRate(storedAverageHeartRate)
  if (storedAverage != null) {
    return storedAverage
  }

  const healthKitAverage = normalizeAverageHeartRate(healthKitAverageHeartRate)
  if (healthKitAverage != null) {
    return healthKitAverage
  }

  if (!heartRateSamples || heartRateSamples.length === 0) {
    return null
  }

  return Math.round(
    heartRateSamples.reduce((sum, item) => sum + item.bpm, 0) /
      heartRateSamples.length,
  )
}
