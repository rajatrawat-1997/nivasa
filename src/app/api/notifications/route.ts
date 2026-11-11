import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const schema = z.object({
  id: z.string().min(1).optional(),
  markAll: z.boolean().optional(),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (parsed.data.markAll) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.profileId, me.id), eq(notifications.read, false)));
    return NextResponse.json({ ok: true });
  }

  if (!parsed.data.id) {
    return NextResponse.json({ error: "Notification id is required." }, { status: 400 });
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, parsed.data.id), eq(notifications.profileId, me.id)));

  return NextResponse.json({ ok: true });
}
