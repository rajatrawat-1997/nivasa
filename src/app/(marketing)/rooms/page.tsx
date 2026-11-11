import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, lte } from "drizzle-orm";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

import { RoomCard } from "@/components/cards/room-card";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { CITIES, ROOM_TYPES } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Explore rooms",
  description:
    "Browse verified rooms and shared apartments across Bengaluru, Mumbai, Pune, Delhi, Hyderabad and more.",
};

export const dynamic = "force-dynamic";

export default async function PublicRoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; roomType?: string; maxRent?: string }>;
}) {
  const { city, roomType, maxRent } = await searchParams;
  const rentLimit = Number(maxRent);

  const rows = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.status, "active"),
        city && CITIES.includes(city) ? eq(listings.city, city) : undefined,
        roomType && ROOM_TYPES.some((type) => type.value === roomType)
          ? eq(listings.roomType, roomType)
          : undefined,
        rentLimit > 0 ? lte(listings.rent, rentLimit) : undefined,
      ),
    );
  const results = rows.sort((a, b) => Number(b.featured) - Number(a.featured) || a.rent - b.rent);

  return (
    <>
      <PageHero
        eyebrow="Room marketplace"
        title={
          <>
            Rooms with <span className="text-primary">real people</span> behind them.
          </>
        }
        description="Every listing is reviewed before it goes live. See honest photos, clear pricing and the provider you'd be living with."
        primary={{ label: "Find a roommate instead", href: "/explore" }}
      />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <form
          action="/rooms"
          className="grid gap-3 rounded-2xl border border-border bg-card p-3.5 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-center"
        >
          <span className="flex items-center gap-2 px-2 text-[12px] font-medium text-muted-foreground">
            <SlidersHorizontal className="size-4" /> Filter
          </span>
          <div>
            <label className="sr-only" htmlFor="city">
              City
            </label>
            <select
              id="city"
              name="city"
              defaultValue={city ?? ""}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">All cities</option>
              {CITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="roomType">
              Room type
            </label>
            <select
              id="roomType"
              name="roomType"
              defaultValue={roomType ?? ""}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Any room type</option>
              {ROOM_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="maxRent">
              Maximum rent
            </label>
            <select
              id="maxRent"
              name="maxRent"
              defaultValue={maxRent ?? ""}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Any budget</option>
              <option value="15000">Under ₹15,000</option>
              <option value="20000">Under ₹20,000</option>
              <option value="30000">Under ₹30,000</option>
              <option value="50000">Under ₹50,000</option>
            </select>
          </div>
          <Button type="submit" className="h-10 rounded-xl px-5">
            <Search className="size-4" /> Search
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            {results.length} {results.length === 1 ? "room" : "rooms"} available
          </p>
          <Button asChild variant="link" className="h-auto px-0 text-[12.5px]">
            <Link href="/app/rooms">
              Open in the app <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="font-display text-xl font-bold">No rooms match those filters</h2>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
              Try widening your budget or exploring another city. New rooms are
              added every week.
            </p>
            <Button asChild variant="outline" className="mt-5 rounded-full bg-card">
              <Link href="/rooms">Clear filters</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((listing) => (
              <RoomCard
                key={listing.id}
                listing={listing}
                href={`/rooms/${listing.id}`}
              />
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
              Have a room to fill?
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              List it free, review interested people and choose the right flatmate.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/signup?role=provider">List your room</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
