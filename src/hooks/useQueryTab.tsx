"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function useQueryTab<T extends string>(
  key: string,
  defaultValue: T,
  validTabs: T[],
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get(key) as T;
  const isValid = currentTab && validTabs.includes(currentTab);

  const activeTab = isValid ? currentTab : defaultValue;

  const setTab = (tab: T) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, tab);
    router.push(`?${params.toString()}`);
  };

  return { activeTab, setTab };
}