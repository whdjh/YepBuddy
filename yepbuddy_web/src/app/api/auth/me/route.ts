import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/app/db";
import { verifyAccessToken } from "@/lib/jwt";

/**
 * GET /api/auth/me
 * Authorization: Bearer <accessToken>
 *
 * - displayName: 회원가입 때 받은 이름 (profiles.name)
 * - username(아이디): 이메일 로컬파트 (users.email의 @ 앞 부분)
 * - avatarUrl: profiles.avatar_file
 */
export async function GET() {
  try {
    const h = await headers();
    const auth = h.get("authorization") || h.get("Authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const userId = payload.sub as string;

    // 이름/아바타
    const prof = await db.query.profiles.findFirst({
      where: (t, { eq }) => eq(t.profile_id, userId),
      columns: { profile_id: true, name: true, avatar_file: true },
    });

    // 이메일 → 아이디로 사용
    const user = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, userId),
      columns: { email: true },
    });

    const email = user?.email ?? "";
    const handle = email.includes("@") ? email.split("@")[0] : "user";

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: userId,
          username: handle,
          displayName: prof?.name ?? null,
          avatarUrl: prof?.avatar_file ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[ME_ERROR]", err);
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
}
