import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/app/db";
import { refreshTokens } from "@/app/users/[username]/schema";
import {
  REFRESH_TOKEN_COOKIE,
  refreshCookieOptions,
  refreshMaxAgeSec,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  generateJti,
  hashToken,
  compareTokenHash,
} from "@/lib/jwt";
import { eq } from "drizzle-orm";

function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...refreshCookieOptions,
    maxAge: 0,
  });
}

export async function POST() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!raw) {
    const res = NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
    clearRefreshCookie(res);
    return res;
  }

  try {
    const payload = await verifyRefreshToken(raw);
    const userId = payload.sub as string;
    const jti = payload.jti as string;

    const row = await db.query.refreshTokens.findFirst({
      where: (t, { eq }) => eq(t.jti, jti),
    });

    if (!row || row.user_id !== userId) {
      const res = NextResponse.json({ ok: false, error: "유효하지 않은 세션입니다." }, { status: 401 });
      clearRefreshCookie(res);
      return res;
    }

    const now = new Date();
    if (row.expires_at <= now || row.revoked_at) {
      const res = NextResponse.json({ ok: false, error: "세션이 만료되었습니다." }, { status: 401 });
      clearRefreshCookie(res);
      return res;
    }

    const same = await compareTokenHash(raw, row.token_hash);
    if (!same) {
      const res = NextResponse.json({ ok: false, error: "세션 무결성 오류" }, { status: 401 });
      clearRefreshCookie(res);
      return res;
    }

    const newJti = generateJti();
    const newAccess = await signAccessToken({ sub: userId });
    const newRefresh = await signRefreshToken(userId, newJti);
    const newHash = await hashToken(newRefresh);
    const newExpires = new Date(Date.now() + refreshMaxAgeSec * 1000);

    await db.transaction(async (tx) => {
      await tx
        .update(refreshTokens)
        .set({ revoked_at: now, replaced_by: newJti })
        .where(eq(refreshTokens.jti, jti));

      await tx.insert(refreshTokens).values({
        jti: newJti,
        user_id: userId,
        token_hash: newHash,
        expires_at: newExpires,
      });
    });

    const res = NextResponse.json({ ok: true, accessToken: newAccess }, { status: 200 });
    res.cookies.set(REFRESH_TOKEN_COOKIE, newRefresh, {
      ...refreshCookieOptions,
      maxAge: refreshMaxAgeSec,
    });
    return res;
  } catch (err) {
    console.error("[REFRESH_ERROR]", err);
    const res = NextResponse.json({ ok: false, error: "세션 확인 실패" }, { status: 401 });
    clearRefreshCookie(res);
    return res;
  }
}
