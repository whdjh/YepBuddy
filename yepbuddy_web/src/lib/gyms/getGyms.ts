// 헬스장 목록 조회
export interface GymListItem {
  gym_id: number;
  title: string;
  location: string;
  views: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  machines_count: number;
}

export async function getGyms(params?: { q?: string }): Promise<{ items: GymListItem[] }> {
  const q = params?.q ? `?q=${encodeURIComponent(params.q)}` : "";
  const res = await fetch(`/api/gyms${q}`, { cache: "no-store" });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("응답 파싱에 실패함");
  }
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || `HTTP ${res.status}`);
  }

  return json.data as { items: GymListItem[] };
}
