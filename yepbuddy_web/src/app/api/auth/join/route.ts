import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/app/db";
import { users, profiles } from "@/app/users/[username]/schema";

// --- 간단 유효성 검증 유틸 ---
function normEmail(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}
function isEmail(s: string): boolean {
  // RFC 완전 대응은 아니지만 실무용으로 충분한 보편 패턴
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function normStr(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

export async function POST(req: Request) {
  try {
    // 0) JSON 파싱
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "잘못된 요청 본문입니다.(JSON 필요)" },
        { status: 400 }
      );
    }

    // 1) 입력 정규화
    const name = normStr((body as any).name);
    const email = normEmail((body as any).email);
    const password = normStr((body as any).password);

    // 2) 기본 검증
    if (!name) {
      return NextResponse.json(
        { ok: false, error: "이름은 필수입니다." },
        { status: 400 }
      );
    }
    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 3) 중복 검사(소프트)
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
      columns: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    // 4) 해시 & 트랜잭션
    const password_hash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email,
        password_hash,
      });
      await tx.insert(profiles).values({
        profile_id: userId,
        name,
      });
    });

    // 5) 성공 응답
    return NextResponse.json(
      { ok: true, userId, message: "회원가입이 완료되었습니다." },
      { status: 201 }
    );
  } catch (err: any) {
    // 유니크 위반(레이스) 하드 가드
    if (err?.code === "23505") {
      return NextResponse.json(
        { ok: false, error: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }
    console.error("[JOIN_ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
