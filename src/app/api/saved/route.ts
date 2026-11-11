import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { savedListings, savedProfiles } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const bodySchema = z.object({
  type: z.enum(["profile", "listing"]),
  id: z.string().min(1),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to save items." }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { type, id } = parsed.data;

  if (type === "profile") {
    if (id === me.id) {
      return NextResponse.json({ error: "You can't save your own profile." }, { status: 400 });
    }
    const [existing] = await db
      .select()
      .from(savedProfiles)
      .where(and(eq(savedProfiles.profileId, me.id), eq(savedProfiles.targetProfileId, id)))
      .limit(1);
    if (existing) {
      await db.delete(savedProfiles).where(eq(savedProfiles.id, existing.id));
      return NextResponse.json({ saved: false });
    }
    await db.insert(savedProfiles).values({ profileId: me.id, targetProfileId: id });
    return NextResponse.json({ saved: true });
  }

  const [existing] = await db
    .select()
    .from(savedListings)
    .where(and(eq(savedListings.profileId, me.id), eq(savedListings.listingId, id)))
    .limit(1);
  if (existing) {
    await db.delete(savedListings).where(eq(savedListings.id, existing.id));
    return NextResponse.json({ saved: false });
  }
  await db.insert(savedListings).values({ profileId: me.id, listingId: id });
  return NextResponse.json({ saved: true });
}
