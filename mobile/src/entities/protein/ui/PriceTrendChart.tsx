import { useTranslation } from "react-i18next"

import { useCardColors } from "@/shared/hooks/useCardColors"
import { MetricChart } from "@/shared/ui/MetricChart"
import type { PriceHistoryPoint } from "../model/types"

interface PriceTrendChartProps {
  data: PriceHistoryPoint[]
}

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  const { t } = useTranslation()
  const { accent } = useCardColors()

  // 가격 이력의 순서를 X좌표, 가격을 Y좌표로 변환
  const points = data.map(({ price }, x) => ({ x, y: price }))

  return (
    <MetricChart
      points={points}
      formatValue={(value) => t("protein.detail.chartValue", {
        value: value.toLocaleString(),
      })}
      color={accent}
      height={180}
      startLabel={data[0]?.date ?? ""}
      endLabel={data[data.length - 1]?.date ?? ""}
      accessibilityLabel={t("protein.detail.priceTrend")}
    />
  )
}
