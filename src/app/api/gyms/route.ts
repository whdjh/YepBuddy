import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { gyms, gymsMachines } from "@/app/gym/schema";
import { eq, ilike, desc, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/gyms
 * - 전체 헬스장 목록을 반환한다
 * - 선택: q 쿼리로 제목 부분검색
 * - 좋아요 수, 보유 기구 수를 함께 포함한다
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    const baseQuery = db
      .select({
        gym_id: gyms.gym_id,
        title: gyms.title,
        location: gyms.location,
        created_at: gyms.created_at,
        updated_at: gyms.updated_at,
        machines_count: sql<number>`CAST(COUNT(DISTINCT ${gymsMachines.machine_id}) AS INTEGER)`,
      })
      .from(gyms)
      .leftJoin(gymsMachines, eq(gymsMachines.gym_id, gyms.gym_id));

    const filteredQuery = q ? baseQuery.where(ilike(gyms.title, `%${q}%`)) : baseQuery;

    const rows = await filteredQuery.groupBy(gyms.gym_id).orderBy(desc(gyms.created_at));

    return NextResponse.json({ ok: true, data: { items: rows } });
  } catch (error) {
    console.error("GET /api/gyms 실패:", error);
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
