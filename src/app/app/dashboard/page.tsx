import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Compass,
  Heart,
  HeartHandshake,
  Home,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { formatDate, timeAgo } from "@/lib/constants";
import { getLikeAllowance } from "@/lib/entitlements";
import {
  getConversationsFor,
  getDashboardStats,
  getLikesReceived,
  getMatchesFor,
} from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();

  const [stats, matches, likes, conversations, allowance] = await Promise.all([
    getDashboardStats(profile.id),
    getMatchesFor(profile.id),
    getLikesReceived(profile.id),
    getConversationsFor(profile.id),
    getLikeAllowance(profile),
  ]);

  const firstName = profile.name.split(" ")[0];
  const newLikes = likes.filter((like) => !like.isMutual);
  const unreadTotal = conversations.reduce((sum, item) => sum + item.unread, 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your Nivasa"
        title={`Welcome back, ${firstName}.`}
        description={
          newLikes.length > 0
            ? `${newLikes.length} ${newLikes.length === 1 ? "person is" : "people are"} waiting to hear from you. Keep the momentum going.`
            : "Your matches, conversations and saved rooms — all in one place."
        }
        action={
          <Button asChild className="rounded-full">
            <Link href="/app/discover">
              <Compass className="size-4" /> Start discovering
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="New likes"
          value={stats.likesReceived}
          hint={newLikes.length > 0 ? `${newLikes.length} not matched yet` : "No new likes"}
          icon={Heart}
        />
        <StatCard
          label="Matches"
          value={stats.matches}
          hint={stats.matches === 0 ? "Your first match is close" : "People who said yes back"}
          icon={HeartHandshake}
        />
        <StatCard
          label="Unread messages"
          value={unreadTotal}
          hint={unreadTotal === 0 ? "You're all caught up" : "Reply while it's fresh"}
          icon={MessageCircle}
        />
        <StatCard
          label="Likes left today"
          value={allowance.unlimited ? "Unlimited" : allowance.remaining}
          hint={allowance.unlimited ? "Nivasa Plus is active" : `${allowance.used} of ${allowance.limit} used`}
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">New matches</h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                You both swiped right. Start with a real question.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[11.5px]">
              <Link href="/app/matches">
                View all <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              className="mt-4 border-0 bg-transparent py-8"
              icon={HeartHandshake}
              title="No matches yet"
              description="When someone you liked likes you back, they'll appear here with a conversation ready to go."
              action={
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/app/discover">Find people</Link>
                </Button>
              }
            />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {matches.slice(0, 3).map((match) => (
                <Link
                  key={match.matchId}
                  href={
                    match.conversationId
                      ? `/app/messages/${match.conversationId}`
                      : "/app/matches"
                  }
                  className="group relative overflow-hidden rounded-2xl border border-border bg-secondary"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={match.profile.avatarUrl}
                      alt={match.profile.name}
                      fill
                      sizes="(max-width: 768px) 40vw, 240px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#252525]">
                      {match.compatibility}%
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-[12.5px] font-semibold leading-tight">
                        {match.profile.name.split(" ")[0]}, {match.profile.age}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-white/70">
                        {match.profile.locality || match.profile.city}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">Conversations</h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">Pick up where you left off.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[11.5px]">
              <Link href="/app/messages">
                Inbox <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          {conversations.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <MessageCircle className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-[12px] font-medium">No conversations yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Match with someone to unlock messaging.
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {conversations.slice(0, 4).map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/app/messages/${conversation.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-secondary">
                      <Image
                        src={conversation.profile.avatarUrl}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[12px] font-semibold">
                          {conversation.profile.name}
                        </p>
                        <span className="shrink-0 text-[9.5px] text-muted-foreground">
                          {timeAgo(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[11px] text-muted-foreground">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-full border border-border bg-secondary">
              <Image src={profile.avatarUrl} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate font-display text-[14px] font-bold">
                {profile.name}
                {profile.verified && <BadgeCheck className="size-3.5 text-primary" />}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {profile.profession || "Nivasa member"} · {profile.city}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-xl bg-secondary/60 px-3 py-2">
              <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Budget</p>
              <p className="mt-0.5 font-semibold">
                ₹{(profile.budgetMin / 1000).toFixed(0)}k–₹{(profile.budgetMax / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="rounded-xl bg-secondary/60 px-3 py-2">
              <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Move-in</p>
              <p className="mt-0.5 flex items-center gap-1 font-semibold">
                <CalendarDays className="size-3" />
                {profile.moveInDate ? formatDate(profile.moveInDate) : "Flexible"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-full bg-card">
              <Link href="/app/profile">Edit profile</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <Link href="/app/preferences">Preferences</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">Quick actions</h2>
          <ul className="mt-3 space-y-1">
            {[
              { href: "/app/discover", label: "Discover new people", icon: Compass },
              { href: "/app/rooms", label: "Browse available rooms", icon: Home },
              { href: "/app/saved", label: "See your saved list", icon: Bookmark },
              { href: "/app/messages", label: "Open your inbox", icon: MessageCircle },
            ].map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 text-[12px] font-medium transition-colors hover:bg-secondary"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  {label}
                  <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-[#252525] p-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/25 blur-3xl" />
          <Sparkles className="size-5 text-[#F9B4A9]" />
          <h2 className="mt-3 font-display text-[17px] font-bold tracking-[-0.02em]">
            {profile.plan === "plus" ? "Plus is working for you" : "See who liked you"}
          </h2>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/60">
            {profile.plan === "plus"
              ? "You have unlimited likes, Super Likes and full compatibility insights. Make them count."
              : "Nivasa Plus reveals every like, unlocks unlimited likes and shows the full compatibility breakdown."}
          </p>
          <Button
            asChild
            className="mt-4 h-9 rounded-full bg-white text-[#252525] hover:bg-white/90"
          >
            <Link href="/app/subscription">
              {profile.plan === "plus" ? "Manage plan" : "Explore Nivasa Plus"}
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
