import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { notifications, profiles } from "@/lib/schema";
import { getSession } from "@/lib/session";
import type { HousingPreferences, Lifestyle } from "@/lib/types";

const lifestyleSchema = z.object({
  cleanliness: z.enum(["very-tidy", "moderately-tidy", "relaxed"]),
  sleep: z.enum(["early-bird", "night-owl", "flexible"]),
  smoking: z.boolean(),
  drinking: z.enum(["never", "occasionally", "socially"]),
  pets: z.enum(["has-pets", "comfortable", "no-pets"]),
  guests: z.enum(["frequently", "occasionally", "rarely"]),
  parties: z.enum(["social", "occasionally", "quiet"]),
  work: z.enum(["wfh", "office", "hybrid", "student"]),
  food: z.enum(["vegetarian", "non-vegetarian", "vegan", "flexible"]),
  noise: z.enum(["quiet", "moderate", "lively"]),
  responsibilities: z.enum(["shared", "separate", "flexible"]),
});

const housingSchema = z.object({
  city: z.string().min(1),
  neighbourhoods: z.array(z.string()).max(8),
  budgetMin: z.number().int().min(0).max(1_000_000),
  budgetMax: z.number().int().min(0).max(1_000_000),
  moveInDate: z.string(),
  stayDuration: z.string(),
  roomType: z.string(),
  furnishing: z.string(),
  genderPreference: z.string(),
  requirements: z.string().max(1000),
});

const bodySchema = z.object({
  name: z.string().min(2).max(80).optional(),
  age: z.number().int().min(18, "You must be at least 18 to use Nivasa.").max(99).optional(),
  gender: z.string().max(40).optional(),
  city: z.string().max(80).optional(),
  locality: z.string().max(120).optional(),
  profession: z.string().max(120).optional(),
  company: z.string().max(120).nullable().optional(),
  bio: z.string().max(600).optional(),
  avatarUrl: z.string().max(2_500_000).optional(),
  photos: z.array(z.string().max(2_500_000)).max(6).optional(),
  budgetMin: z.number().int().min(0).max(1_000_000).optional(),
  budgetMax: z.number().int().min(0).max(1_000_000).optional(),
  moveInDate: z.string().optional(),
  distanceKm: z.number().int().min(0).max(500).optional(),
  languages: z.array(z.string().max(40)).max(8).optional(),
  lifestyle: lifestyleSchema.optional(),
  housing: housingSchema.optional(),
  role: z.enum(["seeker", "provider"]).optional(),
  onboardingComplete: z.boolean().optional(),
});

const defaultLifestyle: Lifestyle = {
  cleanliness: "moderately-tidy",
  sleep: "flexible",
  smoking: false,
  drinking: "occasionally",
  pets: "comfortable",
  guests: "occasionally",
  parties: "occasionally",
  work: "hybrid",
  food: "flexible",
  noise: "moderate",
  responsibilities: "shared",
};

const defaultHousing: HousingPreferences = {
  city: "Bengaluru",
  neighbourhoods: [],
  budgetMin: 10000,
  budgetMax: 25000,
  moveInDate: "",
  stayDuration: "12 months",
  roomType: "private-room",
  furnishing: "furnished",
  genderPreference: "any",
  requirements: "",
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  if (!profile) return NextResponse.json({ profile: null }, { status: 404 });
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your answers." },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  try {
    if (existing) {
      const [updated] = await db
        .update(profiles)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, existing.id))
        .returning();

      if (input.onboardingComplete && !existing.onboardingComplete) {
        await db.insert(notifications).values({
          profileId: existing.id,
          type: "system",
          title: "Welcome to Nivasa",
          body: "Your profile is ready. Start discovering people who fit.",
          href: "/app/discover",
        });
      }
      return NextResponse.json({ profile: updated });
    }

    if (!input.name || !input.age || !input.city) {
      return NextResponse.json(
        { error: "Your name, age and city are needed to create your profile." },
        { status: 400 },
      );
    }
    if (input.age < 18) {
      return NextResponse.json(
        { error: "You must be at least 18 to use Nivasa." },
        { status: 400 },
      );
    }

    const housing = input.housing ?? {
      ...defaultHousing,
      city: input.city,
      budgetMin: input.budgetMin ?? defaultHousing.budgetMin,
      budgetMax: input.budgetMax ?? defaultHousing.budgetMax,
      moveInDate: input.moveInDate ?? "",
    };

    const [created] = await db
      .insert(profiles)
      .values({
        userId: session.user.id,
        name: input.name,
        age: input.age,
        gender: input.gender ?? "prefer-not-to-say",
        city: input.city,
        locality: input.locality ?? "",
        profession: input.profession ?? "",
        company: input.company ?? null,
        bio: input.bio ?? "",
        avatarUrl: input.avatarUrl ?? "",
        photos: input.photos ?? [],
        budgetMin: input.budgetMin ?? housing.budgetMin,
        budgetMax: input.budgetMax ?? housing.budgetMax,
        moveInDate: input.moveInDate ?? housing.moveInDate,
        distanceKm: input.distanceKm ?? 0,
        languages: input.languages ?? [],
        lifestyle: input.lifestyle ?? defaultLifestyle,
        housing,
        role: input.role ?? "seeker",
        onboardingComplete: input.onboardingComplete ?? false,
      })
      .returning();

    return NextResponse.json({ profile: created }, { status: 201 });
  } catch (error) {
    console.error("onboarding error", error);
    return NextResponse.json(
      { error: "We couldn't save your profile. Please try again." },
      { status: 500 },
    );
  }
}
