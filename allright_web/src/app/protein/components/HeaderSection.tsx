"use client";

import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SORT_OPTIONS, PERIOD_OPTIONS } from "@/constants/community";

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
                {SORT_OPTIONS.map((option) => (
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

          {sorting === "인기" && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <span className="text-sm capitalize">{period}</span>
                <ChevronDownIcon className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={period}
                  onValueChange={(value) => {
                    setParam({ period: value });
                  }}
                >
                  {PERIOD_OPTIONS.map((option) => (
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
          )}
        </div>

        <form action={pathname} className="w-2/3">
          <Input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="검색해보세요."
          />
        </form>
      </div>

    </div>
  );
}
