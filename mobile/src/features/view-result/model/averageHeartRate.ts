import type { WorkoutHeartRateSample } from "@/entities/workout-session"

interface ResultAverageHeartRateInput {
  // HealthKit 제공 평균 심박수
  healthKitAverageHeartRate?: number | null
  // 선택된 workout에서 조회하고 양수 유한 BPM을 확인한 심박수 샘플 목록
  heartRateSamples?: WorkoutHeartRateSample[] | null
  // 저장된 결과 평균 심박수
  storedAverageHeartRate?: number | null
}

// 평균 심박수 정규화
function normalizeAverageHeartRate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : null
}

// 결과 평균 심박수 결정
export function resolveResultAverageHeartRate({
  healthKitAverageHeartRate,
  heartRateSamples,
  storedAverageHeartRate,
}: ResultAverageHeartRateInput) {
  if (heartRateSamples && heartRateSamples.length > 0) {
    return Math.round(
      heartRateSamples.reduce((sum, item) => sum + item.bpm, 0) /
        heartRateSamples.length,
    )
  }

  const storedAverage = normalizeAverageHeartRate(storedAverageHeartRate)
  if (storedAverage != null) {
    return storedAverage
  }

  const healthKitAverage = normalizeAverageHeartRate(healthKitAverageHeartRate)
  if (healthKitAverage != null) {
    return healthKitAverage
  }

  return null
}
