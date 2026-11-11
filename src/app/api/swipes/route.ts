import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateCompatibility } from "@/lib/compatibility";
import { getCompatibilityWeights } from "@/lib/queries";
import { db } from "@/lib/db";
import { blockedUsers, conversations, matches, notifications, profiles, swipes } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";
import { getLikeAllowance } from "@/lib/entitlements";

const bodySchema = z.object({
  targetProfileId: z.string().min(1),
  action: z.enum(["like", "pass", "superlike"]),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid swipe." }, { status: 400 });
  }
  const { targetProfileId, action } = parsed.data;

  if (targetProfileId === me.id) {
    return NextResponse.json({ error: "You can't swipe on your own profile." }, { status: 400 });
  }

  const [target] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, targetProfileId))
    .limit(1);
  if (!target) {
    return NextResponse.json({ error: "That profile is no longer available." }, { status: 404 });
  }

  const [blocked] = await db
    .select()
    .from(blockedUsers)
    .where(
      and(
        eq(blockedUsers.profileId, me.id),
        eq(blockedUsers.blockedProfileId, target.id),
      ),
    )
    .limit(1);
  if (blocked) {
    return NextResponse.json({ error: "This profile is unavailable." }, { status: 403 });
  }

  const existing = await db
    .select()
    .from(swipes)
    .where(and(eq(swipes.fromProfileId, me.id), eq(swipes.toProfileId, target.id)))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "You've already decided on this profile." }, { status: 409 });
  }

  if (action === "superlike" && me.plan !== "plus") {
    return NextResponse.json(
      {
        error:
          "Super Likes are part of Nivasa Plus. Upgrade to send one, or like the profile instead.",
        code: "premium_required",
      },
      { status: 403 },
    );
  }

  if (action !== "pass") {
    const allowance = await getLikeAllowance(me);
    if (!allowance.unlimited && allowance.remaining <= 0) {
      return NextResponse.json(
        {
          error:
            "You've used today's 5 likes. Upgrade to Nivasa Plus for unlimited discovery, or come back tomorrow.",
          code: "like_limit",
        },
        { status: 403 },
      );
    }
  }

  await db.insert(swipes).values({
    fromProfileId: me.id,
    toProfileId: target.id,
    action,
  });

  if (action === "pass") {
    return NextResponse.json({ matched: false });
  }

  const reciprocal = await db
    .select()
    .from(swipes)
    .where(
      and(
        eq(swipes.fromProfileId, target.id),
        eq(swipes.toProfileId, me.id),
        inArray(swipes.action, ["like", "superlike"]),
      ),
    )
    .limit(1);

  if (reciprocal.length === 0) {
    await db.insert(notifications).values({
      profileId: target.id,
      type: "like",
      title: "Someone liked your profile",
      body: "Open your likes to see who's interested and whether you feel the same.",
      href: "/app/likes",
    });
    return NextResponse.json({ matched: false });
  }

  const weights = await getCompatibilityWeights();
  const compatibility = calculateCompatibility(me, target, weights).overall;
  const [profileAId, profileBId] = [me.id, target.id].sort();

  let matchId: string;
  const [existingMatch] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.profileAId, profileAId), eq(matches.profileBId, profileBId)))
    .limit(1);

  if (existingMatch) {
    matchId = existingMatch.id;
  } else {
    const [created] = await db
      .insert(matches)
      .values({ profileAId, profileBId, compatibility })
      .returning();
    matchId = created.id;
  }

  let conversationId: string;
  const [existingConversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.matchId, matchId))
    .limit(1);

  if (existingConversation) {
    conversationId = existingConversation.id;
  } else {
    const [created] = await db
      .insert(conversations)
      .values({ matchId })
      .returning();
    conversationId = created.id;
  }

  await db.insert(notifications).values([
    {
      profileId: target.id,
      type: "match",
      title: `It's a match with ${me.name.split(" ")[0]}`,
      body: "You both liked each other. Start the conversation while it's fresh.",
      href: `/app/messages/${conversationId}`,
    },
    {
      profileId: me.id,
      type: "match",
      title: `It's a match with ${target.name.split(" ")[0]}`,
      body: "You both liked each other. Start the conversation while it's fresh.",
      href: `/app/messages/${conversationId}`,
    },
  ]);

  return NextResponse.json({
    matched: true,
    matchId,
    conversationId,
    compatibility,
    profile: {
      id: target.id,
      name: target.name,
      avatarUrl: target.avatarUrl,
      city: target.city,
    },
  });
}
