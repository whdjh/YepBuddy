import type { PriceBadge } from "./types"

export interface PriceStats {
  p20: number | null
  p50: number | null
  p80: number | null
  sample_count?: number
}

export function decideBadge(price: number | null | undefined, stats: PriceStats): PriceBadge | null {
  if (!price || price <= 0) return null

  const { p20, p50, p80 } = stats
  const sampleCount = stats.sample_count ?? 0

  if (p20 && p50 && p80 && sampleCount >= 5) {
    if (price <= p20) return { kind: "low", color: "green", reason: "P20 이하" }
    if (price >= p80) return { kind: "high", color: "red", reason: "P80 이상" }
    return { kind: "mid", color: "blue", reason: "중간 구간" }
  }

  if (p50) {
    if (price <= p50 * 0.9) return { kind: "low", color: "green", reason: "중앙값-10% 이하" }
    if (price >= p50 * 1.1) return { kind: "high", color: "red", reason: "중앙값+10% 이상" }
    return { kind: "mid", color: "blue", reason: "중앙값±10%" }
  }

  return null
}
