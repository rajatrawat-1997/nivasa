import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, or } from "drizzle-orm";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Check,
  Languages,
  MapPin,
  MessageCircle,
  Pencil,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ProfileSafetyActions } from "@/components/app/profile-safety-actions";
import { SaveProfileButton } from "@/components/app/save-profile-button";
import { Button } from "@/components/ui/button";
import { calculateCompatibility } from "@/lib/compatibility";
import { formatDate, formatINR } from "@/lib/constants";
import { db } from "@/lib/db";
import { getCompatibilityWeights } from "@/lib/queries";
import {
  blockedUsers,
  conversations,
  matches,
  profiles,
  savedProfiles,
} from "@/lib/schema";
import { requireProfile } from "@/lib/session";
import { LIFESTYLE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

type SearchParams = Promise<{ preview?: string }>;

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{score}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full",
            score >= 82 ? "bg-success" : score >= 60 ? "bg-primary" : "bg-warning",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default async function ProfilePage({ searchParams }: { searchParams: SearchParams }) {
  const me = await requireProfile();
  const { preview } = await searchParams;

  if (!preview || preview === me.id) {
    const lifestyle = [
      { label: "Cleanliness", value: me.lifestyle.cleanliness },
      { label: "Sleep", value: me.lifestyle.sleep },
      { label: "Work", value: me.lifestyle.work },
      { label: "Food", value: me.lifestyle.food },
      { label: "Drinking", value: me.lifestyle.drinking },
      { label: "Pets", value: me.lifestyle.pets },
      { label: "Guests", value: me.lifestyle.guests },
      { label: "Social life", value: me.lifestyle.parties },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="My profile"
          title={me.name}
          description="This is what people see when they discover you. Keep it honest — it's how you find the right fit."
          action={
            <div className="flex gap-2">
              <Button asChild variant="outline" className="rounded-full bg-card">
                <Link href="/app/preferences">Preferences</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/app/profile/edit">
                  <Pencil className="size-4" /> Edit profile
                </Link>
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[16/9] bg-secondary">
              <Image
                src={me.avatarUrl}
                alt={me.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  {me.verified ? (
                    <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-success">
                      <BadgeCheck className="size-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
                      Verification in progress
                    </span>
                  )}
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium capitalize backdrop-blur">
                    {me.plan === "plus" ? "Nivasa Plus" : me.plan === "provider" ? "Provider Pro" : "Free plan"}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-[24px] font-extrabold tracking-[-0.04em]">
                  {me.name}, {me.age}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/80">
                  <Briefcase className="size-3.5" /> {me.profession || "Nivasa member"}
                  {me.company ? ` at ${me.company}` : ""}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/80">
                  <MapPin className="size-3.5" /> {me.locality ? `${me.locality}, ` : ""}
                  {me.city}
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-muted-foreground">
                {me.bio || "Add a short bio so people know what living with you is actually like."}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-secondary/60 px-3.5 py-2.5">
                  <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    <Wallet className="size-3" /> Budget
                  </p>
                  <p className="mt-1 text-[12px] font-semibold">
                    {formatINR(me.budgetMin)}–{formatINR(me.budgetMax)}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/60 px-3.5 py-2.5">
                  <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    <CalendarDays className="size-3" /> Move-in
                  </p>
                  <p className="mt-1 text-[12px] font-semibold">
                    {me.moveInDate ? formatDate(me.moveInDate) : "Flexible"}
                  </p>
                </div>
              </div>
              {me.languages.length > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Languages className="size-3.5" /> {me.languages.join(" · ")}
                </p>
              )}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">
                How you live
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {lifestyle.map((item) => (
                  <div key={item.label}>
                    <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11.5px] font-medium">
                      {LIFESTYLE_LABELS[item.value] ?? item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium">
                  {me.lifestyle.noise} noise
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium">
                  {me.lifestyle.responsibilities} chores
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium">
                  {me.lifestyle.smoking ? "Smoker" : "Non-smoker"}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">
                Verification
              </h2>
              <ul className="mt-3 space-y-2">
                {[
                  { label: "Email address", done: true },
                  { label: "Phone number", done: me.phoneVerified },
                  { label: "Government ID", done: me.idVerified },
                ].map((item) => (
                  <li key={item.label} className="flex items-center justify-between text-[11.5px]">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold",
                        item.done
                          ? "bg-success/10 text-success"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {item.done && <Check className="size-2.5" strokeWidth={3} />}
                      {item.done ? "Verified" : "Not started"}
                    </span>
                  </li>
                ))}
              </ul>
              {!me.phoneVerified && (
                <p className="mt-3 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-[10.5px] leading-relaxed text-muted-foreground">
                  Phone and ID verification are handled manually while our verification provider is
                  being connected.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.02em]">
                <ShieldCheck className="size-4 text-success" /> Your privacy
              </h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                Your exact address and contact details are never shown publicly. Review what you
                share in Settings.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3 rounded-full bg-card">
                <Link href="/app/settings">Privacy settings</Link>
              </Button>
            </section>
          </div>
        </div>

        {me.photos.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-[16px] font-bold tracking-[-0.02em]">Your photos</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {me.photos.map((photo, index) => (
                <div
                  key={`${photo.slice(-24)}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
                >
                  <Image src={photo} alt={`Photo ${index + 1}`} fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const [person] = await db.select().from(profiles).where(eq(profiles.id, preview)).limit(1);
  if (!person) notFound();

  const [blocked, saved, match, weights] = await Promise.all([
    db
      .select()
      .from(blockedUsers)
      .where(
        or(
          and(eq(blockedUsers.profileId, me.id), eq(blockedUsers.blockedProfileId, person.id)),
          and(eq(blockedUsers.profileId, person.id), eq(blockedUsers.blockedProfileId, me.id)),
        ),
      )
      .limit(1),
    db
      .select()
      .from(savedProfiles)
      .where(
        and(eq(savedProfiles.profileId, me.id), eq(savedProfiles.targetProfileId, person.id)),
      )
      .limit(1),
    db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.profileAId, me.id), eq(matches.profileBId, person.id)),
          and(eq(matches.profileAId, person.id), eq(matches.profileBId, me.id)),
        ),
      )
      .limit(1),
    getCompatibilityWeights(),
  ]);

  if (blocked.length > 0) notFound();

  const compatibility = calculateCompatibility(me, person, weights);
  const matchRow = match[0];
  const conversation = matchRow
    ? (
        await db
          .select()
          .from(conversations)
          .where(eq(conversations.matchId, matchRow.id))
          .limit(1)
      )[0]
    : null;

  const lifestyle = [
    { label: "Cleanliness", value: person.lifestyle.cleanliness },
    { label: "Sleep", value: person.lifestyle.sleep },
    { label: "Work", value: person.lifestyle.work },
    { label: "Food", value: person.lifestyle.food },
    { label: "Drinking", value: person.lifestyle.drinking },
    { label: "Pets", value: person.lifestyle.pets },
    { label: "Guests", value: person.lifestyle.guests },
    { label: "Social life", value: person.lifestyle.parties },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/app/discover"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Discover
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[4/5] max-h-[540px] bg-secondary sm:aspect-[16/11]">
            <Image
              src={person.avatarUrl}
              alt={`${person.name}, ${person.age}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
            <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#252525]">
              <Sparkles className="size-3.5 text-primary" /> {compatibility.overall}% match
            </span>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h1 className="font-display text-[26px] font-extrabold tracking-[-0.045em]">
                {person.name}, {person.age}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/80">
                <Briefcase className="size-3.5" /> {person.profession || "Nivasa member"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/80">
                <MapPin className="size-3.5" /> {person.locality ? `${person.locality}, ` : ""}
                {person.city}
              </p>
            </div>
          </div>
          <div className="p-5">
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-muted-foreground">
              {person.bio || "This person hasn't written a bio yet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {compatibility.shared.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-secondary/60 px-3.5 py-2.5">
                <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Budget</p>
                <p className="mt-1 text-[12px] font-semibold">
                  {formatINR(person.budgetMin)}–{formatINR(person.budgetMax)}
                </p>
              </div>
              <div className="rounded-xl bg-secondary/60 px-3.5 py-2.5">
                <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Move-in</p>
                <p className="mt-1 text-[12px] font-semibold">
                  {person.moveInDate ? formatDate(person.moveInDate) : "Flexible"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {conversation ? (
                <Button asChild size="sm" className="rounded-full">
                  <Link href={`/app/messages/${conversation.id}`}>
                    <MessageCircle className="size-3.5" /> Message
                  </Link>
                </Button>
              ) : (
                <span className="rounded-full bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground">
                  {matchRow ? "Matched" : "Like each other to message"}
                </span>
              )}
              <SaveProfileButton profileId={person.id} initialSaved={saved.length > 0} />
              <ProfileSafetyActions profileId={person.id} name={person.name} />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">
              Compatibility breakdown
            </h2>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">
              Based on both profiles and your saved preferences.
            </p>
            <div className="mt-3 space-y-2.5">
              {compatibility.categories.slice(0, 6).map((category) => (
                <ScoreBar key={category.key} label={category.label} score={category.score} />
              ))}
            </div>
            <ul className="mt-4 space-y-1.5 rounded-xl bg-secondary/50 p-3">
              {compatibility.reasons.slice(0, 3).map((reason) => (
                <li key={reason} className="flex items-start gap-1.5 text-[10.5px] text-muted-foreground">
                  <Check className="mt-0.5 size-3 shrink-0 text-success" strokeWidth={3} />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">How they live</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {lifestyle.map((item) => (
                <div key={item.label}>
                  <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-[11.5px] font-medium">
                    {LIFESTYLE_LABELS[item.value] ?? item.value}
                  </p>
                </div>
              ))}
            </div>
            {person.languages.length > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Languages className="size-3.5" /> {person.languages.join(" · ")}
              </p>
            )}
          </section>

          {person.photos.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Photos</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {person.photos.slice(0, 6).map((photo, index) => (
                  <div
                    key={`${photo.slice(-24)}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-lg bg-secondary"
                  >
                    <Image src={photo} alt={`Photo ${index + 1}`} fill sizes="150px" className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
