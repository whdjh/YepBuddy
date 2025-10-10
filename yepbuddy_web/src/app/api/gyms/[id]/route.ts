import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { gyms, gymsLikes, gymsMachines } from "@/app/gym/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/gyms/[id]
 * - 헬스장 단건 상세를 반환한다
 * - 좋아요 수, 보유 기구 수를 함께 포함한다
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gymId = Number(params.id);
  if (Number.isNaN(gymId)) {
    return NextResponse.json({ ok: false, error: "잘못된 gym id" }, { status: 400 });
  }

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
    .where(eq(gyms.gym_id, gymId))
    .groupBy(gyms.gym_id)
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "헬스장을 찾을 수 없음" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: rows[0] });
}
