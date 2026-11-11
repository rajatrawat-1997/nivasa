import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Home, Search } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SaveListingButton } from "@/components/app/save-listing-button";
import { RoomCard } from "@/components/cards/room-card";
import { Button } from "@/components/ui/button";
import { CITIES, ROOM_TYPES } from "@/lib/constants";
import { db } from "@/lib/db";
import { getActiveListings } from "@/lib/queries";
import { savedListings } from "@/lib/schema";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Rooms" };

type SearchParams = Promise<{
  city?: string;
  roomType?: string;
  maxRent?: string;
  minRent?: string;
  q?: string;
}>;

export default async function AppRoomsPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireProfile();
  const params = await searchParams;
  const maxRent = Number(params.maxRent);
  const minRent = Number(params.minRent);

  const [results, saved] = await Promise.all([
    getActiveListings({
      city: params.city,
      roomType: params.roomType,
      maxRent: maxRent > 0 ? maxRent : undefined,
      minRent: minRent > 0 ? minRent : undefined,
      q: params.q,
    }),
    db
      .select({ listingId: savedListings.listingId })
      .from(savedListings)
      .where(eq(savedListings.profileId, profile.id)),
  ]);

  const savedIds = new Set(saved.map((row) => row.listingId));
  const hasFilters = Boolean(params.city || params.roomType || params.maxRent || params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Room marketplace"
        title="Rooms worth living in."
        description="Reviewed listings from real providers. Save the ones you like and ask the questions that matter before you visit."
        action={
          <Button asChild variant="outline" className="rounded-full bg-card">
            <Link href="/app/saved">Saved rooms</Link>
          </Button>
        }
      />

      <form
        action="/app/rooms"
        className="grid gap-2.5 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center"
      >
        <div>
          <label className="sr-only" htmlFor="rooms-q">
            Search rooms
          </label>
          <input
            id="rooms-q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by area, city or title"
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="rooms-city">
            City
          </label>
          <select
            id="rooms-city"
            name="city"
            defaultValue={params.city ?? ""}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">All cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="sr-only" htmlFor="rooms-type">
            Room type
          </label>
          <select
            id="rooms-type"
            name="roomType"
            defaultValue={params.roomType ?? ""}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">Any room type</option>
            {ROOM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="h-10 rounded-xl px-4">
          <Search className="size-4" /> Search
        </Button>
      </form>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-muted-foreground">
          {results.length} {results.length === 1 ? "room" : "rooms"} available
        </p>
        {hasFilters && (
          <Button asChild variant="ghost" size="sm" className="h-7 rounded-full text-[11px]">
            <Link href="/app/rooms">Clear filters</Link>
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No rooms match those filters"
          description="Try another city, a wider budget or a different room type. New rooms are added regularly."
          action={
            <Button asChild className="rounded-full">
              <Link href="/app/rooms">Clear filters</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((listing) => (
            <RoomCard
              key={listing.id}
              listing={listing}
              href={`/app/rooms/${listing.id}`}
              action={
                <SaveListingButton
                  listingId={listing.id}
                  initialSaved={savedIds.has(listing.id)}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
