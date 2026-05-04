import { useState } from "react"
import { Text, View, useColorScheme } from "react-native"
import { CartesianChart } from "victory-native"
import { DashPathEffect, Path, vec, Line as SkiaLine } from "@shopify/react-native-skia"

import { buildLinePath, buildAreaPath } from "../../../shared/lib/skiaChartPaths"

interface HeartRateDataPoint {
  time: number
  bpm: number
}

interface HeartRateChartProps {
  data: HeartRateDataPoint[]
  avgBpm: number | null
  startTimeLabel: string
  endTimeLabel: string
}

const CHART_H = 160

export function HeartRateChart({
  data,
  avgBpm,
  startTimeLabel,
  endTimeLabel,
}: HeartRateChartProps) {
  const isDark = useColorScheme() === "dark"

  const [chartW, setChartW] = useState(0)

  if (data.length === 0) return null

  const lineColor = isDark ? "#E8734E" : "#C4652E"
  const fillColor = isDark ? "rgba(232,115,78,0.15)" : "rgba(196,101,46,0.12)"
  const labelColor = isDark ? "#8C7E6E" : "#876B45"
  const dashColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)"
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"

  const bpmValues = data.map((d) => d.bpm)
  const globalMin = Math.min(...bpmValues)
  const globalMax = Math.max(...bpmValues)

  const chartData = data.map((d, i) => ({ x: i, y: d.bpm }))

  const bpmRange = globalMax - globalMin || 1
  const showAvg =
    avgBpm != null &&
    (avgBpm - globalMin) / bpmRange > 0.15 &&
    (globalMax - avgBpm) / bpmRange > 0.15

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
      <View className="flex-row items-center mb-yb-2 gap-yb-3">
        <Text style={{ fontSize: 11, fontWeight: "600", color: labelColor }}>
          최고 {globalMax}
        </Text>
        {showAvg && (
          <Text style={{ fontSize: 11, fontWeight: "600", color: lineColor }}>
            평균 {avgBpm}
          </Text>
        )}
        <Text style={{ fontSize: 11, fontWeight: "600", color: labelColor }}>
          최저 {globalMin}
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
            domain={{ y: [globalMin - bpmRange * 0.15, globalMax + bpmRange * 0.1] }}
            padding={{ left: 0, right: 0, top: 8, bottom: 8 }}
            xAxis={{ tickCount: 0, lineWidth: 0 }}
            yAxis={[{ tickCount: 0, lineWidth: 0 }]}
          >
            {({ points, chartBounds }) => {
              const { top, bottom, left, right } = chartBounds
              const linePath = buildLinePath(points.y)
              const areaPath = buildAreaPath(points.y, chartBounds.bottom)

              const toYPixel = (bpm: number) => {
                const domainMin = globalMin - bpmRange * 0.15
                const domainMax = globalMax + bpmRange * 0.1
                return bottom - ((bpm - domainMin) / (domainMax - domainMin)) * (bottom - top)
              }

              const yMax = toYPixel(globalMax)
              const yMin = toYPixel(globalMin)
              const yAvg = avgBpm != null ? toYPixel(avgBpm) : null

              return (
                <>
                  <SkiaLine p1={vec(left, yMax)} p2={vec(right, yMax)} color={dashColor} strokeWidth={1}>
                    <DashPathEffect intervals={[4, 4]} />
                  </SkiaLine>

                  <SkiaLine p1={vec(left, yMin)} p2={vec(right, yMin)} color={dashColor} strokeWidth={1}>
                    <DashPathEffect intervals={[4, 4]} />
                  </SkiaLine>

                  {showAvg && yAvg != null && (
                    <SkiaLine p1={vec(left, yAvg)} p2={vec(right, yAvg)} color={lineColor} strokeWidth={1} opacity={0.5}>
                      <DashPathEffect intervals={[4, 4]} />
                    </SkiaLine>
                  )}

                  {areaPath && <Path path={areaPath} color={fillColor} style="fill" />}

                  {linePath && (
                    <Path
                      path={linePath}
                      color={lineColor}
                      strokeWidth={2}
                      style="stroke"
                    />
                  )}
                </>
              )
            }}
          </CartesianChart>
        )}
      </View>

      <View className="flex-row justify-between mt-yb-1">
        <Text className="text-yb-fg-secondary text-yb-caption">{startTimeLabel}</Text>
        <Text className="text-yb-fg-secondary text-yb-caption">{endTimeLabel}</Text>
      </View>
    </View>
  )
}
