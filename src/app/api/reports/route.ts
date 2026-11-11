import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { reports } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const bodySchema = z.object({
  targetType: z.enum(["profile", "listing", "message"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(120),
  details: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to submit a report." }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Add a reason for your report." }, { status: 400 });
  }

  await db.insert(reports).values({
    reporterProfileId: me.id,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? "",
  });

  return NextResponse.json({ reported: true });
}
