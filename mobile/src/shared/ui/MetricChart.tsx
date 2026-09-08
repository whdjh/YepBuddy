import { useRef, useState } from "react"
import { Pressable, Text, View, useColorScheme, type GestureResponderEvent } from "react-native"
import { useTranslation } from "react-i18next"
import { Circle, DashPathEffect, Line, Path, vec } from "@shopify/react-native-skia"
import { CartesianChart, type CartesianChartRenderArg } from "victory-native"

import { useCardColors } from "../hooks/useCardColors"
import {
  getMetricChartData,
  type MetricChartDomain,
  type MetricChartPoint,
} from "../lib/metricChart"
import { buildAreaPath, buildLinePath } from "../lib/skiaChartPaths"
import { GlassSurface } from "./GlassSurface"

interface MetricChartProps {
  /** 호출부에서 가격·심박 데이터를 변환한 숫자 좌표 목록 */
  points: readonly MetricChartPoint[]
  /** X좌표를 날짜·측정 시각으로 표시하는 함수 */
  formatXValue: (value: number) => string
  /** 단위를 포함한 값 표시 함수 */
  formatValue: (value: number) => string
  /** 왼쪽 끝에 표시할 날짜·운동 시작 시각 등의 문구 */
  startLabel: string
  /** 오른쪽 끝에 표시할 날짜·운동 종료 시각 등의 문구 */
  endLabel: string
  /** 화면 읽기용 차트 이름, 범위와 통계는 내부에서 추가 */
  accessibilityLabel: string
  /** 고정할 X축 범위, 생략 시 데이터 범위 사용 */
  xDomain?: MetricChartDomain
  /** 평균 문구와 평균 안내선 표시 여부 */
  showAverage?: boolean
}

type ChartRenderArg = CartesianChartRenderArg<MetricChartPoint, "y">

