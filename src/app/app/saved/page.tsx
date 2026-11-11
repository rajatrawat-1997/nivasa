import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Bookmark, Home, MapPin, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SaveListingButton } from "@/components/app/save-listing-button";
import { SaveProfileButton } from "@/components/app/save-profile-button";
import { RoomCard } from "@/components/cards/room-card";
import { Button } from "@/components/ui/button";
import { formatINR, timeAgo } from "@/lib/constants";
import { getSavedFor } from "@/lib/queries";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Saved" };

type SearchParams = Promise<{ tab?: string }>;

export default async function SavedPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireProfile();
  const { tab } = await searchParams;
  const activeTab = tab === "rooms" ? "rooms" : "people";
  const { savedPeople, savedRooms } = await getSavedFor(profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saved"
        title="Your shortlist."
        description="People and rooms worth a second look. Saved items stay here until you remove them."
      />

      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {[
          { value: "people", label: `People (${savedPeople.length})`, href: "/app/saved" },
          { value: "rooms", label: `Rooms (${savedRooms.length})`, href: "/app/saved?tab=rooms" },
        ].map((item) => (
          <Link
            key={item.value}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-[11.5px] font-medium transition-colors",
              activeTab === item.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {activeTab === "people" ? (
        savedPeople.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved people yet"
            description="Tap the save icon on a profile in Discover to keep them here while you decide."
            action={
              <Button asChild className="rounded-full">
                <Link href="/app/discover">
                  <Sparkles className="size-4" /> Go to Discover
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {savedPeople.map(({ profile: person, savedAt }) => (
              <article
                key={person.id}
                className="flex gap-3.5 rounded-2xl border border-border bg-card p-3.5"
              >
                <Link
                  href={`/app/profile?preview=${person.id}`}
                  className="relative size-[78px] shrink-0 overflow-hidden rounded-xl bg-secondary"
                >
                  <Image
                    src={person.avatarUrl}
                    alt={person.name}
                    fill
                    sizes="78px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/app/profile?preview=${person.id}`}
                    className="flex items-center gap-1 truncate text-[12.5px] font-semibold hover:text-primary"
                  >
                    {person.name}, {person.age}
                    {person.verified && <BadgeCheck className="size-3.5 text-primary" />}
                  </Link>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {person.profession || "Nivasa member"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-muted-foreground">
                    <MapPin className="size-3" /> {person.locality || person.city}
                  </p>
                  <p className="mt-1 text-[10.5px] text-muted-foreground">
                    {formatINR(person.budgetMin)}–{formatINR(person.budgetMax)} · saved{" "}
                    {timeAgo(savedAt)}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <SaveProfileButton profileId={person.id} initialSaved />
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-full text-[11px]">
                      <Link href={`/app/profile?preview=${person.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : savedRooms.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No saved rooms yet"
          description="Browse the room marketplace and save the places you'd actually want to live in."
          action={
            <Button asChild className="rounded-full">
              <Link href="/app/rooms">Explore rooms</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {savedRooms.map(({ listing }) => (
            <RoomCard
              key={listing.id}
              listing={listing}
              href={`/app/rooms/${listing.id}`}
              action={<SaveListingButton listingId={listing.id} initialSaved />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
