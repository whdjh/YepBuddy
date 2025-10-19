import { NextResponse } from "next/server";
import { sql, eq } from "drizzle-orm";
import db from "@/app/db";
import { users, profiles } from "@/app/users/[username]/schema";

export const runtime = "nodejs";

function splitToList(v?: string | null): string[] {
  if (!v) return [];
  return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const rows = await db
      .select({
        name: profiles.name,
        avatarUrl: profiles.avatar_file,
        location: profiles.location,
        description: profiles.description,
        history: profiles.history,
        qualifications: profiles.qualifications,
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.profile_id))
      .where(sql`split_part(${users.email}, '@', 1) = ${username}`);

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const row = rows[0];

    return NextResponse.json(
      {
        ok: true,
        about: {
          displayName: row.name ?? null,
          avatarUrl: row.avatarUrl ?? null,
          location: row.location ?? null,
          bio: row.description ?? null,
          histories: splitToList(row.history),
          qualifications: splitToList(row.qualifications),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[ABOUT_GET_ERROR]", e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
