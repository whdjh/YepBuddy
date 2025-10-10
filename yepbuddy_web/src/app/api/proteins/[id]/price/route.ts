import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { proteinPricesDaily } from "@/app/protein/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

/** GET /api/proteins/:id/price?limit=180 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "180"), 1), 365);

  const rows = await db
    .select()
    .from(proteinPricesDaily)
    .where(eq(proteinPricesDaily.protein_id, numId))
    .orderBy(desc(proteinPricesDaily.observed_date))
    .limit(limit);

  return NextResponse.json({ ok: true, data: { items: rows } });
}
