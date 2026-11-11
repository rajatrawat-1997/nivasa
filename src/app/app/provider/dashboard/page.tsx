import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { ArrowRight, Building2, Eye, Home, Inbox, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ProviderActivateButton } from "@/components/app/provider/activate-button";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { formatINR, timeAgo } from "@/lib/constants";
import { db } from "@/lib/db";
import { inquiries, listings, profiles } from "@/lib/schema";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Provider dashboard" };

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  paused: "bg-secondary text-muted-foreground",
  rented: "bg-[#3B82F6]/10 text-[#3B82F6]",
  rejected: "bg-destructive/10 text-destructive",
};

export default async function ProviderDashboardPage() {
  const profile = await requireProfile();

  if (profile.role !== "provider") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Provider space"
          title="Have a room to fill?"
          description="List it on Nivasa, review interested people and choose a flatmate who actually fits the home."
        />
        <section className="relative overflow-hidden rounded-2xl bg-[#252525] p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/25 blur-3xl" />
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
            <Building2 className="size-5 text-[#F9B4A9]" />
          </span>
          <h2 className="mt-4 font-display text-[24px] font-extrabold tracking-[-0.04em]">
            Become a Nivasa provider
          </h2>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-white/60">
            Set up a provider profile to publish rooms, manage inquiries and see how people find
            your listing. New listings go through a short review before they&apos;re public.
          </p>
          <div className="mt-5">
            <ProviderActivateButton />
          </div>
          <p className="mt-3 text-[10.5px] text-white/45">
            Provider Pro billing isn&apos;t connected in this deployment. Listing rooms is free
            while payments are off — no charge is made.
          </p>
        </section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Home, title: "List in minutes", body: "Photos, rent, house rules and who the room suits." },
            { icon: Inbox, title: "Real inquiries", body: "Interested people message you from the listing page." },
            { icon: Eye, title: "Know your reach", body: "See views and inquiries on every listing." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-4">
              <Icon className="size-4 text-primary" />
              <p className="mt-2 text-[12.5px] font-semibold">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.providerProfileId, profile.id))
    .orderBy(desc(listings.createdAt));

  const listingIds = rows.map((row) => row.id);
  const inquiryRows = listingIds.length
    ? await db
        .select({ inquiry: inquiries, listing: listings, from: profiles })
        .from(inquiries)
        .innerJoin(listings, eq(inquiries.listingId, listings.id))
        .innerJoin(profiles, eq(inquiries.fromProfileId, profiles.id))
        .where(inArray(inquiries.listingId, listingIds))
        .orderBy(desc(inquiries.createdAt))
        .limit(5)
    : [];

  const [newCount] = listingIds.length
    ? await db
        .select({ value: sql<number>`count(*)::int` })
        .from(inquiries)
        .where(and(inArray(inquiries.listingId, listingIds), eq(inquiries.status, "new")))
    : [{ value: 0 }];

  const active = rows.filter((row) => row.status === "active").length;
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Provider space"
        title="Your rooms."
        description="Manage listings, respond to inquiries and keep availability accurate."
        action={
          <Button asChild className="rounded-full">
            <Link href="/app/provider/listings/create">
              <Home className="size-4" /> List a room
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Listings" value={rows.length} hint={`${active} live`} icon={Home} />
        <StatCard label="Total views" value={totalViews} hint="Across all listings" icon={Eye} />
        <StatCard label="Inquiries" value={inquiryRows.length ? newCount?.value ?? 0 : 0} hint="Waiting for a reply" icon={Inbox} />
        <StatCard
          label="Featured"
          value={rows.filter((row) => row.featured).length}
          hint="Featured placements"
          icon={Sparkles}
        />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Your listings</h2>
            <p className="text-[11px] text-muted-foreground">Status and performance at a glance.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full text-[11.5px]">
            <Link href="/app/provider/listings">
              Manage all <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[12.5px] font-medium">No listings yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Publish your first room and start receiving inquiries.
            </p>
            <Button asChild size="sm" className="mt-4 rounded-full">
              <Link href="/app/provider/listings/create">List a room</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.slice(0, 5).map((listing) => (
              <li key={listing.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/app/provider/listings/${listing.id}/edit`}
                    className="truncate text-[12px] font-semibold hover:text-primary"
                  >
                    {listing.title}
                  </Link>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    {listing.locality}, {listing.city} · {formatINR(listing.rent)}/mo ·{" "}
                    {listing.views} views
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize",
                    statusStyles[listing.status] ?? "bg-secondary",
                  )}
                >
                  {listing.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Recent inquiries</h2>
            <p className="text-[11px] text-muted-foreground">People who want to see your room.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full text-[11.5px]">
            <Link href="/app/provider/inquiries">
              Open inbox <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
        {inquiryRows.length === 0 ? (
          <p className="px-5 py-8 text-center text-[11.5px] text-muted-foreground">
            No inquiries yet. Approved, complete listings get more interest.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {inquiryRows.map(({ inquiry, listing, from }) => (
              <li key={inquiry.id} className="flex items-start gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold">
                    {from.name}, {from.age}{" "}
                    <span className="font-normal text-muted-foreground">about {listing.title}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {inquiry.message}
                  </p>
                </div>
                <span className="shrink-0 text-[9.5px] text-muted-foreground">
                  {timeAgo(inquiry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
