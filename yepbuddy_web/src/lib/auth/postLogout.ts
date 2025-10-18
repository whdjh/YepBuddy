export type LogoutResp = { ok: boolean };

export async function postLogout(): Promise<LogoutResp> {
  // 서버 쿠키/세션 정리 (멱등)
  await fetch("/api/auth/logout", { method: "POST" });
  return { ok: true };
}
