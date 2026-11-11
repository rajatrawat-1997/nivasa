import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { auditLogs, reports } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";

const schema = z.object({
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { reportId } = await params;
  const [report] = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const [updated] = await db
    .update(reports)
    .set({ status: parsed.data.status })
    .where(eq(reports.id, reportId))
    .returning();

  await db.insert(auditLogs).values({
    actorProfileId: admin.id,
    action: `report.${parsed.data.status}`,
    target: `report:${report.id}`,
    detail: `${report.targetType}:${report.targetId}`,
  });

  return NextResponse.json({ report: updated });
}
