import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { PersonCard } from "@/components/cards/person-card";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { calculateCompatibility, lifestyleTags } from "@/lib/compatibility";
import { CITIES } from "@/lib/constants";
import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { and, eq, inArray, ne } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Discover roommates",
  description:
    "Meet verified students and professionals looking for a compatible roommate across India. Preview Nivasa profiles before you join.",
};

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const [demo] = await db.select().from(profiles).where(eq(profiles.id, "demo-riya")).limit(1);
  const people = await db
    .select()
    .from(profiles)
    .where(
      and(
        ne(profiles.role, "provider"),
        inArray(profiles.id, [
          "p-ananya",
          "p-ishaan",
          "p-meera",
          "p-naina",
          "p-rohan",
          "p-aditi",
          "p-dev",
          "p-tara",
          "p-arjun",
          "p-sana",
          "p-kabir",
        ]),
        city && CITIES.includes(city) ? eq(profiles.city, city) : undefined,
      ),
    );

  const results = people
    .map((person) => ({
      person,
      compatibility: demo ? calculateCompatibility(demo, person).overall : undefined,
    }))
    .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0));

  return (
    <>
      <PageHero
        eyebrow="Discover"
        title={
          <>
            People looking for a <span className="text-primary">place like yours.</span>
          </>
        }
        description="A preview of the Nivasa community. Sign in to see full profiles, compatibility breakdowns and start matching."
        primary={{ label: "Find my roommate", href: "/signup" }}
        secondary={{ label: "Explore rooms", href: "/rooms" }}
      />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <form
          action="/explore"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 sm:flex-row sm:items-center"
        >
          <span className="flex items-center gap-2 px-2 text-[12px] font-medium text-muted-foreground">
            <SlidersHorizontal className="size-4" /> Filter
          </span>
          <label className="sr-only" htmlFor="city">
            City
          </label>
          <select
            id="city"
            name="city"
            defaultValue={city ?? ""}
            className="h-10 min-w-[160px] rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">All cities</option>
            {CITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-10 rounded-xl px-5">
            <Search className="size-4" /> Show people
          </Button>
          <p className="ml-auto px-2 text-[11.5px] text-muted-foreground">
            {results.length} {results.length === 1 ? "profile" : "profiles"}
            {city ? ` in ${city}` : ""}
          </p>
        </form>

        {results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Sparkles className="mx-auto size-8 text-primary" />
            <h2 className="mt-4 font-display text-xl font-bold">Nobody here yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
              We&apos;re growing city by city. Join Nivasa and be one of the first
              people in {city ?? "your city"}.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href="/signup">Join Nivasa</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map(({ person, compatibility }) => (
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
                href="/signup"
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-[#252525] p-6 text-white sm:flex-row sm:p-7">
          <div>
            <p className="font-display text-[18px] font-bold">Want to see who you actually match with?</p>
            <p className="mt-1 text-[12.5px] text-white/65">
              Build your lifestyle profile in four minutes. It&apos;s free.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full bg-white px-5 text-[#252525] hover:bg-white/90">
            <Link href="/signup">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
