import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { gyms, gymsLikes, gymsMachines } from "@/app/gym/schema";
import { eq, ilike, desc, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/gyms
 * - 전체 헬스장 목록을 반환한다
 * - 선택: q 쿼리로 제목 부분검색
 * - 좋아요 수, 보유 기구 수를 함께 포함한다
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const rows = await db
    .select({
      gym_id: gyms.gym_id,
      title: gyms.title,
      location: gyms.location,
      views: gyms.views,
      created_at: gyms.created_at,
      updated_at: gyms.updated_at,
      likes_count: sql<number>`COUNT(DISTINCT ${gymsLikes.profile_id})`,
      machines_count: sql<number>`COUNT(DISTINCT ${gymsMachines.machine_id})`,
    })
    .from(gyms)
    .leftJoin(gymsLikes, eq(gymsLikes.gym_id, gyms.gym_id))
    .leftJoin(gymsMachines, eq(gymsMachines.gym_id, gyms.gym_id))
    .where(q ? ilike(gyms.title, `%${q}%`) : undefined)
    .groupBy(gyms.gym_id)
    .orderBy(desc(gyms.created_at));

  return NextResponse.json({ ok: true, data: { items: rows } });
}
