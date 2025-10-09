"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { HeaderSection } from "@/app/protein/components/HeaderSection";
import { CardSection } from "@/app/protein/components/CardSection";
import { TabSection } from "@/app/protein/components/TabSection";
import useQueryTab from "@/hooks/useQueryTab";
import { useProteins } from "@/hooks/queries/protein/useProteins";

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

  const makeHref = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  // 서버 API 연동
  const { data, isLoading, isError } = useProteins({ q, topic: activeTab });

  const cards = useMemo(() => {
    const items = data ?? [];
    return items.map((p: any) => ({
      id: String(p.protein_id),
      title: p.title,
      weight: String(p.weight),
      avatarFile: String(p.avatar_file || "").replace(/\n/g, ""),
      topic: p.topic,
      taste: p.taste,
      price: "-",     // 추후 가격 API 연결 시 교체
      likesCount: 0,  // 추후 좋아요 API 연결 시 교체
    }));
  }, [data]);

  if (isLoading) return <div className="p-4">로딩 중</div>;
  if (isError) return <div className="p-4">불러오기에 실패했습니다</div>;

  return (
    <div className="flex flex-col gap-5">
      <TabSection activeTab={activeTab} makeHref={makeHref} />
      <HeaderSection pathname={pathname} q={q} />
      <CardSection cards={cards} />
    </div>
  );
}
