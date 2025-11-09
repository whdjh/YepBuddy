"use client";

// 특정 헬스장의 보유 기구 목록 조회 훅
import { useQuery } from "@tanstack/react-query";
import { getGymMachines, type GymMachine } from "@/lib/gyms/getGymMachines";

export function useGymMachines(gymId: number) {
  return useQuery({
    queryKey: ["gyms", "machines", gymId],
    queryFn: async (): Promise<GymMachine[]> => {
      const data = await getGymMachines(gymId);
      return data.items;
    },
    enabled: Number.isFinite(gymId) && gymId > 0,
  });
}
