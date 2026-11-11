import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import {
  ArrowRight,
  CreditCard,
  Flag,
  HeartHandshake,
  Home,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { PLANS, timeAgo } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings, matches, messages, profiles, reports, subscriptions } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    users,
    providers,
    listingCount,
    activeListings,
    pendingListings,
    matchCount,
    messageCount,
    openReports,
    activeSubs,
    recentUsers,
    pendingRows,
    openReportRows,
  ] = await Promise.all([
    db.select({ value: sql<number>`count(*)::int` }).from(profiles),
    db.select({ value: sql<number>`count(*)::int` }).from(profiles).where(eq(profiles.role, "provider")),
    db.select({ value: sql<number>`count(*)::int` }).from(listings),
    db.select({ value: sql<number>`count(*)::int` }).from(listings).where(eq(listings.status, "active")),
    db.select({ value: sql<number>`count(*)::int` }).from(listings).where(eq(listings.status, "pending")),
    db.select({ value: sql<number>`count(*)::int` }).from(matches),
    db.select({ value: sql<number>`count(*)::int` }).from(messages),
    db.select({ value: sql<number>`count(*)::int` }).from(reports).where(eq(reports.status, "open")),
    db.select({ value: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select().from(profiles).orderBy(desc(profiles.createdAt)).limit(5),
    db.select().from(listings).where(eq(listings.status, "pending")).orderBy(desc(listings.createdAt)).limit(5),
    db.select().from(reports).where(eq(reports.status, "open")).orderBy(desc(reports.createdAt)).limit(5),
  ]);

  const values = {
    users: users[0]?.value ?? 0,
    providers: providers[0]?.value ?? 0,
    listings: listingCount[0]?.value ?? 0,
    active: activeListings[0]?.value ?? 0,
    pending: pendingListings[0]?.value ?? 0,
    matches: matchCount[0]?.value ?? 0,
    messages: messageCount[0]?.value ?? 0,
    reports: openReports[0]?.value ?? 0,
    subs: activeSubs[0]?.value ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview."
        description="The health of the marketplace at a glance — people, listings, safety and revenue."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Members" value={values.users} hint={`${values.providers} providers`} icon={Users} />
        <StatCard label="Listings" value={values.listings} hint={`${values.active} live · ${values.pending} pending`} icon={Home} />
        <StatCard label="Matches" value={values.matches} hint={`${values.messages} messages sent`} icon={HeartHandshake} />
        <StatCard label="Open reports" value={values.reports} hint="Needs review" icon={Flag} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Pending listings</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[11px]">
              <Link href="/admin/listings">
                Review all <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
          {pendingRows.length === 0 ? (
            <p className="px-5 py-8 text-center text-[11.5px] text-muted-foreground">
              Nothing waiting for review.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pendingRows.map((listing) => (
                <li key={listing.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium">{listing.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {listing.locality}, {listing.city} · listed {timeAgo(listing.createdAt)}
                    </p>
                  </div>
                  <Button asChild size="sm" className="h-7 rounded-full text-[10.5px]">
                    <Link href={`/admin/listings?status=pending`}>Review</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Open reports</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[11px]">
              <Link href="/admin/reports">
                Open queue <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
          {openReportRows.length === 0 ? (
            <p className="px-5 py-8 text-center text-[11.5px] text-muted-foreground">
              No open reports. Keep it that way.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {openReportRows.map((report) => (
                <li key={report.id} className="px-5 py-3">
                  <p className="text-[12px] font-medium">{report.reason}</p>
                  <p className="line-clamp-1 text-[10.5px] text-muted-foreground">
                    {report.targetType} · {report.details || "No extra details"} ·{" "}
                    {timeAgo(report.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Newest members</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[11px]">
              <Link href="/admin/users">
                All users <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {recentUsers.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium">
                    {person.name}, {person.age}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {person.profession || "Member"} · {person.city}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize",
                    person.role === "provider"
                      ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {person.role}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.02em]">
            <CreditCard className="size-4 text-primary" /> Subscriptions
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            {values.subs} active subscription{values.subs === 1 ? "" : "s"}. Card payments are not
            connected in this deployment, so plans on this platform are manual grants — never
            automatic charges.
          </p>
          <p className="mt-3 font-display text-[22px] font-extrabold tracking-[-0.04em]">
            ₹{PLANS.plus.price.toLocaleString("en-IN")}
            <span className="ml-1 text-[10.5px] font-medium text-muted-foreground">
              / month · Plus list price
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full bg-card">
              <Link href="/admin/subscriptions">View subscriptions</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/settings">
                <ShieldCheck className="size-3.5" /> Platform settings
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <MessageCircle className="size-3" /> Data reflects the live database. Seeded demo accounts
        are labelled in the users table.
      </p>
    </div>
  );
}
