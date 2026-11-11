import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { appSettings, auditLogs } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { DEFAULT_WEIGHTS } from "@/lib/compatibility";

const schema = z.object({
  compatibility_weights: z.record(z.string(), z.number().min(0).max(100)),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid weights." }, { status: 400 });
  }

  const total = Object.values(parsed.data.compatibility_weights).reduce(
    (sum, value) => sum + value,
    0,
  );
  if (total < 10 || total > 200) {
    return NextResponse.json(
      { error: "Compatibility weights should add up to roughly 100." },
      { status: 400 },
    );
  }

  const value = { ...DEFAULT_WEIGHTS, ...parsed.data.compatibility_weights };

  await db
    .insert(appSettings)
    .values({ key: "compatibility_weights", value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });

  await db.insert(auditLogs).values({
    actorProfileId: admin.id,
    action: "settings.compatibility_weights",
    target: "app_settings:compatibility_weights",
    detail: JSON.stringify(value),
  });

  return NextResponse.json({ weights: value });
}
