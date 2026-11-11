import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Check,
  Home,
  MapPin,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { InquiryDialog } from "@/components/app/inquiry-dialog";
import { SaveListingButton } from "@/components/app/save-listing-button";
import { RoomCard } from "@/components/cards/room-card";
import { Gallery } from "@/components/rooms/gallery";
import { formatINR } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings, profiles, savedListings } from "@/lib/schema";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Room details" };

const roomLabels: Record<string, string> = {
  "private-room": "Private room",
  "shared-room": "Shared room",
  "entire-flat": "Entire flat",
  studio: "Studio",
};

const propertyLabels: Record<string, string> = {
  apartment: "Apartment",
  "independent-house": "Independent house",
  villa: "Villa",
  pg: "PG / Co-living",
};

const furnishingLabels: Record<string, string> = {
  furnished: "Fully furnished",
  "semi-furnished": "Semi-furnished",
  unfurnished: "Unfurnished",
};

export default async function AppRoomDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const profile = await requireProfile();
  const { listingId } = await params;

  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) notFound();

  const [provider] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, listing.providerProfileId))
    .limit(1);

  const [saved, similar] = await Promise.all([
    db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.profileId, profile.id),
          eq(savedListings.listingId, listing.id),
        ),
      )
      .limit(1),
    db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.city, listing.city),
          eq(listings.status, "active"),
          ne(listings.id, listing.id),
        ),
      )
      .limit(3),
  ]);

  if (listing.status === "active") {
    await db
      .update(listings)
      .set({ views: listing.views + 1 })
      .where(eq(listings.id, listing.id));
  }

  return (
    <div className="space-y-6">
      <Link
        href="/app/rooms"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All rooms
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {listing.verified && (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[10.5px] font-semibold text-success">
                <BadgeCheck className="size-3.5" /> Verified listing
              </span>
            )}
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium">
              {roomLabels[listing.roomType] ?? listing.roomType}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium">
              {propertyLabels[listing.propertyType] ?? listing.propertyType}
            </span>
            {listing.status !== "active" && (
              <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[10.5px] font-semibold capitalize text-warning">
                {listing.status}
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-[1.7rem] font-extrabold leading-[1.15] tracking-[-0.045em] sm:text-[2.1rem]">
            {listing.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="size-4" /> {listing.locality}, {listing.city}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="sm:text-right">
            <p className="font-display text-[26px] font-extrabold tracking-[-0.04em]">
              {formatINR(listing.rent)}
              <span className="text-[11px] font-medium text-muted-foreground"> / month</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatINR(listing.deposit)} deposit
            </p>
          </div>
          <SaveListingButton
            listingId={listing.id}
            initialSaved={saved.length > 0}
            variant="full"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <Gallery photos={listing.photos} title={listing.title} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Room type", value: roomLabels[listing.roomType] ?? listing.roomType, icon: BedDouble },
              { label: "Furnishing", value: furnishingLabels[listing.furnishing] ?? listing.furnishing, icon: Home },
              { label: "Occupancy", value: `${listing.occupancy} ${listing.occupancy === 1 ? "person" : "people"}`, icon: Users },
              { label: "Available", value: listing.availableFrom, icon: CalendarDays },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3.5">
                <Icon className="size-4 text-primary" />
                <p className="mt-2 text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-0.5 text-[11.5px] font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">About this room</h2>
            <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-muted-foreground">
              {listing.description || "The provider hasn't added a description yet."}
            </p>
          </section>

          {listing.amenities.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">What's included</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                    <span className="flex size-4 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {listing.houseRules.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">House rules</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[11.5px] text-muted-foreground">
                {listing.houseRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-1.5 font-display text-[16px] font-bold tracking-[-0.02em]">
              <MapPin className="size-4 text-primary" /> Location
            </h2>
            <div className="mt-3 flex aspect-[16/7] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/50">
              <div className="text-center">
                <MapPin className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-1.5 text-[11.5px] font-medium">{listing.locality}, {listing.city}</p>
                <p className="text-[10px] text-muted-foreground">
                  The exact address is shared after the provider replies.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Listed by
              </p>
              <div className="mt-3 flex items-center gap-3">
                {provider && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={provider.avatarUrl}
                    alt={provider.name}
                    className="size-11 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold">
                    {provider?.name ?? "Nivasa provider"}
                    {provider?.verified && <BadgeCheck className="size-3.5 text-success" />}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {provider?.role === "provider" ? "Property provider" : "Room provider"}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-[11.5px] leading-relaxed text-muted-foreground">
                {provider?.bio}
              </p>
              <div className="mt-4">
                <InquiryDialog
                  listingId={listing.id}
                  listingTitle={listing.title}
                  providerName={provider?.name ?? "the provider"}
                />
              </div>
              <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3 shrink-0 text-success" />
                Your phone number and email are never shared automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Wallet className="size-3.5 text-primary" /> Monthly cost
              </p>
              <dl className="mt-2.5 space-y-1.5 text-[11.5px]">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Rent</dt>
                  <dd className="font-semibold">{formatINR(listing.rent)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Deposit</dt>
                  <dd className="font-semibold">{formatINR(listing.deposit)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5">
                  <dt className="text-muted-foreground">Move-in total</dt>
                  <dd className="font-bold">{formatINR(listing.rent + listing.deposit)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pt-2">
          <h2 className="mb-3 font-display text-[17px] font-bold tracking-[-0.02em]">
            More rooms in {listing.city}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {similar.map((room) => (
              <RoomCard key={room.id} listing={room} href={`/app/rooms/${room.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
