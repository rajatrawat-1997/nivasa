import { and, eq, isNull, ne, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { db } from "@/lib/db";
import { conversations, matches, messages, notifications } from "@/lib/schema";
import { requireProfile } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  if (!profile.onboardingComplete) redirect("/onboarding/welcome");

  const [notificationCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.profileId, profile.id), eq(notifications.read, false)));

  const [messageCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .innerJoin(matches, eq(conversations.matchId, matches.id))
    .where(
      and(
        or(eq(matches.profileAId, profile.id), eq(matches.profileBId, profile.id)),
        ne(messages.senderProfileId, profile.id),
        isNull(messages.readAt),
      ),
    );

  return (
    <AppShell
      profile={{
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        city: profile.city,
        plan: profile.plan,
        isAdmin: profile.isAdmin,
      }}
      unreadNotifications={notificationCount?.value ?? 0}
      unreadMessages={messageCount?.value ?? 0}
    >
      {children}
    </AppShell>
  );
}
