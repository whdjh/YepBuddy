import { Platform } from "react-native"
import { useTranslation } from "react-i18next"

import type { WorkoutHeartRateSample } from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { formatTime } from "@/shared/lib/format"
import { MetricChart } from "@/shared/ui/MetricChart"

interface HeartRateChartProps {
  samples: readonly WorkoutHeartRateSample[]
  workoutStartDate: string
  workoutEndDate: string
}

export function HeartRateChart({
  samples,
  workoutStartDate,
  workoutEndDate,
}: HeartRateChartProps) {
  const { t, i18n } = useTranslation()
  const heartColor = useResolvedColorToken(semanticColorTokens.heart)

  if (Platform.OS !== "ios") return null

  // 운동 전체 시간 대비 측정 시점의 비율을 X좌표로 변환
  const start = Date.parse(workoutStartDate)
  const duration = Date.parse(workoutEndDate) - start
  const points = samples.map((sample) => ({
    x: (Date.parse(sample.startDate) - start) / duration,
    y: sample.bpm,
  }))

  return (
    <MetricChart
      points={points}
      xDomain={[0, 1]}
      formatValue={(value) => t("workout.result.heartRateChartValue", {
        value: Math.round(value).toLocaleString(i18n.resolvedLanguage),
      })}
      color={heartColor}
      height={160}
      area
      guides
      showAverage
      startLabel={t("workout.result.heartRateChartStart", {
        time: formatTime(workoutStartDate),
      })}
      endLabel={t("workout.result.heartRateChartEnd", {
        time: formatTime(workoutEndDate),
      })}
      accessibilityLabel={t("workout.result.heartRateChart")}
    />
  )
}
