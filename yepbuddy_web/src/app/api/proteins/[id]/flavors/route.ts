import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { proteinFlavors } from "@/app/protein/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const items = await db
    .select({
      flavorId: proteinFlavors.flavor_id,
      name: proteinFlavors.name,
      tier: proteinFlavors.tier,
      polarizing: proteinFlavors.polarizing,
      note: proteinFlavors.note,
    })
    .from(proteinFlavors)
    .where(eq(proteinFlavors.protein_id, id))
    .orderBy(asc(proteinFlavors.polarizing), asc(proteinFlavors.tier), asc(proteinFlavors.name));

  return NextResponse.json({ ok: true, data: { items } });
}
