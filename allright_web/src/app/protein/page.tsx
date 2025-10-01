"use client";

import { Hero } from "@/components/common/Hero";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { HeaderSection } from "@/app/protein/components/HeaderSection";
import { CardSection } from "@/app/protein/components/CardSection";
import { TopicSection } from "@/app/protein//components/TopicSection";
import { mockProteins } from "@/app/protein/components/_mock/proteinCardData";

export default function Protein() {
  return (
    <Suspense fallback={null}>
      <ProteinInner />
    </Suspense>
  );
}

function ProteinInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sorting = searchParams.get("sorting") ?? "가격이 낮은순";
  const period = searchParams.get("period") ?? "all";
  const q = searchParams.get("q") ?? "";

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

  const setParam = useCallback(
    (updates: Record<string, string | null>, opts?: { scroll?: boolean }) => {
      router.replace(makeHref(updates), { scroll: opts?.scroll ?? false });
    },
    [router, makeHref]
  );

  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-20">
      <Hero title="프로틴" subtitle="프로틴 목록" />

      <div className="flex flex-col gap-10">
        <TopicSection
          topics={["WPC", "WPI", "WPC+WPI", "카제인", "식물성"]}
          makeHref={makeHref}
        />

        <HeaderSection
          pathname={pathname}
          sorting={sorting}
          period={period}
          q={q}
          setParam={setParam}
        />

        <CardSection cards={mockProteins} />
      </div>
    </div>
  );
}
