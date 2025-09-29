"use client";

import { Button } from "@/components/ui/button";
import { PARTNER_TYPES } from "@/constants/partner";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface Props {
  onFilterClick: (key: string, value: string) => void;
}

export default function TypeSection({ onFilterClick }: Props) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col items-start gap-2.5">
      <h4 className="text-sm text-muted-foreground font-bold">타입</h4>
      <div className="flex flex-wrap gap-2">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.value}
            variant="outline"
            onClick={() => onFilterClick("type", type.value)}
            className={cn(
              searchParams.get("type") === type.value && "bg-white/10"
            )}
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  );
}