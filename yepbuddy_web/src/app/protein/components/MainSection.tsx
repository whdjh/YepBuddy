"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { HeaderSection } from "@/app/protein/components/HeaderSection";
import { CardSection } from "@/app/protein/components/CardSection";
import { TabSection } from "@/app/protein/components/TabSection";
import useQueryTab from "@/hooks/useQueryTab";
import { useProteins } from "@/hooks/queries/protein/useProteins";
import { useProteinPrice } from "@/hooks/queries/protein/useProteinPrice";
import { useProteinPriceStats } from "@/hooks/queries/protein/useProteinPriceStats";
import { decideBadge } from "@/lib/protein/priceBadge";

type TabKey = "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine";

export default function MainSection() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const { activeTab } = useQueryTab<TabKey>(
    "tab",
    "wpc",
    ["wpc", "wpi", "wpcwpi", "creatine", "beta-alanine"]
  );

  const makeHref = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // 목록 + 최신가
  const { data: proteins } = useProteins({ q, topic: activeTab });
  const { data: latestPrices } = useProteinPrice();

  // 180일 분포 통계 (p20/p50/p80 등)
  const { data: priceStats } = useProteinPriceStats();

  const cards = useMemo(() => {
    const items = proteins ?? [];

    // 최신가 맵
    const priceMap = new Map<
      number,
      { price: number; observed_date: string; available: boolean; sale: number }
    >();
    (latestPrices ?? []).forEach((p) => {
      priceMap.set(Number(p.protein_id), {
        price: Number(p.price),
        observed_date: p.observed_date,
        available: Boolean(p.available),
        sale: Number(p.sale), // %
      });
    });

    // 통계 맵
    const statsMap = new Map<
      number,
      { p20?: number | null; p50?: number | null; p80?: number | null; min?: number | null; max?: number | null; sample_count?: number | null }
    >();
    (priceStats ?? []).forEach((s) => {
      // s.protein_id가 string/number 혼재 가능성 방지
      statsMap.set(Number(s.protein_id), s);
    });

    return items.map((p: any) => {
      const pid = Number(p.protein_id);

      const priceInfo = priceMap.get(pid);
      const basePrice = priceInfo?.price ?? null;
      const salePercent = priceInfo?.sale ?? 0;

      // 실제 표시가 = 정가 × (1 - 할인율/100)
      const latestPrice =
        basePrice != null ? Math.round(basePrice * (1 - salePercent / 100)) : null;

      const weight = Number(p.weight);
      const scoop = p.scoop != null ? Number(p.scoop) : null;
      const proteinPerScoop = p.protein_per_scoop != null ? Number(p.protein_per_scoop) : null;

      let priceDisplay = "-";
      let perProteinGramText = "-";

      if (latestPrice != null && latestPrice > 0) {
        priceDisplay = `${latestPrice.toLocaleString()}원`;

        // price / (weight * (protein_per_scoop / scoop))
        if (weight > 0 && scoop && scoop > 0 && proteinPerScoop && proteinPerScoop > 0) {
          const totalProteinGrams = weight * (proteinPerScoop / scoop);
          if (totalProteinGrams > 0) {
            const perProteinGram = Math.round(latestPrice / totalProteinGrams);
            perProteinGramText = `${perProteinGram.toLocaleString()}원/g`;
          }
        } else if (weight > 0) {
          const perGram = Math.round(latestPrice / weight);
          perProteinGramText = `${perGram.toLocaleString()}원/g`;
        }
      }

      // 저/중/고 배지
      const stats = statsMap.get(pid);
      const badge = stats ? decideBadge(latestPrice, stats) : null;

      return {
        id: String(p.protein_id),
        title: p.title,
        weight: String(p.weight),
        avatarFile: String(p.avatar_file || "").replace(/\n/g, ""),
        topic: p.topic,
        taste: p.taste,
        price: priceDisplay,
        priceText: perProteinGramText,
        likesCount: 0,
        badge,
      };
    });
  }, [proteins, latestPrices, priceStats]);

  return (
    <div className="flex flex-col gap-5">
      <TabSection activeTab={activeTab} makeHref={makeHref} />
      <HeaderSection pathname={pathname} q={q} activeTab={activeTab} />
      <CardSection cards={cards} />
    </div>
  );
}
