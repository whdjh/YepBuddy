// 저장 세션처럼 값이 없을 수 있는 metric count는 null로 보존
export function normalizeOptionalMetricCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null
}

// 실시간 상태처럼 숫자 표시가 필요한 metric count는 유효하지 않은 값을 0으로 처리
export function normalizeMetricCount(value: unknown) {
  return normalizeOptionalMetricCount(value) ?? 0
}
