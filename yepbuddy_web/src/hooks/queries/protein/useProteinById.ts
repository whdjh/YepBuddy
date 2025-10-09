"use client";

import { useQuery } from "@tanstack/react-query";
import { getProteinById } from "@/lib/protein/getProteinById";

export function useProteinById(id?: number) {
  return useQuery({
    queryKey: ["protein", id],
    queryFn: () => getProteinById(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}
