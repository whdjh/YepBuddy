// src/lib/priceBadge.ts
export type Badge = { kind: "low" | "mid" | "high"; color: "green" | "blue" | "red"; reason: string };

export function decideBadge(
  currentPrice: number | null | undefined,
  stats: { p20?: number | null; p50?: number | null; p80?: number | null; min?: number | null; max?: number | null; sample_count?: number | null }
): Badge | null {
  if (!currentPrice || currentPrice <= 0) return null;

  const p20 = stats.p20 ?? null;
  const p50 = stats.p50 ?? null;
  const p80 = stats.p80 ?? null;
  const n = stats.sample_count ?? 0;

  // 퍼센타일 기반
  if (p20 && p50 && p80 && n >= 5) {
    if (currentPrice <= p20) return { kind: "low", color: "green", reason: "P20 이하" };
    if (currentPrice >= p80) return { kind: "high", color: "red", reason: "P80 이상" };
    return { kind: "mid", color: "blue", reason: "중간 구간" };
  }

  // 폴백: median±10%
  if (p50) {
    const lower = p50 * 0.9;
    const upper = p50 * 1.1;
    if (currentPrice <= lower) return { kind: "low", color: "green", reason: "중앙값-10% 이하" };
    if (currentPrice >= upper) return { kind: "high", color: "red", reason: "중앙값+10% 이상" };
    return { kind: "mid", color: "blue", reason: "중앙값±10%" };
  }

  return null;
}

export function diffFromMedianPct(currentPrice: number, p50?: number | null) {
  if (!p50 || p50 <= 0) return null;
  return ((currentPrice - p50) / p50) * 100;
}
