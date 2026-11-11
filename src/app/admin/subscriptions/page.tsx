import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { profiles, subscriptions } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin subscriptions" };

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  cancelled: "bg-secondary text-muted-foreground",
  past_due: "bg-warning/10 text-warning",
};

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const rows = await db
    .select({ subscription: subscriptions, profile: profiles })
    .from(subscriptions)
    .innerJoin(profiles, eq(subscriptions.profileId, profiles.id))
    .orderBy(desc(subscriptions.startedAt));

  const [revenue] = await db
    .select({ value: sql<number>`coalesce(sum(${subscriptions.amount}), 0)::int` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  const activeCount = rows.filter((row) => row.subscription.status === "active").length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Subscriptions."
        description="Plans granted on this deployment. Card payments are not connected, so every subscription here is a manual grant — no card was charged."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">Active</p>
          <p className="mt-1 font-display text-[22px] font-extrabold">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">
            Recorded value
          </p>
          <p className="mt-1 font-display text-[22px] font-extrabold">
            ₹{(revenue?.value ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">Provider</p>
          <p className="mt-1 text-[12px] font-semibold">Not connected</p>
          <p className="text-[10px] text-muted-foreground">No payment gateway configured</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
          <CreditCard className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-[12px] font-medium">No subscriptions recorded</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Once a payment provider is connected, plan purchases will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-border text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Started</th>
                <th className="px-4 py-3 font-semibold">Renews</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ subscription, profile }) => (
                <tr key={subscription.id} className="text-[11.5px]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/profile?preview=${profile.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {profile.name}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">{profile.city}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {subscription.plan} · {subscription.interval}
                  </td>
                  <td className="px-4 py-3">₹{subscription.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(subscription.startedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {subscription.renewsAt ? formatDate(subscription.renewsAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize",
                        statusStyles[subscription.status],
                      )}
                    >
                      {subscription.status}
                    </span>
                    <p className="mt-0.5 text-[9px] capitalize text-muted-foreground">
                      via {subscription.provider}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
