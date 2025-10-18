import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/app/db";
import { profiles, roles } from "@/app/users/[username]/schema";
import { verifyAccessToken } from "@/lib/jwt";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);
    const userId = payload.sub as string;

    const formData = await req.formData();

    const name = formData.get("name")?.toString() ?? "";
    const role = formData.get("role")?.toString() ?? "member";
    const location = formData.get("location")?.toString() ?? "";
    const history = formData.get("history")?.toString() ?? "";
    const qualifications = formData.get("qualifications")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const avatarFile = formData.get("avatarFile") as File | null;

    if (!roles.enumValues.includes(role as any)) {
      return NextResponse.json({ ok: false, error: "INVALID_ROLE" }, { status: 400 });
    }

    let avatarUrl: string | null = null;

    // Supabase Storage 업로드
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const filePath = `${userId}.${ext}`;

      const { error: uploadErr } = await supabaseServer.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          contentType: avatarFile.type,
          upsert: true,
        });

      if (uploadErr) {
        console.error("SUPABASE_UPLOAD_ERROR", uploadErr);
        return NextResponse.json({ ok: false, error: "UPLOAD_FAILED" }, { status: 500 });
      }

      const { data: publicUrlData } = supabaseServer
        .storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatarUrl = publicUrlData.publicUrl;
    }

    // DB 업데이트
    await db
      .update(profiles)
      .set({
        name,
        role: role as (typeof roles.enumValues)[number],
        location,
        history,
        qualifications,
        description,
        avatar_file: avatarUrl,
        updated_at: new Date(),
      })
      .where(eq(profiles.profile_id, userId));

    return NextResponse.json({ ok: true, avatarUrl });
  } catch (err) {
    console.error("[PROFILE_UPDATE_ERROR]", err);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
