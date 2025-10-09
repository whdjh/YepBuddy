export async function getProteinById(id: number) {
  const res = await fetch(`/api/proteins/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`GET /api/proteins/${id} ${res.status} ${msg}`);
  }
  const json = await res.json() as { ok: boolean; data: any };
  return json.data as any;
}
