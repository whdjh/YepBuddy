"use client";

import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/common/hero";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { DateTime } from "luxon";

const MIN_DAYS = 3;
const PRICE_PER_DAY = 20;

export default function Promote() {
  const [promotionPeriod, setPromotionPeriod] = useState<DateRange | undefined>();
  const [today, setToday] = useState<Date | null>(null);

  // SSR/클라 시간차로 인한 hydration mismatch 방지: 클라이언트에서만 today 세팅
  useEffect(() => {
    const now = DateTime.now().startOf("day");
    setToday(now.toJSDate());
  }, []);

  const { days, price, isComplete, meetsMin } = useMemo(() => {
    const from = promotionPeriod?.from;
    const to = promotionPeriod?.to;
    if (!from || !to) return { days: 0, price: 0, isComplete: false, meetsMin: false };

    const fromDT = DateTime.fromJSDate(from).startOf("day");
    const toDT = DateTime.fromJSDate(to).startOf("day");

    const inclusiveDays = Math.max(1, Math.floor(toDT.diff(fromDT, "days").days) + 1);

    return {
      days: inclusiveDays,
      price: inclusiveDays * PRICE_PER_DAY,
      isComplete: true,
      meetsMin: inclusiveDays >= MIN_DAYS,
    };
  }, [promotionPeriod]);

  return (
    <div className="space-y-10 flex flex-col justify-center">
      <Hero title="트레이너 홍보" subtitle="당신을 홍보해보세요!" />
      <form className="max-w-sm mx-auto flex flex-col gap-10 items-center">
        <div className="flex flex-col gap-2 items-center w-full">
          <Label className="flex flex-col gap-1 text-center">
            홍보기간을 선택하세요
            <small className="text-muted-foreground">
              최소 {MIN_DAYS}일 · 오늘 이전은 선택 불가
            </small>
          </Label>

          <Calendar
            mode="range"
            tone="green"
            selected={promotionPeriod}
            onSelect={setPromotionPeriod}
            disabled={
              today
                ? { before: new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
                : undefined
            }
          />

          <p className="text-sm text-muted-foreground">
            {isComplete ? `선택: ${days}일` : "기간을 선택하세요"}
            {isComplete && !meetsMin && ` · 최소 ${MIN_DAYS}일 이상이어야 합니다`}
          </p>
        </div>

        <Button type="button" disabled={!isComplete || !meetsMin}>
          결제하러가기 (${price})
        </Button>
      </form>
    </div>
  );
}
