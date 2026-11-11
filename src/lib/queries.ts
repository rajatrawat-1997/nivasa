import "server-only";

import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

import { calculateCompatibility, DEFAULT_WEIGHTS } from "./compatibility";
import { db } from "./db";
import {
  appSettings,
  blockedUsers,
  conversations,
  listings,
  matches,
  messages,
  notifications,
  profiles,
  savedListings,
  savedProfiles,
  swipes,
} from "./schema";
import type { Profile } from "./schema";
import type { CompatibilityBreakdown, CompatibilityWeights } from "./types";

export async function getCompatibilityWeights(): Promise<CompatibilityWeights> {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "compatibility_weights"))
    .limit(1);
  if (!row) return DEFAULT_WEIGHTS;
  return { ...DEFAULT_WEIGHTS, ...(row.value as Partial<CompatibilityWeights>) };
}

export type DiscoverFilters = {
  city?: string;
  locality?: string;
  minBudget?: number;
  maxBudget?: number;
  minAge?: number;
  maxAge?: number;
  profession?: string;
  verifiedOnly?: boolean;
  work?: string;
  smoking?: "yes" | "no";
  pets?: string;
  q?: string;
};

export type DiscoverCandidate = {
  profile: Profile;
  compatibility: CompatibilityBreakdown;
};

export async function getDiscoverCandidates(
  me: Profile,
  filters: DiscoverFilters = {},
): Promise<{ candidates: DiscoverCandidate[]; total: number; usedFallback: boolean }> {
  const weights = await getCompatibilityWeights();

  const [swiped, blocked] = await Promise.all([
    db.select({ id: swipes.toProfileId }).from(swipes).where(eq(swipes.fromProfileId, me.id)),
    db.select({ id: blockedUsers.blockedProfileId }).from(blockedUsers).where(eq(blockedUsers.profileId, me.id)),
  ]);
  const excluded = [...swiped.map((row) => row.id), ...blocked.map((row) => row.id), me.id];

  const conditions = [
    eq(profiles.onboardingComplete, true),
    ne(profiles.role, "provider"),
    notInArray(profiles.id, excluded),
    filters.city ? eq(profiles.city, filters.city) : undefined,
    filters.locality ? ilike(profiles.locality, `%${filters.locality}%`) : undefined,
    typeof filters.minBudget === "number" ? gte(profiles.budgetMax, filters.minBudget) : undefined,
    typeof filters.maxBudget === "number" ? lte(profiles.budgetMin, filters.maxBudget) : undefined,
    typeof filters.minAge === "number" ? gte(profiles.age, filters.minAge) : undefined,
    typeof filters.maxAge === "number" ? lte(profiles.age, filters.maxAge) : undefined,
    filters.profession ? ilike(profiles.profession, `%${filters.profession}%`) : undefined,
    filters.verifiedOnly ? eq(profiles.verified, true) : undefined,
    filters.q
      ? or(
          ilike(profiles.name, `%${filters.q}%`),
          ilike(profiles.profession, `%${filters.q}%`),
          ilike(profiles.city, `%${filters.q}%`),
        )
      : undefined,
  ].filter(Boolean);

  const rows = await db
    .select()
    .from(profiles)
    .where(and(...conditions))
    .limit(60);

  let pool = rows;
  let usedFallback = false;
  if (filters.city && pool.length === 0) {
    usedFallback = true;
    const fallbackConditions = [
      eq(profiles.onboardingComplete, true),
      ne(profiles.role, "provider"),
      notInArray(profiles.id, excluded),
      filters.verifiedOnly ? eq(profiles.verified, true) : undefined,
    ].filter(Boolean);
    pool = await db
      .select()
      .from(profiles)
      .where(and(...fallbackConditions))
      .limit(60);
  }

  const candidates = pool
    .map((profile) => ({
      profile,
      compatibility: calculateCompatibility(me, profile, weights),
    }))
    .filter(({ profile }) => {
      if (filters.work && profile.lifestyle.work !== filters.work) return false;
      if (filters.smoking === "yes" && !profile.lifestyle.smoking) return false;
      if (filters.smoking === "no" && profile.lifestyle.smoking) return false;
      if (filters.pets && profile.lifestyle.pets !== filters.pets) return false;
      return true;
    })
    .sort((a, b) => b.compatibility.overall - a.compatibility.overall);

  return { candidates, total: candidates.length, usedFallback };
}

export type MatchWithProfile = {
  matchId: string;
  profile: Profile;
  compatibility: number;
  createdAt: Date;
  conversationId: string | null;
};

