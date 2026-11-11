import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { DiscoverDeck } from "@/components/app/discover/discover-deck";
import { FiltersDialog } from "@/components/app/discover/filters-dialog";
import type { DiscoverPerson } from "@/components/app/discover/types";
import { PageHeader } from "@/components/app/page-header";
import { getLikeAllowance } from "@/lib/entitlements";
import { getDiscoverCandidates } from "@/lib/queries";
import type { DiscoverFilters } from "@/lib/queries";
import { requireProfile } from "@/lib/session";
import type { Profile } from "@/lib/schema";
import { LIFESTYLE_LABELS } from "@/lib/types";
import { lifestyleTags } from "@/lib/compatibility";

export const metadata: Metadata = { title: "Discover" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberOrUndefined(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseFilters(params: Record<string, string | string[] | undefined>): DiscoverFilters {
  const smoking = first(params.smoking);
  return {
    city: first(params.city) || undefined,
    locality: first(params.locality) || undefined,
    minBudget: numberOrUndefined(first(params.minBudget)),
    maxBudget: numberOrUndefined(first(params.maxBudget)),
    minAge: numberOrUndefined(first(params.minAge)),
    maxAge: numberOrUndefined(first(params.maxAge)),
    profession: first(params.profession) || undefined,
    work: first(params.work) || undefined,
    smoking: smoking === "yes" || smoking === "no" ? smoking : undefined,
    pets: first(params.pets) || undefined,
    verifiedOnly: first(params.verified) === "1",
    q: first(params.q) || undefined,
  };
}

function toDiscoverPerson(
  profile: Profile,
  compatibility: DiscoverPerson["compatibility"],
): DiscoverPerson {
  const lifestyle = profile.lifestyle;
  const tagMap: { key: keyof typeof lifestyle; label: string }[] = [
    { key: "cleanliness", label: "Cleanliness" },
    { key: "sleep", label: "Sleep" },
    { key: "work", label: "Work" },
    { key: "food", label: "Food" },
    { key: "guests", label: "Guests" },
    { key: "drinking", label: "Drinking" },
    { key: "pets", label: "Pets" },
  ];

  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    profession: profile.profession || "Nivasa member",
    city: profile.city,
    locality: profile.locality,
    distanceKm: profile.distanceKm,
    budgetMin: profile.budgetMin,
    budgetMax: profile.budgetMax,
    moveInDate: profile.moveInDate,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    photos: profile.photos,
    verified: profile.verified,
    languages: profile.languages,
    tags: [...lifestyleTags(lifestyle), ...profile.languages.slice(0, 1)],
    lifestyle: tagMap.map(({ key, label }) => {
      const raw = String(lifestyle[key]);
      let value = LIFESTYLE_LABELS[raw] ?? raw;
      if (key === "sleep" && lifestyle.sleep === "flexible") value = "Flexible hours";
      if (key === "food" && lifestyle.food === "flexible") value = "Flexible eater";
      if (key === "guests" && lifestyle.guests === "occasionally") value = "Sometimes hosts";
      return { label, value };
    }),
    compatibility,
  };
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireProfile();
  const filters = parseFilters(await searchParams);

  const [{ candidates, total, usedFallback }, allowance] = await Promise.all([
    getDiscoverCandidates(profile, filters),
    getLikeAllowance(profile),
  ]);

  const people = candidates.map((candidate) =>
    toDiscoverPerson(candidate.profile, candidate.compatibility),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nivasa Discover"
        title="Find your people."
        description="Every card is ranked by how you'd actually live together — not just who looks good on paper."
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground sm:flex">
              <Sparkles className="size-3.5 text-primary" />
              {total} {total === 1 ? "person" : "people"} in this round
            </span>
            <FiltersDialog filters={filters} />
          </div>
        }
      />

      <DiscoverDeck
        people={people}
        startingLikes={allowance.unlimited ? null : allowance.remaining}
        isPlus={profile.plan === "plus"}
        myAvatarUrl={profile.avatarUrl}
        fallbackCity={usedFallback ? filters.city : undefined}
      />
    </div>
  );
}
