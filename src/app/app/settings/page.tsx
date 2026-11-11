import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { BadgeCheck, Bell, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { SettingsAccount } from "@/components/app/settings-account";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { blockedUsers, profiles } from "@/lib/schema";
import { getSession, requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireProfile();
  const session = await getSession();
  const blocked = await db
    .select({ id: blockedUsers.id, profile: profiles })
    .from(blockedUsers)
    .innerJoin(profiles, eq(blockedUsers.blockedProfileId, profiles.id))
    .where(eq(blockedUsers.profileId, profile.id))
    .orderBy(desc(blockedUsers.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Account and privacy."
        description="Control what you share, who can reach you and what happens to your data."
      />

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Account</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">Name</dt>
            <dd className="mt-0.5 flex items-center gap-1 text-[12px] font-medium">
              {profile.name}
              {profile.verified && <BadgeCheck className="size-3.5 text-primary" />}
            </dd>
          </div>
          <div>
            <dt className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">Email</dt>
            <dd className="mt-0.5 text-[12px] font-medium">{session?.user.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">Member since</dt>
            <dd className="mt-0.5 text-[12px] font-medium">{formatDate(profile.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">Plan</dt>
            <dd className="mt-0.5 text-[12px] font-medium capitalize">
              {profile.plan === "plus" ? "Nivasa Plus" : profile.plan === "provider" ? "Provider Pro" : "Free"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full bg-card">
            <Link href="/app/profile/edit">Edit profile</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/app/preferences">Preferences</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/forgot-password">Reset password</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.02em]">
          <ShieldCheck className="size-4 text-success" /> Privacy
        </h2>
        <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          <li>Your full address and phone number are never shown on your public profile.</li>
          <li>Only people you match with can send you messages, and you can unmatch or block at any time.</li>
          <li>Providers only see the inquiry message you choose to send — never your contact details.</li>
        </ul>
        <Button asChild variant="ghost" size="sm" className="mt-2 rounded-full px-0 text-[11.5px]">
          <Link href="/privacy">Read the privacy policy</Link>
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.02em]">
          <Bell className="size-4 text-primary" /> Notifications
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          In-app notifications are always on for matches, messages, likes and inquiries. Email
          delivery is handled by a notification provider that isn&apos;t connected in this
          deployment yet, so Nivasa never claims to have emailed you.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3 rounded-full bg-card">
          <Link href="/app/notifications">View notifications</Link>
        </Button>
      </section>

      <SettingsAccount
        blocked={blocked.map((row) => ({
          id: row.id,
          profileId: row.profile.id,
          name: row.profile.name,
          avatarUrl: row.profile.avatarUrl,
        }))}
      />
    </div>
  );
}
