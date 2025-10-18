// 회원가입 API 호출 (throw 안하고 항상 JoinResp 형태로 반환)
export type JoinBody = {
  name: string;
  email: string;
  password: string;
};

export type JoinResp =
  | { ok: true; userId: string; message?: string }
  | { ok: false; error: string };

export async function postJoin(body: JoinBody): Promise<JoinResp> {
  try {
    const res = await fetch("/api/auth/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // 서버가 에러 메시지를 내려주면 그걸 우선 사용
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        (json && json.error) ||
        (res.status === 409 ? "이미 가입된 이메일입니다." : "회원가입에 실패했습니다.");
      return { ok: false, error: msg };
    }

    return (json as JoinResp) ?? { ok: true, userId: "", message: "회원가입 완료" };
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." };
  }
}
