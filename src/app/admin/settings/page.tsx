import type { Metadata } from "next";
import { desc } from "drizzle-orm";

import { PageHeader } from "@/components/app/page-header";
import { WeightsForm } from "@/components/admin/weights-form";
import { db } from "@/lib/db";
import { getCompatibilityWeights } from "@/lib/queries";
import { auditLogs } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [weights, logs] = await Promise.all([
    getCompatibilityWeights(),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(10),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Platform settings."
        description="Tune how compatibility is calculated and review recent administrative actions."
      />

      <section>
        <h2 className="mb-3 font-display text-[15px] font-bold tracking-[-0.02em]">
          Compatibility weights
        </h2>
        <WeightsForm initial={weights} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Recent audit log</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-[11.5px] text-muted-foreground">No admin actions recorded yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[11.5px] font-medium">{log.action}</p>
                  <p className="text-[10px] text-muted-foreground">{log.target}</p>
                </div>
                <span className="shrink-0 text-[9.5px] text-muted-foreground">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
