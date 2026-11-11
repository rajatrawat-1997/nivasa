import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart, Lock, MessageCircle, Sparkles, Star } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { LikeBackButton } from "@/components/app/like-back-button";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { formatINR, timeAgo } from "@/lib/constants";
import { getLikesReceived, getLikesSent } from "@/lib/queries";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Likes" };

type SearchParams = Promise<{ tab?: string }>;

export default async function LikesPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireProfile();
  const { tab } = await searchParams;
  const activeTab = tab === "sent" ? "sent" : "received";

  const [received, sent] = await Promise.all([
    getLikesReceived(profile.id),
    getLikesSent(profile.id),
  ]);

  const isPlus = profile.plan === "plus";
  const visibleReceived = isPlus ? received : received.filter((like) => like.isMutual);
  const lockedCount = received.length - visibleReceived.length;
  const items = activeTab === "received" ? visibleReceived : sent;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Likes"
        title="Who's interested."
        description="Every like is a person who read your profile and thought you'd fit. Be deliberate about who you choose back."
        action={
          !isPlus && lockedCount > 0 ? (
            <Button asChild className="rounded-full">
              <Link href="/app/subscription">
                <Sparkles className="size-4" /> Unlock {lockedCount} likes
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {[
          { value: "received", label: `Received (${received.length})` },
          { value: "sent", label: `Sent (${sent.length})` },
        ].map((item) => (
          <Link
            key={item.value}
            href={`/app/likes?tab=${item.value}`}
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

      {!isPlus && lockedCount > 0 && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            <Lock className="size-3.5" /> {lockedCount} {lockedCount === 1 ? "like" : "likes"} hidden
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {received
              .filter((like) => !like.isMutual)
              .slice(0, 3)
              .map((like) => (
                <div
                  key={like.profile.id}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-secondary"
                >
                  <Image
                    src={like.profile.avatarUrl}
                    alt=""
                    fill
                    sizes="200px"
                    className="scale-110 object-cover blur-lg brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="size-5 text-white/80" />
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[11.5px] text-muted-foreground">
              Nivasa Plus reveals everyone who liked you, so you never miss a fit.
            </p>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/app/subscription">See Nivasa Plus</Link>
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={activeTab === "received" ? Heart : Sparkles}
          title={activeTab === "received" ? "No likes yet" : "You haven't liked anyone yet"}
          description={
            activeTab === "received"
              ? "Keep discovering people who match how you live. Mutual likes will land here."
              : "Your likes appear here with their status. When someone likes you back, it becomes a match."
          }
          action={
            <Button asChild className="rounded-full">
              <Link href="/app/discover">Go to Discover</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={`${item.profile.id}-${item.createdAt}`}
              className="flex gap-3.5 rounded-2xl border border-border bg-card p-3.5"
            >
              <Link
                href={`/app/profile?preview=${item.profile.id}`}
                className="relative size-[74px] shrink-0 overflow-hidden rounded-xl bg-secondary"
              >
                <Image
                  src={item.profile.avatarUrl}
                  alt={item.profile.name}
                  fill
                  sizes="74px"
                  className="object-cover"
                />
                {item.action === "superlike" && (
                  <span className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-[#E6A23C] text-white">
                    <Star className="size-3" fill="currentColor" />
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/app/profile?preview=${item.profile.id}`}
                      className="flex items-center gap-1 truncate text-[13px] font-semibold hover:text-primary"
                    >
                      {item.profile.name}, {item.profile.age}
                      {item.profile.verified && <BadgeCheck className="size-3.5 text-primary" />}
                    </Link>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {item.profile.profession || "Nivasa member"} · {item.profile.city}
                    </p>
                  </div>
                  <span className="shrink-0 text-[9.5px] text-muted-foreground">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>

                <p className="mt-1.5 text-[10.5px] text-muted-foreground">
                  {formatINR(item.profile.budgetMin)}–{formatINR(item.profile.budgetMax)} ·{" "}
                  {item.profile.locality || item.profile.city}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  {activeTab === "received" ? (
                    item.isMutual ? (
                      item.conversationId ? (
                        <Button asChild size="sm" className="h-8 rounded-full text-[11.5px]">
                          <Link href={`/app/messages/${item.conversationId}`}>
                            <MessageCircle className="size-3.5" /> Message
                          </Link>
                        </Button>
                      ) : (
                        <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">
                          Matched
                        </span>
                      )
                    ) : (
                      <LikeBackButton profileId={item.profile.id} name={item.profile.name} />
                    )
                  ) : item.isMutual ? (
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">
                      Matched
                    </span>
                  ) : (
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      Waiting for them
                    </span>
                  )}
                  <Button asChild variant="ghost" size="sm" className="h-8 rounded-full text-[11px]">
                    <Link href={`/app/profile?preview=${item.profile.id}`}>View profile</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
