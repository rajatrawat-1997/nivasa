"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Heart,
  Info,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ProfileDetailDialog } from "@/components/app/discover/profile-detail";
import type {
  DiscoverPerson,
  MatchCelebration,
} from "@/components/app/discover/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  people: DiscoverPerson[];
  startingLikes: number | null;
  isPlus: boolean;
  myAvatarUrl: string;
  fallbackCity?: string;
};

export function DiscoverDeck({
  people,
  startingLikes,
  isPlus,
  myAvatarUrl,
  fallbackCity,
}: Props) {
  const router = useRouter();
  const [queue, setQueue] = useState(people);
  const [index, setIndex] = useState(0);
  const [exit, setExit] = useState<{ x: number; y: number; rotate: number } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [likesLeft, setLikesLeft] = useState<number | null>(startingLikes);
  const [match, setMatch] = useState<MatchCelebration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const likeOpacity = useTransform(x, [30, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -30], [1, 0]);
  const superOpacity = useTransform(y, [-140, -40], [1, 0]);

  const person = queue[index];
  const nextPeople = queue.slice(index + 1, index + 3);

  const advance = useCallback(
    async (action: "like" | "pass" | "superlike") => {
      const current = queue[index];
      if (!current || animating) return;

      if (action !== "pass" && likesLeft === 0) {
        toast("You're out of likes for today.", {
          description: "Nivasa Plus unlocks unlimited likes.",
          action: { label: "See plans", onClick: () => router.push("/app/subscription") },
        });
        return;
      }

      if (action === "superlike" && !isPlus) {
        toast("Super Likes are a Nivasa Plus feature.", {
          description: "Upgrade to send three every day.",
          action: { label: "See plans", onClick: () => router.push("/app/subscription") },
        });
        return;
      }

      setAnimating(true);
      setExit({
        x: action === "pass" ? -540 : 540,
        y: action === "superlike" ? -80 : 0,
        rotate: action === "pass" ? -18 : 18,
      });

      window.setTimeout(() => {
        setIndex((value) => value + 1);
        setExit(null);
        setAnimating(false);
        x.set(0);
        y.set(0);
      }, 260);

      if (action !== "pass") {
        setLikesLeft((value) => (value === null ? null : Math.max(0, value - 1)));
      }

      try {
        const response = await fetch("/api/swipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetProfileId: current.id, action }),
        });
        const data = (await response.json()) as {
          matched?: boolean;
          conversationId?: string;
          compatibility?: number;
          error?: string;
          code?: string;
        };
        if (!response.ok) {
          toast.error(data.error ?? "That swipe didn't save. Please try again.");
          setIndex((value) => Math.max(0, value - 1));
          if (action !== "pass") {
            setLikesLeft((value) => (value === null ? null : value + 1));
          }
          return;
        }
        if (data.matched && data.conversationId) {
          setMatch({
            name: current.name,
            avatarUrl: current.avatarUrl,
            conversationId: data.conversationId,
            compatibility: data.compatibility ?? current.compatibility.overall,
            myAvatarUrl,
          });
        }
      } catch {
        toast.error("You're offline. That swipe wasn't saved.");
        setIndex((value) => Math.max(0, value - 1));
        if (action !== "pass") {
          setLikesLeft((value) => (value === null ? null : value + 1));
        }
      }
    },
    [animating, index, isPlus, likesLeft, myAvatarUrl, queue, router, x, y],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (detailOpen || match) return;
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void advance("pass");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        void advance("like");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        void advance("superlike");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, detailOpen, match]);

  if (!person) {
    return (
      <>
        <EmptyDeck />
        {match && <MatchDialog match={match} setMatch={setMatch} />}
      </>
    );
  }

  const photos = person.photos.length > 0 ? person.photos : [person.avatarUrl];

  return (
    <>
      <div className="mx-auto w-full max-w-[430px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            {likesLeft === null ? (
              <span>Unlimited likes</span>
            ) : likesLeft <= 0 ? (
              <span className="font-medium text-destructive">No likes left today</span>
            ) : (
              <span>
                <span className="font-semibold text-foreground">{likesLeft}</span> likes left today
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Refresh discovery"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
        </div>

        {fallbackCity && (
          <div className="mb-3 rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-2.5 text-[11px] text-muted-foreground">
            No one new in {fallbackCity} right now, so we&apos;re showing compatible
            people nearby.
          </div>
        )}

        <div className="relative aspect-[4/5] w-full select-none">
          {nextPeople.map((next, stackIndex) => (
            <div
              key={next.id}
              className="absolute inset-0 overflow-hidden rounded-[26px] border border-border bg-card"
              style={{
                transform: `translateY(${(stackIndex + 1) * 9}px) scale(${1 - (stackIndex + 1) * 0.035})`,
                opacity: 1,
              }}
            >
              <Image
                src={next.avatarUrl}
                alt=""
                fill
                sizes="430px"
                className="object-cover brightness-[0.92]"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          ))}

          <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.65}
            style={{ x, y, rotate }}
            animate={
              exit
                ? { x: exit.x, y: exit.y, rotate: exit.rotate, opacity: 0 }
                : { x: 0, y: 0, rotate: 0, opacity: 1 }
            }
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            onDragEnd={(_, info) => {
              if (
                info.offset.y < -110 &&
                Math.abs(info.offset.y) > Math.abs(info.offset.x)
              ) {
                void advance("superlike");
              } else if (info.offset.x > 110) {
                void advance("like");
              } else if (info.offset.x < -110) {
                void advance("pass");
              }
            }}
            className="absolute inset-0 cursor-grab overflow-hidden rounded-[26px] border border-border bg-card shadow-[0_28px_70px_-34px_rgba(37,37,37,0.5)] active:cursor-grabbing"
          >
            <Image
              src={person.avatarUrl}
              alt={`${person.name}, ${person.age}`}
              fill
              priority
              sizes="(max-width: 768px) 92vw, 430px"
              className="pointer-events-none object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/25" />

            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute left-5 top-6 rotate-[-10deg] rounded-lg border-[3px] border-[#4ADE80] px-3 py-1 text-[22px] font-extrabold uppercase tracking-[0.06em] text-[#4ADE80]"
            >
              Like
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="pointer-events-none absolute right-5 top-6 rotate-[10deg] rounded-lg border-[3px] border-white px-3 py-1 text-[22px] font-extrabold uppercase tracking-[0.06em] text-white"
            >
              Pass
            </motion.div>
            <motion.div
              style={{ opacity: superOpacity }}
              className="pointer-events-none absolute inset-x-0 top-24 text-center text-[22px] font-extrabold uppercase tracking-[0.08em] text-[#F6C15B]"
            >
              Super Like
            </motion.div>

            <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#252525] shadow-sm">
                <Sparkles className="size-3.5 text-primary" /> {person.compatibility.overall}% match
              </span>
              {person.verified && (
                <span className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10.5px] font-medium text-white backdrop-blur">
                  <BadgeCheck className="size-3.5" /> Verified
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              onPointerDown={(event) => event.stopPropagation()}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/50"
              aria-label={`View ${person.name}'s full profile`}
            >
              <Info className="size-4" />
            </button>

            {photos.length > 1 && (
              <div className="absolute inset-x-0 top-2 flex justify-center gap-1">
                {photos.map((_, photoIndex) => (
                  <span
                    key={photoIndex}
                    className={cn(
                      "h-1 rounded-full",
                      photoIndex === 0 ? "w-6 bg-white" : "w-1.5 bg-white/40",
                    )}
                  />
                ))}
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="flex items-center gap-1.5 text-[11px] text-white/75">
                <MapPin className="size-3.5" />
                {person.locality ? `${person.locality}, ` : ""}
                {person.city}
                {person.distanceKm > 0 && ` · ${person.distanceKm} km away`}
              </p>
              <h2 className="mt-1 font-display text-[27px] font-extrabold leading-tight tracking-[-0.045em]">
                {person.name}, {person.age}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-white/85">
                <Briefcase className="size-3.5" /> {person.profession}
              </p>
              <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/75">
                {person.bio}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium backdrop-blur"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-white/15 pt-3">
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.1em] text-white/55">Budget</p>
                  <p className="mt-0.5 text-[12px] font-semibold">
                    {formatINR(person.budgetMin)}–{formatINR(person.budgetMax)}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.1em] text-white/55">Move-in</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold">
                    <CalendarDays className="size-3" />
                    {person.moveInDate ? formatDate(person.moveInDate) : "Flexible"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={() => void advance("pass")}
            disabled={animating}
            className="flex size-14 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            aria-label="Pass on this profile"
          >
            <X className="size-6" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => void advance("superlike")}
            disabled={animating}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50",
              isPlus ? "text-[#E6A23C]" : "text-muted-foreground",
            )}
            aria-label="Super like this profile"
          >
            <Star className="size-5" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => void advance("like")}
            disabled={animating}
            className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_-12px_rgba(242,107,91,0.9)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            aria-label="Like this profile"
          >
            <Heart className="size-7" fill="currentColor" />
          </button>
          <Link
            href={`/app/profile?preview=${person.id}`}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-transform hover:scale-105 hover:text-foreground active:scale-95"
            aria-label="Open profile preview"
          >
            <Info className="size-4.5" />
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-card px-1 py-0.5 text-[9px]">←</kbd> pass
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-card px-1 py-0.5 text-[9px]">→</kbd> like
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <kbd className="rounded border border-border bg-card px-1 py-0.5 text-[9px]">↑</kbd> super like
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mx-auto mt-3 flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
        >
          View full profile <ArrowRight className="size-3" />
        </button>
      </div>

      <ProfileDetailDialog
        person={person}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onBlocked={(id) => {
          setQueue((current) => current.filter((item) => item.id !== id));
          setIndex(0);
        }}
      />

      {match && <MatchDialog match={match} setMatch={setMatch} />}
    </>
  );
}

