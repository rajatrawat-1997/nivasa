import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";
import { db } from "./db";
import { profiles } from "./schema";
import type { Profile } from "./schema";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const session = await getSession();
  if (!session) return null;
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  return profile ?? null;
});

export async function requireProfile(): Promise<Profile> {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding/welcome");
  return profile;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (!profile.isAdmin) redirect("/app/dashboard");
  return profile;
}

export async function getApiProfile() {
  const profile = await getCurrentProfile();
  return profile;
}
