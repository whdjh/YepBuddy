/** 차트의 점 하나 */
export type MetricChartPoint = {
  /** 순서·시간 등의 가로 위치 */
  x: number
  /** 가격·BPM 등의 수치 */
  y: number
}

/** 축의 시작값과 종료값 */
export type MetricChartDomain = readonly [number, number]

/** 차트에 사용할 점·통계·축 범위 계산, 표시할 수 없는 데이터는 null 반환 */
export function getMetricChartData(
  input: readonly MetricChartPoint[],
  domain?: MetricChartDomain,
) {
  // NaN·무한대 또는 시작값이 종료값 이상인 X축 범위 제외
  if (domain) {
    const [start, end] = domain
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null
    if (start >= end) return null
  }

  // 잘못된 좌표와 지정한 X축 범위 밖의 점 제외
  const points = input.filter(({ x, y }) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false
    if (domain && (x < domain[0] || x > domain[1])) return false
    return true
  })

  // 선을 연결할 두 점이 없으면 차트 표시 생략
  if (points.length < 2) return null

  // 원본 대신 새 배열을 X순으로 정렬, 같은 X의 점은 기존 순서 유지
  points.sort((a, b) => a.x - b.x)

  // 차트에 표시할 점들의 최저·최고·평균 계산
  let minimum = points[0].y
  let maximum = points[0].y
  let total = 0

  for (const point of points) {
    minimum = Math.min(minimum, point.y)
    maximum = Math.max(maximum, point.y)
    total += point.y
  }
  const average = total / points.length

  // 지정한 범위가 있으면 사용, 없으면 첫 점부터 마지막 점까지 표시
  const xDomain: [number, number] = domain
    ? [...domain]
    : [points[0].x, points[points.length - 1].x]

  // 동일한 Y축 범위의 보정은 Victory에서 처리
  const range = maximum - minimum
  const padding = range * 0.1

  // 최고·최저 측정선이 가장자리에 붙지 않도록 상하 10% 여백 확보
  const yDomain: [number, number] = [minimum - padding, maximum + padding]

  // 최고·최저와의 간격이 값 범위의 15% 초과일 때 평균 안내선 표시
  const showAverageGuide =
    range > 0 &&
    (average - minimum) / range > 0.15 &&
    (maximum - average) / range > 0.15

  return {
    points,
    minimum,
    maximum,
    average,
    xDomain,
    yDomain,
    showAverageGuide,
  }
}
