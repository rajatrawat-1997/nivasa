import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

import { listingSchema } from "../route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const { listingId } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.providerProfileId !== me.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const parsed = listingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the listing details." },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const canSelfPublish = listing.status === "active" || listing.status === "paused" || listing.status === "rented";

  if (input.status && !canSelfPublish) {
    return NextResponse.json(
      { error: "This listing is waiting for review. Only Nivasa admins can publish it." },
      { status: 403 },
    );
  }

  const [updated] = await db
    .update(listings)
    .set({
      title: input.title,
      propertyType: input.propertyType,
      roomType: input.roomType,
      rent: input.rent,
      deposit: input.deposit,
      city: input.city,
      locality: input.locality,
      address: input.address,
      description: input.description,
      amenities: input.amenities,
      furnishing: input.furnishing,
      availableFrom: input.availableFrom,
      houseRules: input.houseRules,
      occupancy: input.occupancy,
      photos: input.photos,
      ...(input.status && canSelfPublish ? { status: input.status } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(listings.id, listingId), eq(listings.providerProfileId, me.id)))
    .returning();

  return NextResponse.json({ listing: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const { listingId } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.providerProfileId !== me.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  await db.delete(listings).where(eq(listings.id, listingId));
  return NextResponse.json({ deleted: true });
}
