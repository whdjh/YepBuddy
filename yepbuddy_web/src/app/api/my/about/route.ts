import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import db from "@/app/db";
import { profiles } from "@/app/users/[username]/schema";
import { verifyAccessToken } from "@/lib/jwt";

export const runtime = "nodejs";

type Body = {
  displayName?: string | null;
  location?: string | null;
  bio?: string | null;
  histories?: string[];       // 줄바꿈 형태로 저장
  qualifications?: string[];  // 줄바꿈 형태로 저장
};

export async function PATCH(req: Request) {
  try {
    const h = await headers();
    const auth = h.get("authorization") || h.get("Authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    const userId = payload.sub as string;

    const body = (await req.json()) as Body;

    await db
      .update(profiles)
      .set({
        name: body.displayName ?? undefined,
        location: body.location ?? undefined,
        description: body.bio ?? undefined,
        history: Array.isArray(body.histories) ? body.histories.join("\n") : undefined,
        qualifications: Array.isArray(body.qualifications)
          ? body.qualifications.join("\n")
          : undefined,
        updated_at: new Date(),
      })
      .where(eq(profiles.profile_id, userId));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[ABOUT_PATCH_ERROR]", e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
