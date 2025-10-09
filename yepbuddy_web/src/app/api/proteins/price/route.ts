import { NextResponse } from "next/server";
import db from "@/app/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/protein/price
 * 각 protein_id의 최신 관측가 한 건씩 반환
 * 응답: { ok: true, data: { items: Array<{ protein_id:number; observed_date:string; price:number; available:boolean }> } }
 */
export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT ON (protein_id)
        protein_id,
        observed_date,
        price,
        available
      FROM protein_prices_daily
      ORDER BY protein_id, observed_date DESC
    `);

    const items = Array.isArray((result as any)?.rows)
      ? (result as any).rows
      : (result as any);

    return NextResponse.json({ ok: true, data: { items } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
