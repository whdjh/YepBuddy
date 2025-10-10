import { useQuery } from "@tanstack/react-query";
import type { PriceStatsRow } from "@/app/api/proteins/price-stats/route";

export function useProteinPriceStats() {
  return useQuery<PriceStatsRow[]>({
    queryKey: ["protein-price-stats", 180],
    queryFn: async () => {
      const res = await fetch("/api/proteins/price-stats", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error("Failed to load price stats");
      return json.data as PriceStatsRow[];
    },
  });
}
