// 헬스장 단건 조회
export interface GymDetail {
  gym_id: number;
  title: string;
  location: string;
  created_at: string;
  updated_at: string;
  machines_count: number;
}

export async function getGymById(gymId: number): Promise<GymDetail> {
  if (!Number.isFinite(gymId) || gymId <= 0) {
    throw new Error("유효하지 않은 gymId");
  }

  const res = await fetch(`/api/gyms/${gymId}`, { cache: "no-store" });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("응답 파싱에 실패함");
  }
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || `HTTP ${res.status}`);
  }

  return json.data as GymDetail;
}
