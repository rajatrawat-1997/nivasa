import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { inquiries, listings, notifications } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

const schema = z.object({
  listingId: z.string().min(1, "Listing is required."),
  message: z
    .string()
    .trim()
    .min(10, "Add at least 10 characters so the provider can help.")
    .max(1000, "Keep inquiries under 1,000 characters."),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to contact a provider." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid inquiry." },
      { status: 400 },
    );
  }

  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, parsed.data.listingId), eq(listings.status, "active")))
    .limit(1);
  if (!listing) {
    return NextResponse.json(
      { error: "This room is no longer available." },
      { status: 404 },
    );
  }

  const [existing] = await db
    .select()
    .from(inquiries)
    .where(
      and(
        eq(inquiries.listingId, listing.id),
        eq(inquiries.fromProfileId, me.id),
        eq(inquiries.status, "new"),
      ),
    )
    .limit(1);
  if (existing) {
    return NextResponse.json(
      { error: "You already have an open inquiry for this room. The provider will reply soon." },
      { status: 409 },
    );
  }

  await db.insert(inquiries).values({
    listingId: listing.id,
    fromProfileId: me.id,
    message: parsed.data.message,
  });

  await db.insert(notifications).values({
    profileId: listing.providerProfileId,
    type: "inquiry",
    title: `New inquiry from ${me.name.split(" ")[0]}`,
    body: `About ${listing.title}: ${parsed.data.message.slice(0, 90)}${parsed.data.message.length > 90 ? "…" : ""}`,
    href: "/app/provider/inquiries",
  });

  return NextResponse.json({ ok: true });
}
