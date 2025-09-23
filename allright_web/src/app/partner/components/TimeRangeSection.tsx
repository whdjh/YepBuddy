"use client";

import { Button } from "@/components/ui/button";
import { TIME_RANGE } from "@/constants/partner";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface Props {
  onFilterClick: (key: string, value: string) => void;
}

export default function TimeRangeSection({ onFilterClick }: Props) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col items-start gap-2.5">
      <h4 className="text-sm text-muted-foreground font-bold">시간</h4>
      <div className="flex flex-wrap gap-2">
        {TIME_RANGE.map((range) => (
          <Button
            key={range}
            variant="outline"
            onClick={() => onFilterClick("salary", range)}
            className={cn(
              searchParams.get("salary") === range && "bg-white/10"
            )}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  );
}
