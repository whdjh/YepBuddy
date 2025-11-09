"use client";

import { useQuery } from "@tanstack/react-query";
import { getProteinByIdPrice, type ProteinPrice } from "@/lib/proteins/getProteinByIdPrice";

export function useProteinByIdPrice(id?: number, limit = 180) {
  return useQuery<ProteinPrice[]>({
    queryKey: ["protein-prices", id, limit],
    queryFn: () => getProteinByIdPrice(id as number, limit),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}
