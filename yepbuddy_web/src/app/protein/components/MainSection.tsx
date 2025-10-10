"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { HeaderSection } from "@/app/protein/components/HeaderSection";
import { CardSection } from "@/app/protein/components/CardSection";
import { TabSection } from "@/app/protein/components/TabSection";
import useQueryTab from "@/hooks/useQueryTab";
import { useProteins } from "@/hooks/queries/protein/useProteins";
import { useProteinPrice } from "@/hooks/queries/protein/useProteinPrice";

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

  const { data: proteins } = useProteins({
    q,
    topic: activeTab,
  });

  const { data: latestPrices } = useProteinPrice();

  const cards = useMemo(() => {
    const items = proteins ?? [];

    const priceMap = new Map<
      number,
      { price: number; observed_date: string; available: boolean; sale: number }
    >();

    (latestPrices ?? []).forEach((p) => {
      priceMap.set(Number(p.protein_id), {
        price: Number(p.price),
        observed_date: p.observed_date,
        available: Boolean(p.available),
        sale: Number(p.sale), // 할인율 (%)
      });
    });

    return items.map((p: any) => {
      const priceInfo = priceMap.get(Number(p.protein_id));
      const basePrice = priceInfo?.price ?? null;
      const salePercent = priceInfo?.sale ?? 0;

      // 실제 표시용 가격 = 정가 × (1 - 할인율/100)
      const latestPrice =
        basePrice != null ? Math.round(basePrice * (1 - salePercent / 100)) : null;

      const weight = Number(p.weight);
      const scoop = p.scoop != null ? Number(p.scoop) : null;
      const proteinPerScoop = p.protein_per_scoop != null ? Number(p.protein_per_scoop) : null;

      let priceDisplay = "-";
      let perProteinGramText = "-";

      if (latestPrice != null && latestPrice > 0) {
        priceDisplay = `${latestPrice.toLocaleString()}원`;

        // 공식: price / (weight * (protein_per_scoop / scoop))
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
      };
    });
  }, [proteins, latestPrices]);

  return (
    <div className="flex flex-col gap-5">
      <TabSection activeTab={activeTab} makeHref={makeHref} />
      <HeaderSection pathname={pathname} q={q} activeTab={activeTab} />
      <CardSection cards={cards} />
    </div>
  );
}
