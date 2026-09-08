import { Text, View, useColorScheme } from "react-native"
import { useTranslation } from "react-i18next"
import { DashPathEffect, Line, Path, vec } from "@shopify/react-native-skia"
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
  /** 단위를 포함한 값 표시 함수 */
  formatValue: (value: number) => string
  /** 선·채움·평균 강조 색상 */
  color: string
  /** 카드 여백과 문구를 제외한 그래프 높이 */
  height: number
  /** 왼쪽 끝에 표시할 날짜·운동 시작 시각 등의 문구 */
  startLabel: string
  /** 오른쪽 끝에 표시할 날짜·운동 종료 시각 등의 문구 */
  endLabel: string
  /** 화면 읽기용 차트 이름, 범위와 통계는 내부에서 추가 */
  accessibilityLabel: string
  /** 고정할 X축 범위, 생략 시 데이터 범위 사용 */
  xDomain?: MetricChartDomain
  /** 측정선 아래부터 차트 바닥까지 반투명 채움 여부 */
  area?: boolean
  /** 최고·최저 및 조건에 맞는 평균 위치의 가로 점선 표시 여부 */
  guides?: boolean
  /** 평균 문구 표시 여부 */
  showAverage?: boolean
}

/** 좌표·단위·색상을 받아 통계와 그래프를 표시하는 가격·심박 공용 컴포넌트 */
export function MetricChart({
  points: input,
  formatValue,
  color,
  height,
  startLabel,
  endLabel,
  accessibilityLabel,
  xDomain,
  area = false,
  guides = false,
  showAverage = false,
}: MetricChartProps) {
  const { t } = useTranslation()
  const { fgSecondary } = useCardColors()
  const isDark = useColorScheme() === "dark"
  // 같은 유효 좌표 목록을 기준으로 그래프와 통계 계산
  const chart = getMetricChartData(input, xDomain)

  // 유효한 점이 2개 미만이거나 축 범위가 잘못된 경우 카드 표시 생략
  if (!chart) return null

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

  // 변환된 화면 좌표와 Y축 척도를 사용한 측정선·채움·안내선 렌더링
  const renderChart = ({
    points,
    chartBounds,
    yScale,
  }: CartesianChartRenderArg<MetricChartPoint, "y">) => {
    const { top, bottom, left, right } = chartBounds
    // 그리기 영역의 너비나 높이가 없는 경우 렌더링 생략
    if (right <= left || bottom <= top) return null

    const linePath = buildLinePath(points.y)
    
    if (!linePath) return null

    // 데이터의 0이 아닌 화면의 차트 바닥까지 채움 경로 생성
    const areaPath = area ? buildAreaPath(points.y, bottom) : null
    // 최고와 최저가 같을 때 같은 위치의 안내선 중복 방지
    const extremes = chart.minimum === chart.maximum
      ? [chart.minimum]
      : [chart.maximum, chart.minimum]

    return (
      <>
        {guides && extremes.map((value) => (
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
        {guides && showAverage && chart.showAverageGuide && (
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

  return (
    <GlassSurface
      cornerRadius={20}
      paddingSize={20}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
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

        <View style={{ height }}>
          <CartesianChart
            data={chart.points}
            xKey="x"
            yKeys={["y"]}
            domain={{ x: chart.xDomain, y: chart.yDomain }}
            domainPadding={0}
            padding={{ left: 0, right: 0, top: 8, bottom: 8 }}
            xAxis={{ tickCount: 0, lineWidth: 0 }}
            yAxis={[{ tickCount: 0, lineWidth: 0 }]}
          >
            {renderChart}
          </CartesianChart>
        </View>

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
