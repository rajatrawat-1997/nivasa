import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { Inbox, MapPin, Wallet } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { InquiryStatusActions } from "@/components/app/provider/inquiry-status-actions";
import { Button } from "@/components/ui/button";
import { formatINR, timeAgo } from "@/lib/constants";
import { db } from "@/lib/db";
import { inquiries, listings, profiles } from "@/lib/schema";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Provider inquiries" };

const statusStyles: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  replied: "bg-success/10 text-success",
  closed: "bg-secondary text-muted-foreground",
};

export default async function ProviderInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "provider") redirect("/app/provider/dashboard");

  const { status } = await searchParams;
  const activeStatus = status === "replied" || status === "closed" ? status : "all";

  const ownListings = await db
    .select({ id: listings.id })
    .from(listings)
    .where(eq(listings.providerProfileId, profile.id));

  const listingIds = ownListings.map((row) => row.id);
  const rows = listingIds.length
    ? await db
        .select({ inquiry: inquiries, listing: listings, from: profiles })
        .from(inquiries)
        .innerJoin(listings, eq(inquiries.listingId, listings.id))
        .innerJoin(profiles, eq(inquiries.fromProfileId, profiles.id))
        .where(inArray(inquiries.listingId, listingIds))
        .orderBy(desc(inquiries.createdAt))
    : [];

  const filtered = activeStatus === "all" ? rows : rows.filter((row) => row.inquiry.status === activeStatus);
  const count = (value: string) =>
    value === "all" ? rows.length : rows.filter((row) => row.inquiry.status === value).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Provider space"
        title="Inquiries."
        description="People who want to see your rooms. Reply promptly — good rooms go fast."
      />

      <div className="inline-flex flex-wrap rounded-full border border-border bg-card p-1">
        {[
          { value: "all", label: `All (${count("all")})` },
          { value: "new", label: `New (${count("new")})` },
          { value: "replied", label: `Replied (${count("replied")})` },
          { value: "closed", label: `Closed (${count("closed")})` },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/app/provider/inquiries" : `/app/provider/inquiries?status=${tab.value}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-colors",
              activeStatus === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={rows.length === 0 ? "No inquiries yet" : "Nothing in this view"}
          description={
            rows.length === 0
              ? "When someone asks about one of your rooms, their message lands here."
              : "Try another status filter to see the rest of your inquiries."
          }
          action={
            <Button asChild variant="outline" className="rounded-full bg-card">
              <Link href="/app/provider/listings">Manage listings</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(({ inquiry, listing, from }) => (
            <article key={inquiry.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Link
                  href={`/app/profile?preview=${from.id}`}
                  className="relative size-10 shrink-0 overflow-hidden rounded-full bg-secondary"
                >
                  <Image src={from.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/profile?preview=${from.id}`}
                      className="text-[12.5px] font-semibold hover:text-primary"
                    >
                      {from.name}, {from.age}
                    </Link>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize",
                        statusStyles[inquiry.status],
                      )}
                    >
                      {inquiry.status}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground">
                      {timeAgo(inquiry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {from.locality || from.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="size-3" /> {formatINR(from.budgetMin)}–{formatINR(from.budgetMax)}
                    </span>
                    <span>· {from.profession || "Nivasa member"}</span>
                  </p>
                  <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-[11.5px] leading-relaxed">
                    {inquiry.message}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <InquiryStatusActions inquiryId={inquiry.id} status={inquiry.status} />
                    <Button asChild variant="ghost" size="sm" className="h-7 rounded-full text-[10.5px]">
                      <Link href={`/app/provider/listings/${listing.id}/edit`}>
                        {listing.title}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
        Email delivery for replies isn&apos;t connected in this deployment. Mark an inquiry as
        replied once you&apos;ve followed up, and keep the statuses accurate so nothing slips.
      </p>
    </div>
  );
}
