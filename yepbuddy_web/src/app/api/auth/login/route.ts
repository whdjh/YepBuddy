import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/app/db";
import { refreshTokens } from "@/app/users/[username]/schema";
import {
  signAccessToken,
  signRefreshToken,
  generateJti,
  hashToken,
  refreshCookieOptions,
  REFRESH_TOKEN_COOKIE,
  refreshMaxAgeSec,
} from "@/lib/jwt";

// 간단 유효성
function normEmail(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}
function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
    }

    const email = normEmail((body as any).email);
    const password = typeof (body as any).password === "string" ? (body as any).password : "";

    if (!email || !isEmail(email) || !password) {
      return NextResponse.json({ ok: false, error: "이메일/비밀번호를 확인하세요." }, { status: 400 });
    }

    // 1) 사용자 조회
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
      columns: { id: true, password_hash: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "계정이 없거나 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // 2) 비밀번호 검증
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "계정이 없거나 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // 3) 토큰 발급
    const jti = generateJti();
    const accessToken = await signAccessToken({ sub: user.id });
    const refreshToken = await signRefreshToken(user.id, jti);

    // 4) refresh 저장 (원문은 해시만 저장)
    const token_hash = await hashToken(refreshToken);
    const expires_at = new Date(Date.now() + refreshMaxAgeSec * 1000);

    // 선택 수집(컬럼은 nullable이므로 없어도 됨)
    const ua = req.headers.get("user-agent") ?? null;
    const fwd = req.headers.get("x-forwarded-for") ?? "";
    const ip =
      (fwd.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null) as string | null;

    await db.insert(refreshTokens).values({
      jti,
      user_id: user.id,
      token_hash,
      expires_at,
      user_agent: ua ?? undefined,
      ip: ip ?? undefined,
    });

    // 5) 리프레시 쿠키 세팅 (HttpOnly, SameSite)
    const res = NextResponse.json({ ok: true, accessToken }, { status: 200 });
    res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...refreshCookieOptions,
      maxAge: refreshMaxAgeSec,
    });
    return res;
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    return NextResponse.json({ ok: false, error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
