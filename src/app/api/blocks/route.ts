import { and, desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { blockedUsers, matches, profiles } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const bodySchema = z.object({ profileId: z.string().min(1) });

export async function GET() {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const rows = await db
    .select({ id: blockedUsers.id, profile: profiles })
    .from(blockedUsers)
    .innerJoin(profiles, eq(blockedUsers.blockedProfileId, profiles.id))
    .where(eq(blockedUsers.profileId, me.id))
    .orderBy(desc(blockedUsers.createdAt));

  return NextResponse.json({
    blocked: rows.map((row) => ({
      id: row.id,
      profileId: row.profile.id,
      name: row.profile.name,
      avatarUrl: row.profile.avatarUrl,
    })),
  });
}

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to block a profile." }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || parsed.data.profileId === me.id) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await db
    .insert(blockedUsers)
    .values({ profileId: me.id, blockedProfileId: parsed.data.profileId })
    .onConflictDoNothing();

  const [match] = await db
    .select()
    .from(matches)
    .where(
      or(
        and(eq(matches.profileAId, me.id), eq(matches.profileBId, parsed.data.profileId)),
        and(eq(matches.profileAId, parsed.data.profileId), eq(matches.profileBId, me.id)),
      ),
    )
    .limit(1);

  if (match) {
    await db.delete(matches).where(eq(matches.id, match.id));
  }

  return NextResponse.json({ blocked: true });
}

export async function DELETE(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await db
    .delete(blockedUsers)
    .where(
      and(
        eq(blockedUsers.profileId, me.id),
        eq(blockedUsers.blockedProfileId, parsed.data.profileId),
      ),
    );

  return NextResponse.json({ unblocked: true });
}
