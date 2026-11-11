import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { auditLogs, notifications, profiles } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";

const schema = z.object({
  verified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  idVerified: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const { profileId } = await params;
  const [person] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
  if (!person) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  if (person.id === admin.id && parsed.data.isAdmin === false) {
    return NextResponse.json(
      { error: "You can't remove your own admin access." },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(profiles)
    .set({
      ...(typeof parsed.data.verified === "boolean" ? { verified: parsed.data.verified } : {}),
      ...(typeof parsed.data.phoneVerified === "boolean"
        ? { phoneVerified: parsed.data.phoneVerified }
        : {}),
      ...(typeof parsed.data.idVerified === "boolean"
        ? { idVerified: parsed.data.idVerified }
        : {}),
      ...(typeof parsed.data.isAdmin === "boolean" ? { isAdmin: parsed.data.isAdmin } : {}),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();

  await db.insert(auditLogs).values({
    actorProfileId: admin.id,
    action: "profile.verification",
    target: `profile:${person.id}`,
    detail: JSON.stringify(parsed.data),
  });

  if (parsed.data.verified && !person.verified) {
    await db.insert(notifications).values({
      profileId: person.id,
      type: "system",
      title: "You're verified",
      body: "Your profile now shows the Nivasa verified badge. Verified profiles get more genuine matches.",
      href: "/app/profile",
    });
  }

  return NextResponse.json({ profile: updated });
}
