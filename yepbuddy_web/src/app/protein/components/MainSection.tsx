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

    const priceMap = new Map<number, { price: number; observed_date: string; available: boolean }>();
    (latestPrices ?? []).forEach((p) => {
      priceMap.set(Number(p.protein_id), {
        price: Number(p.price),
        observed_date: p.observed_date,
        available: Boolean(p.available),
      });
    });

    return items.map((p: any) => {
      const priceInfo = priceMap.get(Number(p.protein_id));
      const latestPrice = priceInfo?.price ?? null;

      const weight = Number(p.weight);
      const scoop = p.scoop != null ? Number(p.scoop) : null;
      const proteinPerScoop = p.protein_per_scoop != null ? Number(p.protein_per_scoop) : null;

      // 기본 표시값
      let priceDisplay = "-";      // 총가격
      let perProteinGramText = "-"; // 단백질 g당 가격

      if (latestPrice != null && latestPrice > 0) {
        priceDisplay = `${latestPrice.toLocaleString()}원`;

        // 공식: price / (weight * (protein_per_scoop / scoop))
        if (weight > 0 && scoop && scoop > 0 && proteinPerScoop && proteinPerScoop > 0) {
          const totalProteinGrams = weight * (proteinPerScoop / scoop); // 총 단백질(g)
          if (totalProteinGrams > 0) {
            const perProteinGram = Math.round(latestPrice / totalProteinGrams);
            perProteinGramText = `${perProteinGram.toLocaleString()}원/g`;
          }
        } else if (weight > 0) {
          // 보조정보가 없으면 제품 g당 가격으로 폴백
          const perGram = Math.round(latestPrice / weight);
          perProteinGramText = `${perGram.toLocaleString()}원/g`;
        }
      }
      console.log(perProteinGramText);

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
      <HeaderSection pathname={pathname} q={q} />
      <CardSection cards={cards} />
    </div>
  );
}
