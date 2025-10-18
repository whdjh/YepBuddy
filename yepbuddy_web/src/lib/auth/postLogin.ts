export type LoginReq = { email: string; password: string };
export type LoginResp = { ok: boolean; accessToken?: string; error?: string };

export async function postLogin(body: LoginReq): Promise<LoginResp> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  try {
    const json = (await res.json()) as { accessToken?: string; error?: string };
    if (!res.ok) {
      return { ok: false, error: json?.error ?? "로그인 실패" };
    }
    return { ok: true, accessToken: json.accessToken };
  } catch {
    return { ok: false, error: "응답 파싱 실패" };
  }
}
