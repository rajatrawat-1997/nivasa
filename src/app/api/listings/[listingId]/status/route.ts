import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const schema = z.object({ status: z.enum(["active", "paused", "rented"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { listingId } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.providerProfileId !== me.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  if (listing.status === "pending" || listing.status === "rejected") {
    return NextResponse.json(
      { error: "Nivasa admins must approve this listing before you can change its status." },
      { status: 403 },
    );
  }

  const [updated] = await db
    .update(listings)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(listings.id, listingId))
    .returning();

  return NextResponse.json({ listing: updated });
}
