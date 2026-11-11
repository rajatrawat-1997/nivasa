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
  Flag,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { RoomCard } from "@/components/cards/room-card";
import { Gallery } from "@/components/rooms/gallery";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings, profiles } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingId: string }>;
}): Promise<Metadata> {
  const { listingId } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) return { title: "Room not found" };
  return {
    title: listing.title,
    description: `${listing.locality}, ${listing.city} · ${formatINR(listing.rent)}/month. ${listing.description.slice(0, 120)}`,
  };
}

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

export default async function PublicRoomDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!listing) notFound();

  const [provider] = await db.select().from(profiles).where(eq(profiles.id, listing.providerProfileId)).limit(1);
  const similar = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.city, listing.city),
        eq(listings.status, "active"),
        ne(listings.id, listing.id),
      ),
    )
    .limit(3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All rooms
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
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
          </div>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-[2.4rem]">
            {listing.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
            <MapPin className="size-4" /> {listing.locality}, {listing.city}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="font-display text-[28px] font-extrabold tracking-[-0.04em]">
            {formatINR(listing.rent)}
            <span className="text-[12px] font-medium text-muted-foreground"> / month</span>
          </p>
          <p className="text-[12px] text-muted-foreground">
            {formatINR(listing.deposit)} security deposit
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1.65fr_0.85fr]">
        <div>
          <Gallery photos={listing.photos} title={listing.title} />

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: BedDouble, label: "Room", value: roomLabels[listing.roomType] ?? listing.roomType },
              { icon: Users, label: "Occupancy", value: `${listing.occupancy} person` },
              { icon: Wallet, label: "Furnishing", value: listing.furnishing.replace("-", " ") },
              { icon: CalendarDays, label: "Available", value: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(listing.availableFrom)) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4">
                <Icon className="size-4 text-primary" />
                <p className="mt-2 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-[12.5px] font-semibold capitalize">{value}</p>
              </div>
            ))}
          </div>

          <section className="mt-9">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.025em]">About this space</h2>
            <p className="mt-3 whitespace-pre-line text-[13.5px] leading-[1.8] text-muted-foreground">
              {listing.description}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.025em]">What this place offers</h2>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {listing.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2.5 rounded-xl bg-card px-3.5 py-2.5 text-[12.5px]">
                  <Check className="size-3.5 text-success" /> {amenity}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.025em]">House rules</h2>
            <ul className="mt-3 space-y-2">
              {listing.houseRules.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {rule}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-[20px] font-bold tracking-[-0.025em]">Where you&apos;ll live</h2>
            <div className="relative mt-3 h-56 overflow-hidden rounded-2xl border border-border bg-[#EBE6DE]">
              <div className="absolute inset-0 grain opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                  <MapPin className="size-5" />
                </span>
                <p className="mt-3 text-[13.5px] font-semibold">{listing.locality}, {listing.city}</p>
                <p className="mt-1 max-w-xs text-[11.5px] text-muted-foreground">
                  The exact address is shared by the provider after you inquire.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Listed by
              </p>
              <div className="mt-3 flex items-center gap-3">
                {provider && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={provider.avatarUrl} alt={provider.name} className="size-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="flex items-center gap-1.5 text-[14px] font-semibold">
                    {provider?.name ?? "Nivasa provider"}
                    {provider?.verified && <BadgeCheck className="size-4 text-success" />}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {provider?.role === "provider" ? "Property provider" : "Room provider"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                {provider?.bio}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild className="rounded-xl">
                  <Link href={`/login?redirectTo=/app/rooms/${listing.id}`}>Inquire</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl bg-card">
                  <Link href={`/login?redirectTo=/app/rooms/${listing.id}`}>Save</Link>
                </Button>
              </div>
              <p className="mt-3 text-center text-[10.5px] text-muted-foreground">
                Sign in to message the provider safely.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold">
                <ShieldCheck className="size-4 text-success" /> Stay safe
              </p>
              <ul className="mt-2.5 space-y-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                <li>Visit the room before paying any deposit.</li>
                <li>Never send money before signing an agreement.</li>
                <li>Report anything that feels off.</li>
              </ul>
              <Button asChild variant="link" className="mt-1 h-auto px-0 text-[11.5px]">
                <Link href="/safety">
                  <Flag className="size-3" /> Read safety guidance
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl bg-brand-soft p-5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold">
                <Sparkles className="size-3.5 text-primary" /> Looking for a person, not just a room?
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                Nivasa can match you with a compatible roommate first. Then you
                find the place together.
              </p>
              <Button asChild variant="link" className="mt-1 h-auto px-0 text-[11.5px]">
                <Link href="/explore">Discover roommates</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.035em]">
            More rooms in {listing.city}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((room) => (
              <RoomCard key={room.id} listing={room} href={`/rooms/${room.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
