import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { notifications, profiles } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

export async function POST() {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  if (me.role === "provider") {
    return NextResponse.json({ role: "provider" });
  }

  await db
    .update(profiles)
    .set({ role: "provider", updatedAt: new Date() })
    .where(eq(profiles.id, me.id));

  await db.insert(notifications).values({
    profileId: me.id,
    type: "system",
    title: "Provider space is ready",
    body: "You can now list rooms. New listings go through a quick review before they're public.",
    href: "/app/provider/dashboard",
  });

  return NextResponse.json({ role: "provider" });
}
