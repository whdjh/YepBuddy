"use client";

import { Hero } from "@/components/common/Hero";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { HeaderSection } from "@/components/product/community/HeaderSection";
import { CardSection } from "@/components/product/community/CardSection";
import { TopicSection } from "@/components/product/community/TopicSection";
import { mockPosts } from "@/mock/postCardData";

export default function Community() {
  return (
    <Suspense fallback={null}>
      <CommunityInner />
    </Suspense>
  );
}

function CommunityInner() {
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
    <div>
      <Hero title="커뮤니티" subtitle="질문하고, 운동 팁을 공유하며, 다른 사람들과 소통하세요!" />

      <div className="grid grid-cols-6 items-start gap-40 p-5">
        <div className="col-span-4 space-y-10">
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

        <TopicSection
          topics={["토픽1", "토픽2", "토픽3", "토픽4", "토픽5"]}
          makeHref={makeHref}
        />
      </div>
    </div>
  );
}