function EmptyDeck() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-primary">
        <Sparkles className="size-6" />
      </span>
      <h2 className="mt-5 font-display text-[22px] font-extrabold tracking-[-0.03em]">
        That&apos;s everyone for now.
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-[12.5px] leading-relaxed text-muted-foreground">
        You&apos;ve seen all the people who fit these filters. Widen your search,
        check back later, or start a conversation with one of your matches.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild className="rounded-full">
          <Link href="/app/discover">Reset filters</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-card">
          <Link href="/app/matches">See matches</Link>
        </Button>
      </div>
    </div>
  );
}

function MatchDialog({
  match,
  setMatch,
}: {
  match: MatchCelebration;
  setMatch: (value: MatchCelebration | null) => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && setMatch(null)}>
      <DialogContent className="overflow-hidden border-0 bg-[#252525] p-0 text-white sm:max-w-sm">
        <DialogTitle className="sr-only">It&apos;s a match</DialogTitle>
        <div className="relative px-6 pb-7 pt-9 text-center">
          <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 size-52 rounded-full bg-[#E6A23C]/20 blur-3xl" />
          <div className="relative flex items-center justify-center">
            <div className="relative size-24 -rotate-6 overflow-hidden rounded-full border-4 border-[#252525] bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={match.myAvatarUrl} alt="You" className="size-full object-cover" />
            </div>
            <div className="relative -ml-6 size-24 rotate-6 overflow-hidden rounded-full border-4 border-[#252525] bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={match.avatarUrl} alt={match.name} className="size-full object-cover" />
            </div>
          </div>
          <p className="relative mt-5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#F9B4A9]">
            It&apos;s a match
          </p>
          <h2 className="relative mt-1.5 font-display text-[26px] font-extrabold tracking-[-0.04em]">
            You and {match.name.split(" ")[0]} are interested in living together.
          </h2>
          <p className="relative mt-2 text-[12px] text-white/60">
            {match.compatibility}% compatible · Say hello while it&apos;s fresh.
          </p>
          <div className="relative mt-6 flex flex-col gap-2">
            <Button asChild className="h-11 rounded-full bg-white text-[#252525] hover:bg-white/90">
              <Link href={`/app/messages/${match.conversationId}`}>Send a message</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMatch(null)}
              className="h-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              Keep discovering
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
