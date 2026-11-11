import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Home, Pencil, Plus } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { ListingActions } from "@/components/app/provider/listing-actions";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Provider listings" };

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  paused: "bg-secondary text-muted-foreground",
  rented: "bg-[#3B82F6]/10 text-[#3B82F6]",
  rejected: "bg-destructive/10 text-destructive",
};

export default async function ProviderListingsPage() {
  const profile = await requireProfile();
  if (profile.role !== "provider") redirect("/app/provider/dashboard");

  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.providerProfileId, profile.id))
    .orderBy(desc(listings.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Provider space"
        title="Your listings."
        description="Keep availability accurate, pause rooms that are taken and update details when things change."
        action={
          <Button asChild className="rounded-full">
            <Link href="/app/provider/listings/create">
              <Plus className="size-4" /> List a room
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No listings yet"
          description="Publish your first room. New listings are reviewed by a Nivasa admin before they appear publicly."
          action={
            <Button asChild className="rounded-full">
              <Link href="/app/provider/listings/create">List your first room</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((listing) => (
            <article
              key={listing.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24">
                {listing.photos[0] ? (
                  <Image
                    src={listing.photos[0]}
                    alt={listing.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <Home className="size-5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize",
                      statusStyles[listing.status] ?? "bg-secondary",
                    )}
                  >
                    {listing.status}
                  </span>
                  {listing.featured && (
                    <span className="rounded-full bg-[#252525] px-2 py-0.5 text-[9.5px] font-semibold text-white">
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="mt-1 truncate font-display text-[14px] font-bold tracking-[-0.02em]">
                  {listing.title}
                </h2>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  {listing.locality}, {listing.city} · {formatINR(listing.rent)}/month ·{" "}
                  {listing.views} views · listed {formatDate(listing.createdAt)}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Available from {formatDate(listing.availableFrom)}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <Button asChild variant="outline" size="sm" className="h-7 rounded-full bg-card text-[10.5px]">
                  <Link href={`/app/provider/listings/${listing.id}/edit`}>
                    <Pencil className="size-3" /> Edit
                  </Link>
                </Button>
                <ListingActions
                  listingId={listing.id}
                  title={listing.title}
                  status={listing.status}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {rows.some((row) => row.status === "pending") && (
        <p className="rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-2.5 text-[11px] text-muted-foreground">
          Listings marked <strong>pending</strong> are waiting for admin review. You can still edit
          the details while they wait.
        </p>
      )}
    </div>
  );
}
