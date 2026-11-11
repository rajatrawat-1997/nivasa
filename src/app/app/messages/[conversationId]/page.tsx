import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ChatShell } from "@/components/app/chat-shell";
import { db } from "@/lib/db";
import { messages } from "@/lib/schema";
import { getConversation } from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const profile = await requireProfile();
  const { conversationId } = await params;

  const data = await getConversation(profile.id, conversationId);
  if (!data) notFound();

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(300);

  return (
    <ChatShell
      conversationId={conversationId}
      me={{ id: profile.id, name: profile.name }}
      other={{
        id: data.other.id,
        name: data.other.name,
        avatarUrl: data.other.avatarUrl,
        profession: data.other.profession,
        city: data.other.city,
        verified: data.other.verified,
      }}
      compatibility={data.match.compatibility}
      initialMessages={rows.map((row) => ({
        id: row.id,
        body: row.body,
        senderProfileId: row.senderProfileId,
        createdAt: row.createdAt.toISOString(),
        readAt: row.readAt?.toISOString() ?? null,
      }))}
    />
  );
}
