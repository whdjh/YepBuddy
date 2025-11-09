export interface ProteinPrice {
  protein_id: number;
  observed_date: string;
  sale: number;
  price: number;
  available: boolean;
  url?: string; // 파트너스 추적 링크
}

export async function getProteinPrice(): Promise<ProteinPrice[]> {
  const res = await fetch("/api/proteins/price", { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`GET /api/proteins/price ${res.status} ${msg}`);
  }
  const json = await res.json() as { ok: boolean; data: { items: ProteinPrice[] } };
  console.log(json.data);
  return json.data.items;
}
