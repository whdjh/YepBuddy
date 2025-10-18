export type MeGetResp =
  | {
    ok: true;
    user: {
      id: string;
      username: string | null; // 아이디 = 이메일 로컬파트(@ 앞)
      displayName: string | null; // 이름 = profiles.name
      avatarUrl: string | null;
    };
  }
  | { ok: false; error: string };

/** GET /api/auth/me - 나의 프로필(표시용 정보) 조회 */
export async function getMyProfile(token: string | null): Promise<MeGetResp> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    //
  }

  if (!res.ok || !json?.ok) {
    return { ok: false, error: json?.error || "me 조회 실패" };
  }
  return json as MeGetResp;
}