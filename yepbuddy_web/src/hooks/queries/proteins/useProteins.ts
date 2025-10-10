"use client";

import { useQuery } from "@tanstack/react-query";
import { getProteins, type ListParams } from "@/lib/proteins/getProteins";

export function useProteins(params?: ListParams) {
  return useQuery({
    queryKey: ["proteins", params?.q ?? "", params?.topic ?? ""],
    queryFn: () => getProteins(params),
  });
}
