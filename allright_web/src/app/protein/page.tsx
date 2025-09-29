"use client";

import { Hero } from "@/components/common/Hero";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { HeaderSection } from "./components/HeaderSection";
import { CardSection } from "./components/CardSection";
import { TopicSection } from "./components/TopicSection";
import { mockPosts } from "@/mock/proteinCardData";

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

  const sorting = searchParams.get("sorting") ?? "최신순";
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

      <div className="grid grid-cols-1 tab:grid-cols-6 items-start gap-40 p-2 tab:p-5">
        <div className="col-span-full tab:col-span-4 space-y-10">
          <HeaderSection
            pathname={pathname}
            sorting={sorting}
            period={period}
            q={q}
            setParam={setParam}
          />

          <div className="space-y-10">
            <CardSection cards={mockPosts} />
          </div>
        </div>

        <div className="hidden tab:block tab:col-span-2">
          <TopicSection
            topics={["WPC", "WPI", "WPC+WPI", "카제인"]}
            makeHref={makeHref}
          />
        </div>
      </div>
    </div>
  );
}
