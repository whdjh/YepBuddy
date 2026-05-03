import { useState } from "react"
import { Text, View, useColorScheme } from "react-native"
import { Path, Skia } from "@shopify/react-native-skia"
import { CartesianChart } from "victory-native"
import { useTranslation } from "react-i18next"

import type { PriceHistoryPoint } from "../model/types"

interface PriceTrendChartProps {
  data: PriceHistoryPoint[]
}

const CHART_H = 180
const buildLinePath = (points: { x: number; y: number | null | undefined }[]) => {
  const validPoints = points.filter((point) => typeof point.y === "number")
  if (validPoints.length === 0) return null

  const builder = Skia.PathBuilder.Make()
  builder.moveTo(validPoints[0].x, validPoints[0].y as number)

  for (const point of validPoints.slice(1)) {
    builder.lineTo(point.x, point.y as number)
  }

  return builder.build()
}

export function PriceTrendChart({ data }: PriceTrendChartProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"

  const [chartW, setChartW] = useState(0)

  if (data.length <= 1) return null

  const lineColor = isDark ? "#D4883A" : "#9B7E56"
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)"
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"

  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const chartData = data.map((d, i) => ({ x: i, y: d.price }))

  const priceRange = maxPrice - minPrice || 1
  const domainMin = minPrice - priceRange * 0.1
  const domainMax = maxPrice + priceRange * 0.1

  const firstDate = data[0].date
  const lastDate = data[data.length - 1].date

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: cardBorder,
        padding: 20,
        overflow: "hidden",
      }}
    >
      {/* Y축 */}
      <View className="flex-row items-center mb-yb-2 gap-yb-3">
        <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
          {t("protein.detail.chartHigh", { value: maxPrice.toLocaleString() })}
        </Text>
        <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
          {t("protein.detail.chartLow", { value: minPrice.toLocaleString() })}
        </Text>
      </View>

      {/* 차트 */}
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
            {({ points }) => {
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

      {/* X축 */}
      <View className="flex-row justify-between mt-yb-1">
        <Text className="text-yb-fg-secondary text-yb-caption">{firstDate}</Text>
        <Text className="text-yb-fg-secondary text-yb-caption">{lastDate}</Text>
      </View>
    </View>
  )
}
