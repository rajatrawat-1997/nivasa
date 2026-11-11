import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";
import { AMENITIES, CITIES, FURNISHING, PROPERTY_TYPES, ROOM_TYPES } from "@/lib/constants";

export const listingSchema = z.object({
  title: z.string().trim().min(8, "Give the listing a clear title (8+ characters).").max(120),
  propertyType: z.enum(PROPERTY_TYPES.map((option) => option.value) as [string, ...string[]]),
  roomType: z.enum(ROOM_TYPES.map((option) => option.value) as [string, ...string[]]),
  rent: z.number().int().min(1000, "Rent must be at least ₹1,000.").max(1_000_000),
  deposit: z.number().int().min(0).max(2_000_000),
  city: z.enum(CITIES as unknown as [string, ...string[]]),
  locality: z.string().trim().min(2, "Add the neighbourhood.").max(120),
  address: z.string().trim().max(240).optional().default(""),
  description: z
    .string()
    .trim()
    .min(40, "Add at least 40 characters describing the room.")
    .max(3000),
  amenities: z.array(z.string().max(40)).max(15),
  furnishing: z.enum(FURNISHING.map((option) => option.value) as [string, ...string[]]),
  availableFrom: z.string().min(1, "Add an availability date."),
  houseRules: z.array(z.string().max(120)).max(10),
  occupancy: z.number().int().min(1).max(6),
  photos: z
    .array(z.string().max(2_500_000))
    .min(1, "Add at least one photo.")
    .max(6),
  status: z.enum(["active", "paused", "rented"]).optional(),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to list a room." }, { status: 401 });
  if (me.role !== "provider") {
    return NextResponse.json(
      { error: "Set up a provider profile before listing a room." },
      { status: 403 },
    );
  }

  const parsed = listingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the listing details." },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const invalidAmenity = input.amenities.find((item) => !AMENITIES.includes(item));
  if (invalidAmenity) {
    return NextResponse.json({ error: `Unknown amenity: ${invalidAmenity}` }, { status: 400 });
  }

  const [created] = await db
    .insert(listings)
    .values({
      providerProfileId: me.id,
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
      status: "pending",
    })
    .returning();

  return NextResponse.json({ listing: created });
}
