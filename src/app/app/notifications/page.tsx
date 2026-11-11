import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

import { NotificationList } from "@/components/app/notification-list";
import { PageHeader } from "@/components/app/page-header";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireProfile();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profile.id))
    .orderBy(desc(notifications.createdAt))
    .limit(80);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="What's new."
        description="Matches, messages, likes and room inquiries — all in one timeline."
      />
      <NotificationList
        items={rows.map((row) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          body: row.body,
          href: row.href,
          read: row.read,
          createdAt: row.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
