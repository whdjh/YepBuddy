import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { proteinPricesDaily } from "@/app/protein/schema";
import { and, desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/proteins/:id/prices?limit=90
 * id에 대한 일별 가격 히스토리 반환. 최신 순 정렬.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "90"), 1), 365);

    const rows = await db
      .select()
      .from(proteinPricesDaily)
      .where(and(eq(proteinPricesDaily.protein_id, id)))
      .orderBy(desc(proteinPricesDaily.observed_date))
      .limit(limit);

    return NextResponse.json({ ok: true, data: { items: rows } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
