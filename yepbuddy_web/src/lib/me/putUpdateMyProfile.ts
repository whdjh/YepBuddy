export type MePutBody = {
  name: string;
  role: "trainer" | "member";
  description: string;
  location: string | null;
  history: string | null;
  qualifications: string | null;
};

export type MePutResp =
  | {
    ok: true;
    profile: {
      id: string;
      name: string;
      role: "trainer" | "member";
      description: string;
      location: string | null;
      history: string | null;
      qualifications: string | null;
    };
  }
  | { ok: false; error: string };

/** PUT /api/me - 나의 프로필 텍스트 필드 업데이트 */
export async function updateMyProfile(
  body: MePutBody,
  token: string | null
): Promise<MePutResp> {
  const res = await fetch("/api/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  let json: any = null;
  try { json = await res.json(); } catch { }

  if (!res.ok || !json?.ok) {
    return { ok: false, error: json?.error || "저장 실패" };
  }
  return json as MePutResp;
}
