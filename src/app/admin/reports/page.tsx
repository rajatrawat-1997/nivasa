import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Flag } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ReportActions } from "@/components/admin/report-actions";
import { formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { profiles, reports } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin reports" };

const statusStyles: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  reviewing: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  dismissed: "bg-secondary text-muted-foreground",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeStatus = ["open", "reviewing", "resolved", "dismissed"].includes(status ?? "")
    ? (status as "open" | "reviewing" | "resolved" | "dismissed")
    : undefined;

  const rows = await db
    .select({ report: reports, reporter: profiles })
    .from(reports)
    .innerJoin(profiles, eq(reports.reporterProfileId, profiles.id))
    .where(activeStatus ? eq(reports.status, activeStatus) : undefined)
    .orderBy(desc(reports.createdAt))
    .limit(200);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Safety reports."
        description="Every report is confidential. Investigate, document the outcome and keep the platform safe."
      />

      <div className="inline-flex flex-wrap rounded-full border border-border bg-card p-1">
        {[
          { value: "all", label: "All" },
          { value: "open", label: "Open" },
          { value: "reviewing", label: "Reviewing" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/reports" : `/admin/reports?status=${tab.value}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              (activeStatus ?? "all") === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <Flag className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-[12px] font-medium">No reports in this view</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            New safety reports from members appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ report, reporter }) => {
            const targetHref =
              report.targetType === "profile"
                ? `/app/profile?preview=${report.targetId}`
                : report.targetType === "listing"
                  ? `/rooms/${report.targetId}`
                  : null;
            return (
              <article key={report.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize",
                      statusStyles[report.status] ?? "bg-secondary",
                    )}
                  >
                    {report.status}
                  </span>
                  <span className="text-[12px] font-semibold">{report.reason}</span>
                  <span className="text-[9.5px] text-muted-foreground">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Reported by {reporter.name} · target {report.targetType}
                  {targetHref && (
                    <>
                      {" "}
                      <Link href={targetHref} className="underline hover:text-foreground">
                        open target
                      </Link>
                    </>
                  )}
                </p>
                {report.details && (
                  <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-[11.5px] leading-relaxed">
                    {report.details}
                  </p>
                )}
                <div className="mt-3">
                  <ReportActions reportId={report.id} status={report.status} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
