import { Platform } from "react-native"
import { useTranslation } from "react-i18next"

import type { WorkoutHeartRateSample } from "@/entities/workout-session"
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

  if (Platform.OS !== "ios") return null

  // 운동 전체 시간 대비 측정 시점의 비율을 X좌표로 변환
  const start = Date.parse(workoutStartDate)
  const duration = Date.parse(workoutEndDate) - start
  const points = samples.map((sample) => ({
    x: (Date.parse(sample.startDate) - start) / duration,
    y: sample.bpm,
  }))

  // 선택한 X좌표를 초 단위의 실제 측정 시각으로 변환
  const formatXValue = (x: number) => {
    const date = new Date(start + x * duration)
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((value) => String(value).padStart(2, "0"))
      .join(":")
  }

  return (
    <MetricChart
      points={points}
      xDomain={[0, 1]}
      showAverage
      formatXValue={formatXValue}
      formatValue={(value) => t("workout.result.heartRateChartValue", {
        value: Math.round(value).toLocaleString(i18n.resolvedLanguage),
      })}
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
