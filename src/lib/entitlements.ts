import "server-only";

import { and, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "./db";
import { swipes } from "./schema";
import type { Profile } from "./schema";

export const FREE_DAILY_LIKES = 5;

export async function getLikesUsedToday(profileId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(swipes)
    .where(
      and(
        eq(swipes.fromProfileId, profileId),
        inArray(swipes.action, ["like", "superlike"]),
        gte(swipes.createdAt, start),
      ),
    );
  return row?.value ?? 0;
}

export async function getLikeAllowance(profile: Profile) {
  if (profile.plan === "plus") {
    return { unlimited: true, remaining: Infinity, limit: Infinity, used: 0 };
  }
  const used = await getLikesUsedToday(profile.id);
  return {
    unlimited: false,
    remaining: Math.max(0, FREE_DAILY_LIKES - used),
    limit: FREE_DAILY_LIKES,
    used,
  };
}
