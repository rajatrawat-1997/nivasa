import Link from "next/link";
import { inArray, eq } from "drizzle-orm";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  HeartHandshake,
  Home,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";

import { RoomCard } from "@/components/cards/room-card";
import { PersonCard } from "@/components/cards/person-card";
import { HeroDeck } from "@/components/marketing/hero-deck";
import { Button } from "@/components/ui/button";
import { calculateCompatibility } from "@/lib/compatibility";
import { CITIES } from "@/lib/constants";
import { db } from "@/lib/db";
import { listings, profiles } from "@/lib/schema";
import { lifestyleTags } from "@/lib/compatibility";

export const dynamic = "force-dynamic";

const factors = [
  { icon: Sparkles, label: "Cleanliness" },
  { icon: CalendarClock, label: "Sleep schedule" },
  { icon: Wallet, label: "Budget" },
  { icon: MapPin, label: "Location" },
  { icon: Users, label: "Guests & social life" },
  { icon: Home, label: "Work routine" },
];

async function featuredPeople() {
  const rows = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.id, ["p-ananya", "p-ishaan", "p-meera", "p-tara"]));
  const [demo] = await db.select().from(profiles).where(eq(profiles.id, "demo-riya")).limit(1);
  return ["p-ananya", "p-ishaan", "p-meera", "p-tara"]
    .map((id) => rows.find((row) => row.id === id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((person) => ({
      person,
      compatibility: demo ? calculateCompatibility(demo, person).overall : undefined,
    }));
}

async function featuredRooms() {
  const rows = await db
    .select()
    .from(listings)
    .where(inArray(listings.id, ["l-indiranagar", "l-hsr", "l-bandra"]));
  return ["l-indiranagar", "l-hsr", "l-bandra"]
    .map((id) => rows.find((row) => row.id === id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

export default async function LandingPage() {
  const [people, rooms] = await Promise.all([featuredPeople(), featuredRooms()]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-52 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(242,107,91,0.16),transparent_65%)]" />
          <div className="absolute -left-52 top-64 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(230,162,60,0.12),transparent_65%)]" />
          <div className="absolute inset-0 grain opacity-40" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-3 text-primary" />
              </span>
              Compatibility-first roommate matching
            </div>

            <h1 className="mt-6 text-balance font-display text-[2.75rem] font-extrabold leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-[4.05rem]">
              Your next home starts with the{" "}
              <span className="relative whitespace-nowrap text-primary">
                right roommate
                <svg
                  viewBox="0 0 300 14"
                  className="absolute -bottom-1 left-0 w-full text-primary/35"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M3 10c50-7 138-10 294-4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-muted-foreground">
              Meet people who match your lifestyle, discover shared spaces you&apos;ll
              actually love, and find a place that feels like home. Nivasa makes
              the first hello feel easy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-[15px]">
                <Link href="/signup">
                  Find my roommate <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border bg-card px-7 text-[15px]"
              >
                <Link href="/rooms">Explore rooms</Link>
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-success" /> Verified profiles
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="size-4 text-primary" /> Mutual matches only
              </span>
              <span className="flex items-center gap-1.5">
                <LockKeyhole className="size-4 text-foreground/60" /> Private by default
              </span>
            </div>

            <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
              <div className="flex -space-x-2.5">
                {["p-ananya", "p-ishaan", "p-meera", "p-tara"].map((id) => {
                  const person = people.find((item) => item.person.id === id)?.person;
                  return person ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={id}
                      src={person.avatarUrl}
                      alt=""
                      className="size-9 rounded-full border-2 border-background object-cover"
                    />
                  ) : null;
                })}
              </div>
              <p className="max-w-[260px] text-[12px] leading-snug text-muted-foreground">
                A community built for students and working professionals.
                <span className="font-medium text-foreground"> 18+ only.</span>
              </p>
            </div>
          </div>

          <div className="relative lg:pl-4">
            <HeroDeck />
          </div>
        </div>

        <div className="relative border-y border-border bg-card/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground lg:px-8">
            <span className="text-foreground/60">Finding homes in</span>
            {CITIES.slice(0, 6).map((city) => (
              <span key={city}>{city}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              Why Nivasa
            </p>
            <h2 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-[-0.045em] sm:text-[2.9rem] sm:leading-[1.08]">
              Compatibility matters more than just location.
            </h2>
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-muted-foreground">
              The best home isn&apos;t just a good address. It&apos;s the person
              you share it with. Nivasa looks at the things that actually shape
              daily life — then shows you why you fit.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {factors.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3"
                >
                  <Icon className="size-4 text-primary" />
                  <span className="text-[13px] font-medium">{label}</span>
                </div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-5 h-auto px-0 text-[13.5px]">
              <Link href="/how-it-works">
                See how compatibility works <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-[radial-gradient(circle_at_70%_20%,rgba(242,107,91,0.14),transparent_65%)]" />
            <div className="relative rounded-[26px] border border-border bg-card p-6 card-shadow-lg sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Compatibility preview
                  </p>
                  <p className="mt-1 font-display text-[17px] font-bold">You &amp; Aanya</p>
                </div>
                <span className="flex items-baseline gap-0.5 rounded-full bg-success/10 px-3 py-1.5 text-[13px] font-bold text-success">
                  94<span className="text-[10px]">%</span>
                </span>
              </div>

              <div className="mt-7 space-y-4">
                {[
                  { label: "Cleanliness", value: 96 },
                  { label: "Sleep schedule", value: 91 },
                  { label: "Budget fit", value: 94 },
                  { label: "Location", value: 98 },
                  { label: "Social preferences", value: 88 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold">{row.value}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/80"
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl bg-brand-soft p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                  <Sparkles className="size-3.5 text-primary" /> Why you match
                </p>
                <ul className="mt-2.5 space-y-1.5 text-[12px] text-muted-foreground">
                  {[
                    "Similar daily routines",
                    "Both prefer clean living spaces",
                    "Compatible budgets in Indiranagar",
                  ].map((reason) => (
                    <li key={reason} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-[11.5px] text-muted-foreground">
                <span>Sample profile data</span>
                <span className="font-medium text-foreground">Not a real match yet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-[-0.045em]">
              Three steps to a better flatmate.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-muted-foreground">
              No endless listings. No guessing. Build a profile that says what
              matters, then meet people who actually fit.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: UserIcon,
                title: "Create your profile",
                body: "Tell us how you live — cleanliness, routines, food, budget and the area you have in mind.",
              },
              {
                step: "02",
                icon: Search,
                title: "Discover compatible people",
                body: "Swipe through real profiles with honest compatibility scores and the reasons behind them.",
              },
              {
                step: "03",
                icon: MessageCircle,
                title: "Match, chat and move",
                body: "When the interest is mutual, the conversation opens. Find a room together or just click.",
              },
            ].map(({ step, icon: Icon, title, body }) => (
              <div
                key={step}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7"
              >
                <span className="absolute right-6 top-5 font-display text-[42px] font-extrabold tracking-[-0.05em] text-secondary">
                  {step}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 font-display text-[18px] font-bold tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              Meet the community
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.045em]">
              Featured roommates
            </h2>
            <p className="mt-3 max-w-md text-[14px] text-muted-foreground">
              A preview of the people you&apos;ll meet on Nivasa. Compatibility
              scores shown are sample matches with our demo profile.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full bg-card">
            <Link href="/explore">
              Browse profiles <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {people.map(({ person, compatibility }) => (
            <PersonCard
              key={person.id}
              name={person.name}
              age={person.age}
              profession={person.profession}
              city={person.city}
              locality={person.locality}
              avatarUrl={person.avatarUrl}
              budgetMin={person.budgetMin}
              budgetMax={person.budgetMax}
              compatibility={compatibility}
              tags={lifestyleTags(person.lifestyle)}
              verified={person.verified}
              href="/explore"
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
                Rooms worth seeing
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.045em]">
                Featured rooms
              </h2>
              <p className="mt-3 max-w-md text-[14px] text-muted-foreground">
                Verified listings from providers we&apos;ve reviewed — with real
                photos, honest pricing and no surprises.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit rounded-full bg-card">
              <Link href="/rooms">
                Explore all rooms <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {rooms.map((listing) => (
              <RoomCard key={listing.id} listing={listing} href="/rooms" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              Trust &amp; safety
            </p>
            <h2 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-[-0.045em]">
              Designed for the leap of faith.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Moving in with someone new takes trust. We build it in — from
              verified profiles to private contact details and simple reporting.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/safety">
                Read our safety approach <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: BadgeCheck,
                title: "Profile verification",
                body: "Email, phone and optional ID checks. Verification is shown clearly, never implied.",
              },
              {
                icon: MessageCircle,
                title: "Safe messaging",
                body: "Chat opens only after a mutual match. Report or block from any conversation.",
              },
              {
                icon: Home,
                title: "Verified listings",
                body: "Listings are reviewed before going live. Private addresses stay private until you inquire.",
              },
              {
                icon: LockKeyhole,
                title: "Privacy controls",
                body: "Your phone number and documents are never public. You choose what is visible.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-[14.5px] font-semibold">{title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-24">
        <div className="relative overflow-hidden rounded-[28px] bg-[#252525] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-16 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-10 size-64 rounded-full bg-[#E6A23C]/20 blur-3xl" />
          <div className="relative max-w-xl">
            <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-white/55">
              <Star className="size-3.5" /> Have a room to fill?
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-[2.5rem] sm:leading-[1.08]">
              Find a flatmate who fits, not just someone who pays.
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-white/65">
              List your room, see interested people and their compatibility, and
              choose the person who feels right.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-full bg-white px-6 text-[#252525] hover:bg-white/90">
                <Link href="/signup?role=provider">List your room</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/pricing">See provider plans</Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-10 grid shrink-0 grid-cols-2 gap-3 lg:mt-0 lg:w-[340px]">
            {[
              { value: "Focus on fit", label: "Compatibility, not just budget" },
              { value: "Real photos", label: "Every listing reviewed" },
              { value: "Lead inbox", label: "Manage inquiries in one place" },
              { value: "Clear pricing", label: "No hidden platform fees" },
            ].map((item) => (
              <div key={item.value} className="rounded-2xl border border-white/12 bg-white/[0.06] p-4">
                <p className="font-display text-[16px] font-bold">{item.value}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-24">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-primary">
            <HeartHandshake className="size-6" />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-4xl font-extrabold tracking-[-0.045em] sm:text-[3rem] sm:leading-[1.06]">
            Ready to find your next home — and your next favourite person?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Join Nivasa today. A few honest answers are all it takes to start
            meeting people who feel like a fit.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-[15px]">
              <Link href="/signup">
                Join Nivasa today <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-[15px]">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
          <p className="mt-5 text-[11.5px] text-muted-foreground">
            Free to join · 18+ only · You control your visibility
          </p>
        </div>
      </section>
    </>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c.8-3.4 3.9-5.5 7.5-5.5s6.7 2.1 7.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