/** 좌표와 표시 형식을 받아 스타일·통계·그래프·점 선택을 처리하는 공용 컴포넌트 */
export function MetricChart({
  points: input,
  formatXValue,
  formatValue,
  startLabel,
  endLabel,
  accessibilityLabel,
  xDomain,
  showAverage = false,
}: MetricChartProps) {
  const { t } = useTranslation()
  const { fg, fgSecondary, accent: color } = useCardColors()
  const isDark = useColorScheme() === "dark"
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const scales = useRef<Pick<ChartRenderArg, "xScale" | "yScale"> | null>(null)
  // 같은 유효 좌표 목록을 기준으로 그래프와 통계 계산
  const chart = getMetricChartData(input, xDomain)

  // 유효한 점이 2개 미만이거나 축 범위가 잘못된 경우 카드 표시 생략
  if (!chart) return null

  const selectedPoint = selectedIndex === null ? null : chart.points[selectedIndex]
  const selectedLabel = selectedPoint
    ? `${formatXValue(selectedPoint.x)} · ${formatValue(selectedPoint.y)}`
    : ""

  // 호출부의 단위·반올림 형식에 최고·평균·최저 번역 문구 추가
  const highLabel = t("common.metricChart.high", {
    value: formatValue(chart.maximum),
  })
  const averageLabel = t("common.metricChart.average", {
    value: formatValue(chart.average),
  })
  const lowLabel = t("common.metricChart.low", {
    value: formatValue(chart.minimum),
  })
  // 차트 이름·양 끝 범위·표시 통계를 묶은 화면 읽기용 요약
  const summary = [
    accessibilityLabel,
    startLabel,
    endLabel,
    highLabel,
    ...(showAverage ? [averageLabel] : []),
    lowLabel,
  ].join(", ")

  // 실제 화면 거리로 가장 가까운 점 선택, 같은 X의 다른 Y도 구별
  const selectPoint = ({ nativeEvent }: GestureResponderEvent) => {
    if (!scales.current) return
    const { xScale, yScale } = scales.current
    const { locationX, locationY } = nativeEvent
    let nearestIndex = 0
    let nearestDistance = Infinity

    chart.points.forEach((point, index) => {
      const distance =
        (xScale(point.x) - locationX) ** 2 +
        (yScale(point.y) - locationY) ** 2
      if (distance < nearestDistance) {
        nearestIndex = index
        nearestDistance = distance
      }
    })
    setSelectedIndex(nearestIndex)
  }

  // 변환된 화면 좌표와 Y축 척도를 사용한 측정선·채움·안내선 렌더링
  const renderChart = ({
    points,
    chartBounds,
    yScale,
  }: ChartRenderArg) => {
    const { top, bottom, left, right } = chartBounds
    // 그리기 영역의 너비나 높이가 없는 경우 렌더링 생략
    if (right <= left || bottom <= top) return null

    const linePath = buildLinePath(points.y)

    if (!linePath) return null

    // 데이터의 0이 아닌 화면의 차트 바닥까지 채움 경로 생성
    const areaPath = buildAreaPath(points.y, bottom)
    // 최고와 최저가 같을 때 같은 위치의 안내선 중복 방지
    const extremes = chart.minimum === chart.maximum
      ? [chart.minimum]
      : [chart.maximum, chart.minimum]

    return (
      <>
        {extremes.map((value) => (
          <Line
            key={value}
            p1={vec(left, yScale(value))}
            p2={vec(right, yScale(value))}
            color={fgSecondary}
            strokeWidth={1}
            opacity={isDark ? 0.25 : 0.15}
          >
            <DashPathEffect intervals={[4, 4]} />
          </Line>
        ))}
        {showAverage && chart.showAverageGuide && (
          <Line
            p1={vec(left, yScale(chart.average))}
            p2={vec(right, yScale(chart.average))}
            color={color}
            strokeWidth={1}
            opacity={0.5}
          >
            <DashPathEffect intervals={[4, 4]} />
          </Line>
        )}
        {areaPath && (
          <Path
            path={areaPath}
            color={color}
            opacity={isDark ? 0.15 : 0.12}
            style="fill"
          />
        )}
        <Path
          path={linePath}
          color={color}
          strokeWidth={2}
          style="stroke"
        />
      </>
    )
  }

  // 양 끝 점의 원이 잘리지 않도록 차트 클리핑 영역 밖에서 선택 표시
  const renderSelection = ({ xScale, yScale, chartBounds }: ChartRenderArg) => {
    if (!selectedPoint) return null
    const x = xScale(selectedPoint.x)
    const y = yScale(selectedPoint.y)

    return (
      <>
        <Line
          p1={vec(x, chartBounds.top)}
          p2={vec(x, chartBounds.bottom)}
          color={color}
          strokeWidth={1}
          opacity={0.5}
        >
          <DashPathEffect intervals={[4, 4]} />
        </Line>
        <Circle cx={x} cy={y} r={5} color={color} />
        <Circle cx={x} cy={y} r={5} color={fg} style="stroke" strokeWidth={2} />
      </>
    )
  }

  return (
    <GlassSurface
      cornerRadius={20}
      paddingSize={20}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={summary}
      accessibilityValue={{ text: selectedLabel }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={({ nativeEvent }) => {
        const step = nativeEvent.actionName === "increment" ? 1 : -1
        setSelectedIndex((index) => index === null
          ? (step > 0 ? 0 : chart.points.length - 1)
          : Math.max(0, Math.min(chart.points.length - 1, index + step)))
      }}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View className="flex-row flex-wrap items-center mb-yb-2 gap-yb-3">
          <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
            {highLabel}
          </Text>
          {showAverage && (
            <Text className="text-yb-caption font-semibold" style={{ color }}>
              {averageLabel}
            </Text>
          )}
          <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
            {lowLabel}
          </Text>
        </View>

        <Text className="min-h-yb-5 text-yb-fg-secondary text-yb-caption mb-yb-2">
          {selectedLabel}
        </Text>

        <Pressable onPress={selectPoint} accessible={false}>
          <View pointerEvents="none" style={{ height: 160 }}>
            <CartesianChart
              data={chart.points}
              xKey="x"
              yKeys={["y"]}
              domain={{ x: chart.xDomain, y: chart.yDomain }}
              domainPadding={0}
              padding={{ left: 6, right: 6, top: 8, bottom: 8 }}
              xAxis={{ tickCount: 0, lineWidth: 0 }}
              yAxis={[{ tickCount: 0, lineWidth: 0 }]}
              onScaleChange={(xScale, yScale) => { scales.current = { xScale, yScale } }}
              renderOutside={renderSelection}
            >
              {renderChart}
            </CartesianChart>
          </View>
        </Pressable>

        <View className="flex-row justify-between gap-yb-3 mt-yb-1">
          <Text className="text-yb-fg-secondary text-yb-caption">
            {startLabel}
          </Text>
          <Text className="text-right text-yb-fg-secondary text-yb-caption">
            {endLabel}
          </Text>
        </View>
      </View>
    </GlassSurface>
  )
}