export async function getMatchesFor(profileId: string): Promise<MatchWithProfile[]> {
  const rows = await db
    .select()
    .from(matches)
    .where(or(eq(matches.profileAId, profileId), eq(matches.profileBId, profileId)))
    .orderBy(desc(matches.createdAt));

  if (rows.length === 0) return [];

  const otherIds = rows.map((row) => (row.profileAId === profileId ? row.profileBId : row.profileAId));
  const [people, conversationRows] = await Promise.all([
    db.select().from(profiles).where(inArray(profiles.id, otherIds)),
    db
      .select()
      .from(conversations)
      .where(inArray(conversations.matchId, rows.map((row) => row.id))),
  ]);

  return rows
    .map((match) => {
      const otherId = match.profileAId === profileId ? match.profileBId : match.profileAId;
      const person = people.find((row) => row.id === otherId);
      if (!person) return null;
      return {
        matchId: match.id,
        profile: person,
        compatibility: match.compatibility,
        createdAt: match.createdAt,
        conversationId: conversationRows.find((row) => row.matchId === match.id)?.id ?? null,
      };
    })
    .filter((row): row is MatchWithProfile => Boolean(row));
}

export type LikeWithProfile = {
  profile: Profile;
  action: "like" | "superlike";
  createdAt: Date;
  isMutual: boolean;
  conversationId: string | null;
};

export async function getLikesReceived(profileId: string): Promise<LikeWithProfile[]> {
  const rows = await db
    .select({ swipe: swipes, profile: profiles })
    .from(swipes)
    .innerJoin(profiles, eq(swipes.fromProfileId, profiles.id))
    .where(and(eq(swipes.toProfileId, profileId), inArray(swipes.action, ["like", "superlike"])))
    .orderBy(desc(swipes.createdAt));

  const [mySwipes, matchRows, conversationRows] = await Promise.all([
    db.select().from(swipes).where(eq(swipes.fromProfileId, profileId)),
    db
      .select()
      .from(matches)
      .where(or(eq(matches.profileAId, profileId), eq(matches.profileBId, profileId))),
    db.select().from(conversations),
  ]);

  return rows
    .filter(({ swipe }) => {
      const mine = mySwipes.find((item) => item.toProfileId === swipe.fromProfileId);
      return !mine || mine.action !== "pass";
    })
    .map(({ swipe, profile }) => {
      const match = matchRows.find(
        (row) =>
          (row.profileAId === profileId && row.profileBId === profile.id) ||
          (row.profileBId === profileId && row.profileAId === profile.id),
      );
      return {
        profile,
        action: swipe.action as "like" | "superlike",
        createdAt: swipe.createdAt,
        isMutual: Boolean(match),
        conversationId: match
          ? conversationRows.find((row) => row.matchId === match.id)?.id ?? null
          : null,
      };
    });
}

export async function getLikesSent(profileId: string) {
  const rows = await db
    .select({ swipe: swipes, profile: profiles })
    .from(swipes)
    .innerJoin(profiles, eq(swipes.toProfileId, profiles.id))
    .where(
      and(
        eq(swipes.fromProfileId, profileId),
        inArray(swipes.action, ["like", "superlike"]),
      ),
    )
    .orderBy(desc(swipes.createdAt));

  const [incoming, matchRows, conversationRows] = await Promise.all([
    db
      .select()
      .from(swipes)
      .where(and(eq(swipes.toProfileId, profileId), inArray(swipes.action, ["like", "superlike"]))),
    db
      .select()
      .from(matches)
      .where(or(eq(matches.profileAId, profileId), eq(matches.profileBId, profileId))),
    db.select().from(conversations),
  ]);

  return rows.map(({ swipe, profile }) => {
    const match = matchRows.find(
      (row) =>
        (row.profileAId === profileId && row.profileBId === profile.id) ||
        (row.profileBId === profileId && row.profileAId === profile.id),
    );
    return {
      profile,
      action: swipe.action as "like" | "superlike",
      createdAt: swipe.createdAt,
      isMutual: incoming.some((row) => row.fromProfileId === profile.id),
      conversationId: match
        ? conversationRows.find((row) => row.matchId === match.id)?.id ?? null
        : null,
    };
  });
}

export type ConversationSummary = {
  id: string;
  matchId: string;
  profile: Profile;
  lastMessage: string;
  lastMessageAt: Date;
  unread: number;
  compatibility: number;
};

