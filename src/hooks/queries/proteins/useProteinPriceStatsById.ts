import { useProteinPriceStats } from "@/hooks/queries/proteins/useProteinPriceStats";

export function useProteinPriceStatsById(proteinId: number) {
  const { data, ...rest } = useProteinPriceStats();
  const stats = (data ?? []).find((s) => Number(s.protein_id) === Number(proteinId));
  return { data: stats, ...rest };
}
