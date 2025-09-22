"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Hero } from "@/components/common/Hero";
import CardSection from "@/components/product/partner/CardSection";
import { mockPartnerCards } from "@/mock/PartnerCardData";
import TypeSection from "@/components/product/partner/TypeSection";
import LocationSection from "@/components/product/partner/LocationSection";
import TimeRangeSection from "@/components/product/partner/TimeRangeSection";

export default function Partner() {
  return (
    <Suspense fallback={null}>
      <PartnerInner />
    </Suspense>
  );
}

function PartnerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onFilterClick = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="파트너" subtitle="파트너를 찾아보세요!" />
      
      <div className="grid gap-20 grid-cols-1 tab:grid-cols-12 items-start mx-auto">
        <div className="col-span-full tab:col-span-8">
          <CardSection cards={mockPartnerCards} />
        </div>

        <div className="hidden tab:block tab:col-span-3 pc:col-span-4 space-y-10">
          <TypeSection onFilterClick={onFilterClick} />
          <LocationSection onFilterClick={onFilterClick} />
          <TimeRangeSection onFilterClick={onFilterClick} />
        </div>
      </div>
    </div>
  );
}
