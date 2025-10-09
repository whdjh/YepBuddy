export type ProteinTopic = "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine";

export interface ListParams {
  q?: string;
  topic?: ProteinTopic;
}

export async function getProteins(params?: ListParams) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.topic) sp.set("topic", params.topic);

  const res = await fetch(`/api/proteins${sp.toString() ? `?${sp}` : ""}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`GET /api/proteins ${res.status} ${msg}`);
  }

  // API 응답: { ok: true, data: { items: [...] } }
  const json = await res.json();
  return json.data.items as any[]; // 여기서 네 프로젝트 고유 타입으로 캐스팅해서 사용해도 된다.
}
