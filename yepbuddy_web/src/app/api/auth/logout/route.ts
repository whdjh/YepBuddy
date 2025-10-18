import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/app/db";
import { refreshTokens } from "@/app/users/[username]/schema";
import {
  REFRESH_TOKEN_COOKIE,
  refreshCookieOptions,
  verifyRefreshToken,
  compareTokenHash,
} from "@/lib/jwt";
import { eq } from "drizzle-orm";

function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...refreshCookieOptions,
    maxAge: 0, // 즉시 만료
  });
}

export async function POST() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // 쿠키가 없어도 클라 상태 초기화를 위해 성공 응답 + 쿠키 제거
  if (!raw) {
    const res = NextResponse.json({ ok: true }, { status: 200 });
    clearRefreshCookie(res);
    return res;
  }

  try {
    // 1) 쿠키 토큰 파싱(sub, jti)
    const payload = await verifyRefreshToken(raw);
    const jti = payload.jti as string;

    // 2) DB에서 해당 jti 조회
    const row = await db.query.refreshTokens.findFirst({
      where: (t, { eq }) => eq(t.jti, jti),
    });

    // 3) 존재 + 해시 일치하면 revoke 처리
    if (row) {
      const same = await compareTokenHash(raw, row.token_hash);
      if (same && !row.revoked_at) {
        await db
          .update(refreshTokens)
          .set({ revoked_at: new Date() })
          .where(eq(refreshTokens.jti, jti));
      }
    }

    // 4) 쿠키 제거 후 성공 응답
    const res = NextResponse.json({ ok: true }, { status: 200 });
    clearRefreshCookie(res);
    return res;
  } catch (err) {
    console.error("[LOGOUT_ERROR]", err);
    // 토큰 파싱 실패해도 쿠키만 제거하고 성공 응답(멱등)
    const res = NextResponse.json({ ok: true }, { status: 200 });
    clearRefreshCookie(res);
    return res;
  }
}
