import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { proteins } from "@/app/protein/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  const row = await db.query.proteins.findFirst({
    where: eq(proteins.protein_id, id),
  });

  if (!row) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: row });
}
