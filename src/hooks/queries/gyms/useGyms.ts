"use client";

// 헬스장 목록 조회 훅: 페이지네이션 사용하지 않음
import { useQuery } from "@tanstack/react-query";
import { getGyms, type GymListItem } from "@/lib/gyms/getGyms";

export function useGyms(params?: { q?: string }) {
  const q = params?.q ?? "";
  return useQuery({
    queryKey: ["gyms", "list", q],
    queryFn: async (): Promise<GymListItem[]> => {
      const data = await getGyms(q ? { q } : undefined);
      return data.items;
    },
  });
}
