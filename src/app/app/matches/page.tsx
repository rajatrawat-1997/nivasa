import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, HeartHandshake, MapPin, MessageCircle, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { UnmatchButton } from "@/components/app/unmatch-button";
import { Button } from "@/components/ui/button";
import { formatINR, timeAgo } from "@/lib/constants";
import { getMatchesFor } from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Matches" };

export default async function MatchesPage() {
  const profile = await requireProfile();
  const matches = await getMatchesFor(profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Matches"
        title="The ones who said yes."
        description="These people liked you back. Compatibility is a starting point — the first message is what counts."
        action={
          <Button asChild variant="outline" className="rounded-full bg-card">
            <Link href="/app/discover">
              <Sparkles className="size-4" /> Keep discovering
            </Link>
          </Button>
        }
      />

      {matches.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No matches yet"
          description="Match with someone by liking each other in Discover. When it happens, their conversation appears here."
          action={
            <Button asChild className="rounded-full">
              <Link href="/app/discover">Start discovering</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <article
              key={match.matchId}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-secondary">
                <Image
                  src={match.profile.avatarUrl}
                  alt={`${match.profile.name}, ${match.profile.age}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold text-[#252525]">
                  {match.compatibility}% match
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h2 className="flex items-center gap-1.5 font-display text-[17px] font-bold leading-tight">
                    {match.profile.name}, {match.profile.age}
                    {match.profile.verified && <BadgeCheck className="size-4" />}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/75">
                    <MapPin className="size-3" />
                    {match.profile.locality || match.profile.city} ·{" "}
                    {match.profile.profession || "Nivasa member"}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                  {match.profile.bio || "Matched on Nivasa."}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-muted-foreground">
                  <span>
                    {formatINR(match.profile.budgetMin)}–{formatINR(match.profile.budgetMax)}
                  </span>
                  <span>Matched {timeAgo(match.createdAt)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  {match.conversationId ? (
                    <Button asChild size="sm" className="h-8 rounded-full text-[11.5px]">
                      <Link href={`/app/messages/${match.conversationId}`}>
                        <MessageCircle className="size-3.5" /> Message
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="h-8 rounded-full bg-card text-[11.5px]">
                      <Link href="/app/messages">Open inbox</Link>
                    </Button>
                  )}
                  <UnmatchButton matchId={match.matchId} name={match.profile.name} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
