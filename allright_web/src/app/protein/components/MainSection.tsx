"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { HeaderSection } from "@/app/protein/components/HeaderSection";
import { CardSection } from "@/app/protein/components/CardSection";
import { TabSection } from "@/app/protein/components/TabSection";
import { mockProteins } from "@/app/protein/components/_mock/proteinCardData";
import useQueryTab from "@/hooks/useQueryTab";

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
  
    // 기존 makeHref 유지. 탭 전환에서도 재사용하여 다른 쿼리(q 등)를 보존
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
  
  return (
    <div className="flex flex-col gap-5">
      <TabSection
        activeTab={activeTab}
        makeHref={makeHref}
      />

      {/* TODO: 서비스 많이 되면 가격순 정렬 추가 */}
      <HeaderSection
        pathname={pathname}
        q={q}
      />

      {/* TODO: activeTab에 따라 카드/콘텐츠를 분기 */}
      <CardSection cards={mockProteins} />
    </div>
  );
}