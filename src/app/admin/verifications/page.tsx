import type { Metadata } from "next";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { UserAdminActions } from "@/components/admin/user-actions";
import { formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { user } from "@/lib/auth-schema";
import { profiles } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin verifications" };

export default async function AdminVerificationsPage() {
  await requireAdmin();

  const rows = await db
    .select({ profile: profiles, email: user.email, emailVerified: user.emailVerified })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .orderBy(desc(profiles.createdAt))
    .limit(200);

  const pending = rows.filter((row) => !row.profile.idVerified || !row.profile.phoneVerified);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Verification queue."
        description="Phone and ID checks are reviewed manually while an automated provider isn't connected. Verify only what you can actually confirm."
      />

      <div className="rounded-2xl border border-warning/25 bg-warning/5 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">{pending.length}</strong> members still have a
        verification step outstanding. Approving ID marks the member as verified across Nivasa.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-border text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ profile: person, email, emailVerified }) => (
              <tr key={person.id} className="text-[11.5px]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-secondary">
                      <Image src={person.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {person.name}, {person.age}
                      </p>
                      <p className="text-[10px] capitalize text-muted-foreground">{person.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted-foreground">{email ?? "—"}</p>
                  <span
                    className={
                      emailVerified
                        ? "text-[9.5px] font-semibold text-success"
                        : "text-[9.5px] text-muted-foreground"
                    }
                  >
                    {emailVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      person.phoneVerified
                        ? "rounded-full bg-success/10 px-2 py-0.5 text-[9.5px] font-semibold text-success"
                        : "rounded-full bg-secondary px-2 py-0.5 text-[9.5px] text-muted-foreground"
                    }
                  >
                    {person.phoneVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      person.idVerified
                        ? "rounded-full bg-success/10 px-2 py-0.5 text-[9.5px] font-semibold text-success"
                        : "rounded-full bg-secondary px-2 py-0.5 text-[9.5px] text-muted-foreground"
                    }
                  >
                    {person.idVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(person.createdAt)}</td>
                <td className="px-4 py-3">
                  <UserAdminActions
                    profileId={person.id}
                    name={person.name}
                    verified={person.verified}
                    idVerified={person.idVerified}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck className="size-3" /> Email verification is handled by Better Auth. Phone and
        ID are manual grants in this deployment.
      </p>
    </div>
  );
}
