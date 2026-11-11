import type { Metadata } from "next";
import { gte } from "drizzle-orm";

import { PageHeader } from "@/components/app/page-header";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { StatCard } from "@/components/app/stat-card";
import { db } from "@/lib/db";
import { matches, messages, profiles } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { Home, MessageCircle, Users } from "lucide-react";

export const metadata: Metadata = { title: "Admin analytics" };

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
}

function buildSeries(rows: { createdAt: Date }[], days = 14) {
  const series: { day: string; count: number }[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    series.push({ day: dayKey(date), count: 0 });
  }
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (const row of rows) {
    if (row.createdAt < start) continue;
    const key = dayKey(row.createdAt);
    const bucket = series.find((item) => item.day === key);
    if (bucket) bucket.count += 1;
  }
  return series;
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 13);

  const [allProfiles, recentMatches, recentMessages, allListings] = await Promise.all([
    db.select({ createdAt: profiles.createdAt, city: profiles.city }).from(profiles),
    db.select({ createdAt: matches.createdAt }).from(matches).where(gte(matches.createdAt, start)),
    db.select({ createdAt: messages.createdAt }).from(messages).where(gte(messages.createdAt, start)),
    db.select({ createdAt: profiles.createdAt }).from(profiles),
  ]);

  const signups = buildSeries(allProfiles);
  const matchesSeries = buildSeries(recentMatches);

  const cityMap = new Map<string, number>();
  for (const row of allProfiles) {
    cityMap.set(row.city, (cityMap.get(row.city) ?? 0) + 1);
  }
  const cities = [...cityMap.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  const lastSeven = signups.slice(-7).reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Platform analytics."
        description="A factual view of growth and engagement. No vanity metrics — every number comes from the database."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total members" value={allProfiles.length} icon={Users} />
        <StatCard label="New this week" value={lastSeven} hint="Profile signups" icon={Users} />
        <StatCard label="Matches (14d)" value={recentMatches.length} icon={Home} />
        <StatCard label="Messages (14d)" value={recentMessages.length} icon={MessageCircle} />
      </div>

      <AnalyticsCharts signups={signups} cities={cities} matches={matchesSeries} />

      <p className="text-[10px] text-muted-foreground">
        Analytics reflect live data from {allListings.length} profiles and activity in the last 14
        days. Seeded demo accounts are included.
      </p>
    </div>
  );
}
