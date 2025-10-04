"use client";

import { Input } from "@/components/ui/input";

interface HeaderSectionProps {
  pathname: string;
  q: string;
}

// TODO: 서비스 많이 되면 가격순 정렬 추가
export function HeaderSection({
  pathname,
  q,
}: HeaderSectionProps) {
  return (
    <div className="flex justify-between">
      <div className="space-y-5 w-full">
        <div className="flex justify-between">
          <form action={pathname} className="w-full">
            <Input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="검색해보세요."
            />
          </form>
        </div>
      </div>

    </div>
  );
}
