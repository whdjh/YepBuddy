import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { proteins } from "@/app/protein/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ← Promise로 받고
) {
  const { id } = await params;                        // ← await 해서 꺼내기
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  const row = await db.query.proteins.findFirst({
    where: eq(proteins.protein_id, numId),
  });

  return NextResponse.json({ ok: true, data: row ?? null });
}
