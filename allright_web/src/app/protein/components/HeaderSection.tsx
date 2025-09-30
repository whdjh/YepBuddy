"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface HeaderSectionProps {
  pathname: string;
  sorting: string;
  period: string;
  q: string;
  setParam: (updates: Record<string, string | null>) => void;
}

export function HeaderSection({
  pathname,
  sorting,
  period,
  q,
  setParam,
}: HeaderSectionProps) {
  return (
    <div className="flex justify-between">
      <div className="space-y-5 w-full">


        <div className="flex justify-between">
          <form action={pathname} className="w-2/3">
            <Input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="검색해보세요."
            />
          </form>
          <div className="flex items-center gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <span className="text-sm capitalize">{sorting}</span>
                <ChevronDownIcon className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={sorting}
                  onValueChange={(value) => {
                    const updates: Record<string, string | null> = {
                      sorting: value,
                      period: value === "인기" ? (period ?? "day") : null,
                    };
                    setParam(updates);
                  }}
                >
                  {["가격이 높은순", "가격이 낮은순"].map((option) => (
                    <DropdownMenuRadioItem
                      key={option}
                      value={option}
                      className="capitalize cursor-pointer"
                    >
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

    </div>
  );
}
