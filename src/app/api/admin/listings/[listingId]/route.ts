import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { auditLogs, listings, notifications } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";

const schema = z.object({
  status: z.enum(["active", "paused", "rented", "rejected"]).optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const { listingId } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const [updated] = await db
    .update(listings)
    .set({
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(typeof parsed.data.featured === "boolean" ? { featured: parsed.data.featured } : {}),
      updatedAt: new Date(),
    })
    .where(eq(listings.id, listingId))
    .returning();

  await db.insert(auditLogs).values({
    actorProfileId: admin.id,
    action: parsed.data.status ? `listing.${parsed.data.status}` : "listing.featured",
    target: `listing:${listing.id}`,
    detail: JSON.stringify(parsed.data),
  });

  if (parsed.data.status === "active" || parsed.data.status === "rejected") {
    await db.insert(notifications).values({
      profileId: listing.providerProfileId,
      type: "system",
      title:
        parsed.data.status === "active"
          ? "Your listing is live"
          : "Your listing needs changes",
      body:
        parsed.data.status === "active"
          ? `${listing.title} passed review and is now visible in the room marketplace.`
          : `${listing.title} wasn't approved. Review the details and submit it again.`,
      href: `/app/provider/listings/${listing.id}/edit`,
    });
  }

  return NextResponse.json({ listing: updated });
}
