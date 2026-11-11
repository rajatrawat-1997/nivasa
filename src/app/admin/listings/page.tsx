import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { BadgeCheck, Eye, Home } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ListingAdminActions } from "@/components/admin/listing-admin-actions";
import { Button } from "@/components/ui/button";
import { formatINR, timeAgo } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings, profiles } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin listings" };

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  paused: "bg-secondary text-muted-foreground",
  rented: "bg-[#3B82F6]/10 text-[#3B82F6]",
  rejected: "bg-destructive/10 text-destructive",
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeStatus = ["pending", "active", "paused", "rented", "rejected"].includes(status ?? "")
    ? status
    : "all";

  const rows = await db
    .select({ listing: listings, provider: profiles })
    .from(listings)
    .innerJoin(profiles, eq(listings.providerProfileId, profiles.id))
    .where(activeStatus === "all" ? undefined : eq(listings.status, activeStatus as "active"))
    .orderBy(desc(listings.createdAt))
    .limit(200);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Marketplace listings."
        description="Review new rooms, take down bad ones and feature the best places on the platform."
      />

      <div className="inline-flex flex-wrap rounded-full border border-border bg-card p-1">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "active", label: "Live" },
          { value: "paused", label: "Paused" },
          { value: "rented", label: "Rented" },
          { value: "rejected", label: "Rejected" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/listings" : `/admin/listings?status=${tab.value}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium capitalize transition-colors",
              activeStatus === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-[11.5px] text-muted-foreground">
          No listings in this view.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ listing, provider }) => (
            <article
              key={listing.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24">
                {listing.photos[0] ? (
                  <Image src={listing.photos[0]} alt="" fill sizes="96px" className="object-cover" />
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
                      "rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize",
                      statusStyles[listing.status] ?? "bg-secondary",
                    )}
                  >
                    {listing.status}
                  </span>
                  {listing.featured && (
                    <span className="rounded-full bg-[#252525] px-2 py-0.5 text-[9px] font-semibold text-white">
                      Featured
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
                    <Eye className="size-3" /> {listing.views}
                  </span>
                </div>
                <h2 className="mt-1 truncate text-[12.5px] font-semibold">{listing.title}</h2>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  {listing.locality}, {listing.city} · {formatINR(listing.rent)}/mo · by{" "}
                  {provider.name}
                  {provider.verified && <BadgeCheck className="ml-1 inline size-3 text-primary" />} ·{" "}
                  {timeAgo(listing.createdAt)}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                  {listing.description}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex gap-1.5">
                  <Button asChild variant="ghost" size="sm" className="h-7 rounded-full text-[10px]">
                    <Link href={`/rooms/${listing.id}`} target="_blank">
                      View public page
                    </Link>
                  </Button>
                </div>
                <ListingAdminActions
                  listingId={listing.id}
                  title={listing.title}
                  status={listing.status}
                  featured={listing.featured}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
