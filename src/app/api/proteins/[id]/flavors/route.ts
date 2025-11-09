import { NextResponse } from "next/server";
import db from "@/app/db";
import { proteinFlavors } from "@/app/protein/schema";
import { eq, asc } from "drizzle-orm";

// Next.js 최신 시그니처: params는 Promise여서 await 필요
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
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
    .orderBy(
      asc(proteinFlavors.polarizing),
      asc(proteinFlavors.tier),
      asc(proteinFlavors.name)
    );

  return NextResponse.json({ ok: true, data: { items } });
}