export async function getConversationsFor(profileId: string): Promise<ConversationSummary[]> {
  const matchRows = await db
    .select()
    .from(matches)
    .where(or(eq(matches.profileAId, profileId), eq(matches.profileBId, profileId)));

  if (matchRows.length === 0) return [];

  const conversationRows = await db
    .select()
    .from(conversations)
    .where(inArray(conversations.matchId, matchRows.map((row) => row.id)));

  if (conversationRows.length === 0) return [];

  const otherIds = matchRows.map((row) =>
    row.profileAId === profileId ? row.profileBId : row.profileAId,
  );
  const conversationIds = conversationRows.map((row) => row.id);

  const [people, messageRows] = await Promise.all([
    db.select().from(profiles).where(inArray(profiles.id, otherIds)),
    db
      .select()
      .from(messages)
      .where(inArray(messages.conversationId, conversationIds))
      .orderBy(desc(messages.createdAt)),
  ]);

  return conversationRows
    .map((conversation) => {
      const match = matchRows.find((row) => row.id === conversation.matchId);
      if (!match) return null;
      const otherId = match.profileAId === profileId ? match.profileBId : match.profileAId;
      const person = people.find((row) => row.id === otherId);
      if (!person) return null;
      const conversationMessages = messageRows.filter((row) => row.conversationId === conversation.id);
      const last = conversationMessages[0];
      return {
        id: conversation.id,
        matchId: conversation.matchId,
        profile: person,
        lastMessage: last?.body ?? "You matched — say hello.",
        lastMessageAt: last?.createdAt ?? conversation.createdAt,
        unread: conversationMessages.filter(
          (row) => row.senderProfileId !== profileId && !row.readAt,
        ).length,
        compatibility: match.compatibility,
      };
    })
    .filter((row): row is ConversationSummary => Boolean(row))
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export async function getConversation(profileId: string, conversationId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!conversation) return null;

  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, conversation.matchId))
    .limit(1);
  if (!match) return null;
  if (match.profileAId !== profileId && match.profileBId !== profileId) return null;

  const otherId = match.profileAId === profileId ? match.profileBId : match.profileAId;
  const [other] = await db.select().from(profiles).where(eq(profiles.id, otherId)).limit(1);
  if (!other) return null;

  return { conversation, match, other };
}

export async function getActiveListings(filters: {
  city?: string;
  roomType?: string;
  maxRent?: number;
  minRent?: number;
  furnishing?: string;
  q?: string;
}) {
  const conditions = [
    eq(listings.status, "active"),
    filters.city ? eq(listings.city, filters.city) : undefined,
    filters.roomType ? eq(listings.roomType, filters.roomType) : undefined,
    typeof filters.maxRent === "number" ? lte(listings.rent, filters.maxRent) : undefined,
    typeof filters.minRent === "number" ? gte(listings.rent, filters.minRent) : undefined,
    filters.furnishing ? eq(listings.furnishing, filters.furnishing) : undefined,
    filters.q
      ? or(
          ilike(listings.title, `%${filters.q}%`),
          ilike(listings.locality, `%${filters.q}%`),
          ilike(listings.city, `%${filters.q}%`),
        )
      : undefined,
  ].filter(Boolean);

  return db
    .select()
    .from(listings)
    .where(and(...conditions))
    .orderBy(desc(listings.featured), desc(listings.createdAt));
}

export async function getSavedFor(profileId: string) {
  const [savedPeople, savedRooms] = await Promise.all([
    db
      .select({ profile: profiles, savedAt: savedProfiles.createdAt })
      .from(savedProfiles)
      .innerJoin(profiles, eq(savedProfiles.targetProfileId, profiles.id))
      .where(eq(savedProfiles.profileId, profileId))
      .orderBy(desc(savedProfiles.createdAt)),
    db
      .select({ listing: listings, savedAt: savedListings.createdAt })
      .from(savedListings)
      .innerJoin(listings, eq(savedListings.listingId, listings.id))
      .where(eq(savedListings.profileId, profileId))
      .orderBy(desc(savedListings.createdAt)),
  ]);
  return { savedPeople, savedRooms };
}

export async function getUnreadNotificationCount(profileId: string) {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.profileId, profileId), eq(notifications.read, false)));
  return row?.value ?? 0;
}

export async function getDashboardStats(profileId: string) {
  const [likesReceived, matchesCount, unread, listingInquiries] = await Promise.all([
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(swipes)
      .where(and(eq(swipes.toProfileId, profileId), inArray(swipes.action, ["like", "superlike"]))),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(matches)
      .where(or(eq(matches.profileAId, profileId), eq(matches.profileBId, profileId))),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .innerJoin(matches, eq(conversations.matchId, matches.id))
      .where(
        and(
          or(eq(matches.profileAId, profileId), eq(matches.profileBId, profileId)),
          ne(messages.senderProfileId, profileId),
          sql`${messages.readAt} is null`,
        ),
      ),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.providerProfileId, profileId)),
  ]);

  return {
    likesReceived: likesReceived[0]?.value ?? 0,
    matches: matchesCount[0]?.value ?? 0,
    unreadMessages: unread[0]?.value ?? 0,
    listings: listingInquiries[0]?.value ?? 0,
  };
}
