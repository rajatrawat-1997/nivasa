import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { conversations, matches, messages, notifications } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/session";

async function membership(profileId: string, conversationId: string) {
  const [row] = await db
    .select({ conversation: conversations, match: matches })
    .from(conversations)
    .innerJoin(matches, eq(conversations.matchId, matches.id))
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!row) return null;
  if (row.match.profileAId !== profileId && row.match.profileBId !== profileId) return null;
  const otherId = row.match.profileAId === profileId ? row.match.profileBId : row.match.profileAId;
  return { ...row, otherId };
}

export async function GET(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
  }

  const access = await membership(me.id, conversationId);
  if (!access) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(300);

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderProfileId, me.id),
        isNull(messages.readAt),
      ),
    );

  return NextResponse.json({
    messages: rows.map((row) => ({
      id: row.id,
      body: row.body,
      senderProfileId: row.senderProfileId,
      createdAt: row.createdAt.toISOString(),
      readAt: row.readAt?.toISOString() ?? null,
    })),
    otherProfileId: access.otherId,
  });
}

const sendSchema = z.object({
  conversationId: z.string().min(1, "Conversation is required."),
  body: z
    .string()
    .trim()
    .min(1, "Write a message first.")
    .max(2000, "Keep messages under 2,000 characters."),
});

export async function POST(request: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const parsed = sendSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 },
    );
  }

  const access = await membership(me.id, parsed.data.conversationId);
  if (!access) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const now = new Date();
  const [message] = await db
    .insert(messages)
    .values({
      conversationId: parsed.data.conversationId,
      senderProfileId: me.id,
      body: parsed.data.body,
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageAt: now })
    .where(eq(conversations.id, parsed.data.conversationId));

  await db.insert(notifications).values({
    profileId: access.otherId,
    type: "message",
    title: `${me.name.split(" ")[0]} sent you a message`,
    body: parsed.data.body.length > 90 ? `${parsed.data.body.slice(0, 90)}…` : parsed.data.body,
    href: `/app/messages/${parsed.data.conversationId}`,
  });

  return NextResponse.json({
    message: {
      id: message.id,
      body: message.body,
      senderProfileId: message.senderProfileId,
      createdAt: message.createdAt.toISOString(),
      readAt: null,
    },
  });
}
