"use client";

import { useQuery } from "@tanstack/react-query";
import { getProteinPrice, type ProteinPrice } from "@/lib/proteins/getProteinPrice";

export function useProteinPrice() {
  return useQuery<ProteinPrice[]>({
    queryKey: ["protein-prices"],
    queryFn: getProteinPrice,
  });
}
