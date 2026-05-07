import type { PriceBadge } from "./types"

export interface PriceStats {
  p20: number | null
  p50: number | null
  p80: number | null
  sample_count?: number
}

/** 현재 가격을 가격 분포 통계와 비교해 목록/상세 화면의 가격 배지를 결정 */
export function decideBadge(
  price: number | null | undefined,
  stats: PriceStats,
): PriceBadge | null {
  if (price == null || !Number.isFinite(price) || price <= 0) return null

  const { p20, p50, p80 } = stats
  const sampleCount = stats.sample_count ?? 0

  // 표본이 충분하면 분위수 기준으로 저가/중간/고가를 판단
  if (
    p20 != null &&
    p50 != null &&
    p80 != null &&
    Number.isFinite(p20) &&
    Number.isFinite(p50) &&
    Number.isFinite(p80) &&
    sampleCount >= 5
  ) {
    if (price <= p20) return { kind: "low", color: "green", reason: "P20 이하" }
    if (price >= p80) return { kind: "high", color: "red", reason: "P80 이상" }
    return { kind: "mid", color: "blue", reason: "중간 구간" }
  }

  // 분위수가 부족하면 중앙값 대비 ±10%를 임시 기준으로 사용
  if (p50 != null && Number.isFinite(p50) && p50 > 0) {
    if (price <= p50 * 0.9) {
      return { kind: "low", color: "green", reason: "중앙값-10% 이하" }
    }
    if (price >= p50 * 1.1) {
      return { kind: "high", color: "red", reason: "중앙값+10% 이상" }
    }
    return { kind: "mid", color: "blue", reason: "중앙값±10%" }
  }

  return null
}
