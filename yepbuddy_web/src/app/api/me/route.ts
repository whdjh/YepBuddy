import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/app/db";
import { profiles } from "@/app/users/[username]/schema";
import { verifyAccessToken } from "@/lib/jwt";
import { eq } from "drizzle-orm";

// 유틸: 문자열 정리
function normStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}
function toNullIfEmpty(s: string | undefined) {
  if (s == null) return null;
  const t = s.trim();
  return t.length ? t : null;
}
const ROLE_VALUES = new Set(["trainer", "member"] as const);

export async function PUT(req: Request) {
  try {
    // 1) 인증: Authorization: Bearer <accessToken>
    const h = await headers();
    const auth = h.get("authorization") || h.get("Authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const userId = payload.sub as string;
    if (!userId) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2) 요청 본문 파싱
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
    }

    const name = normStr((body as any).name);
    const role = normStr((body as any).role) as "trainer" | "member" | "";
    const description = normStr((body as any).description);
    const location = normStr((body as any).location);
    const history = normStr((body as any).history);
    const qualifications = normStr((body as any).qualifications);

    // 3) 최소 검증
    if (!name) {
      return NextResponse.json({ ok: false, error: "이름을 입력하세요." }, { status: 400 });
    }
    if (!ROLE_VALUES.has(role as any)) {
      return NextResponse.json({ ok: false, error: "구분(역할)을 선택하세요." }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ ok: false, error: "자기소개를 입력하세요." }, { status: 400 });
    }

    // 4) role별 필드 정리
    // - member: 트레이너 전용 필드는 NULL로 저장
    // - trainer: 모두 허용(빈 문자열은 NULL로)
    const updateForMember = {
      name,
      role: "member" as const,
      description,
      location: null as string | null,
      history: null as string | null,
      qualifications: null as string | null,
      updated_at: new Date(),
    };

    const updateForTrainer = {
      name,
      role: "trainer" as const,
      description,
      location: toNullIfEmpty(location),
      history: toNullIfEmpty(history),
      qualifications: toNullIfEmpty(qualifications),
      updated_at: new Date(),
    };

    const updateValues = role === "member" ? updateForMember : updateForTrainer;

    // 5) 업데이트
    await db
      .update(profiles)
      .set(updateValues)
      .where(eq(profiles.profile_id, userId));

    // 6) 응답(프론트 동기화용 최소 정보 반환)
    return NextResponse.json(
      {
        ok: true,
        profile: {
          id: userId,
          name: updateValues.name,
          role: updateValues.role,
          description: updateValues.description,
          location: updateValues.location,
          history: updateValues.history,
          qualifications: updateValues.qualifications,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[ME_PUT_ERROR]", err);
    return NextResponse.json({ ok: false, error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
