import { useState } from "react"
import { Text, View } from "react-native"
import { Path } from "@shopify/react-native-skia"
import { CartesianChart } from "victory-native"
import { useTranslation } from "react-i18next"

import { useCardColors } from "@/shared/hooks/useCardColors"
import { buildLinePath } from "@/shared/lib/skiaChartPaths"
import { GlassSurface } from "@/shared/ui/GlassSurface"
import type { PriceHistoryPoint } from "../model/types"

interface PriceTrendChartProps {
  data: PriceHistoryPoint[]
}

const CHART_H = 180

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  const { t } = useTranslation()
  const { accent } = useCardColors()

  const [chartW, setChartW] = useState(0)

  const safeData = data.flatMap((point) => {
    const date = typeof point.date === "string" ? point.date.trim() : ""
    if (!date || !Number.isFinite(point.price)) return []
    return [{ date, price: point.price }]
  })

  if (safeData.length <= 1) return null

  const lineColor = accent

  const prices = safeData.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const chartData = safeData.map((d, i) => ({ x: i, y: d.price }))

  const priceRange = maxPrice - minPrice || 1
  const domainMin = minPrice - priceRange * 0.1
  const domainMax = maxPrice + priceRange * 0.1

  const firstDate = safeData[0].date
  const lastDate = safeData[safeData.length - 1].date

  return (
    <GlassSurface cornerRadius={20} paddingSize={20}>
      <View className="flex-row items-center mb-yb-2 gap-yb-3">
        <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
          {t("protein.detail.chartHigh", { value: maxPrice.toLocaleString() })}
        </Text>
        <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
          {t("protein.detail.chartLow", { value: minPrice.toLocaleString() })}
        </Text>
      </View>

      <View
        style={{ height: CHART_H }}
        onLayout={(e) => setChartW(e.nativeEvent.layout.width)}
      >
        {chartW > 0 && (
          <CartesianChart
            data={chartData}
            xKey="x"
            yKeys={["y"]}
            domain={{ y: [domainMin, domainMax] }}
            padding={{ left: 0, right: 0, top: 8, bottom: 8 }}
            xAxis={{ tickCount: 0, lineWidth: 0 }}
            yAxis={[{ tickCount: 0, lineWidth: 0 }]}
          >
            {({ points, chartBounds }) => {
              const { top, bottom, left, right } = chartBounds
              if (right <= left || bottom <= top) return null

              const linePath = buildLinePath(points.y)
              if (!linePath) return null

              return (
                <Path
                  path={linePath}
                  color={lineColor}
                  strokeWidth={2}
                  style="stroke"
                />
              )
            }}
          </CartesianChart>
        )}
      </View>

      <View className="flex-row justify-between mt-yb-1">
        <Text className="text-yb-fg-secondary text-yb-caption">{firstDate}</Text>
        <Text className="text-yb-fg-secondary text-yb-caption">{lastDate}</Text>
      </View>
    </GlassSurface>
  )
}
