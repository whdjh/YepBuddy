"use client";

// 헬스장 단건 조회 훅
import { useQuery } from "@tanstack/react-query";
import { getGymById, type GymDetail } from "@/lib/gyms/getGymById";

export function useGymById(gymId: number) {
  return useQuery({
    queryKey: ["gyms", "detail", gymId],
    queryFn: async (): Promise<GymDetail> => getGymById(gymId),
    enabled: Number.isFinite(gymId) && gymId > 0,
  });
}
