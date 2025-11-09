// 특정 헬스장의 보유 기구 목록 조회
export type MachineCategory =
  | "back" | "chest" | "arm" | "shoulder" | "leg" | "free" | "cardio" | "etc";

export interface GymMachine {
  machine_id: number;
  name: string;
  brand: string | null;
  category: MachineCategory;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getGymMachines(gymId: number): Promise<{ items: GymMachine[] }> {
  if (!Number.isFinite(gymId) || gymId <= 0) {
    throw new Error("유효하지 않은 gymId");
  }

  const res = await fetch(`/api/gyms/${gymId}/machines`, { cache: "no-store" });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("응답 파싱에 실패함");
  }
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || `HTTP ${res.status}`);
  }

  return json.data as { items: GymMachine[] };
}
