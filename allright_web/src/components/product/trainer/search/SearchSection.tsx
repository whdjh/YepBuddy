"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchSection() {
  const router = useRouter();
  const sp = useSearchParams();
  const defaultQuery = sp.get("query") ?? "";
  
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const query = (new FormData(e.currentTarget).get("query") as string)?.trim() || "";
    router.push(query ? `/trainer/search?query=${encodeURIComponent(query)}` : `/trainer/search`);
  };

  return (
    <form onSubmit={onSubmit} className="flex justify-center h-14 max-w-screen-sm items-center gap-2 mx-auto">
      <Input
        name="query"
        defaultValue={defaultQuery}
        placeholder="트레이너를 검색하세요!"
        className="text-lg"
        autoComplete="off"
        enterKeyHint="search"
        aria-label="트레이너 검색어"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
