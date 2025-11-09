import { useQuery } from "@tanstack/react-query";

export interface ProteinFlavor {
  flavorId: number;
  name: string;
  tier: "T1" | "T2" | "T3" | null;
  polarizing: boolean;
  note: string | null;
}

interface ApiResponse {
  ok: boolean;
  data?: { items: ProteinFlavor[] };
  error?: string;
}

export function useProteinFlavors(proteinId: number) {
  return useQuery({
    queryKey: ["proteinFlavors", proteinId],
    queryFn: async () => {
      const res = await fetch(`/api/proteins/${proteinId}/flavors`, { cache: "no-store" });
      const json: ApiResponse = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load flavors");
      return json.data?.items ?? [];
    },
  });
}
