export interface ProteinPrice {
  observed_date: string;
  price: number;
  sale: number;
  available: boolean;
  protein_id: number;
  url?: string; // 파트너스 추적 링크
}

export async function getProteinByIdPrice(id: number, limit = 90): Promise<ProteinPrice[]> {
  const res = await fetch(`/api/proteins/${id}/price?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`GET /api/proteins/${id}/price ${res.status} ${msg}`);
  }
  const json = await res.json() as { ok: boolean; data: { items: ProteinPrice[] } };
  return json.data.items;
}
