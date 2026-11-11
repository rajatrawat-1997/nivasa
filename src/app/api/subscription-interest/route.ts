import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const schema = z.object({
  plan: z.string().min(1).max(60),
  interval: z.enum(["monthly", "yearly"]),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan request." }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.profileId, me.id), eq(notifications.type, "plan-interest")))
    .limit(1);

  if (!existing) {
    await db.insert(notifications).values({
      profileId: me.id,
      type: "plan-interest",
      title: "We'll let you know when checkout is live",
      body: `You asked about ${parsed.data.plan} (${parsed.data.interval}). No payment was taken.`,
    });
  }

  return NextResponse.json({ ok: true });
}
