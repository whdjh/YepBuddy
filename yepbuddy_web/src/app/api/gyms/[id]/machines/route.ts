import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { gyms, machines, gymsMachines } from "@/app/gym/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/gyms/[id]/machines
 * - 특정 헬스장의 보유 기구 목록을 반환한다
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // params는 Promise이므로 await 필요
) {
  const { id } = await ctx.params; // params를 먼저 await
  const gymId = Number(id);
  if (Number.isNaN(gymId)) {
    return NextResponse.json({ ok: false, error: "잘못된 gym id" }, { status: 400 });
  }

  const exists = await db
    .select({ id: gyms.gym_id })
    .from(gyms)
    .where(eq(gyms.gym_id, gymId))
    .limit(1);

  if (exists.length === 0) {
    return NextResponse.json({ ok: false, error: "헬스장을 찾을 수 없음" }, { status: 404 });
  }

  const rows = await db
    .select({
      machine_id: machines.machine_id,
      name: machines.name,
      brand: machines.brand,
      category: machines.category,
      quantity: gymsMachines.quantity,
      notes: gymsMachines.notes,
      created_at: gymsMachines.created_at,
      updated_at: gymsMachines.updated_at,
    })
    .from(gymsMachines)
    .leftJoin(machines, eq(gymsMachines.machine_id, machines.machine_id))
    .where(eq(gymsMachines.gym_id, gymId));

  return NextResponse.json({ ok: true, data: { items: rows } });
}
