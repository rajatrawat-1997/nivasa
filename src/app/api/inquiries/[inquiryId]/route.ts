import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { inquiries, listings } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const schema = z.object({ status: z.enum(["new", "replied", "closed"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ inquiryId: string }> },
) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { inquiryId } = await params;
  const [row] = await db
    .select({ inquiry: inquiries, listing: listings })
    .from(inquiries)
    .innerJoin(listings, eq(inquiries.listingId, listings.id))
    .where(eq(inquiries.id, inquiryId))
    .limit(1);

  if (!row) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  if (row.listing.providerProfileId !== me.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const [updated] = await db
    .update(inquiries)
    .set({ status: parsed.data.status })
    .where(eq(inquiries.id, inquiryId))
    .returning();

  return NextResponse.json({ inquiry: updated });
}
