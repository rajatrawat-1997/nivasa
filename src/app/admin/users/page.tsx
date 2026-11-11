import type { Metadata } from "next";
import Image from "next/image";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { UserAdminActions } from "@/components/admin/user-actions";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { user } from "@/lib/auth-schema";
import { profiles } from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdmin();
  const { q, role } = await searchParams;
  const roleFilter = role === "seeker" || role === "provider" ? role : undefined;

  const rows = await db
    .select({ profile: profiles, email: user.email })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(
      and(
        roleFilter ? eq(profiles.role, roleFilter) : undefined,
        q
          ? or(
              ilike(profiles.name, `%${q}%`),
              ilike(profiles.city, `%${q}%`),
              ilike(profiles.profession, `%${q}%`),
              ilike(user.email, `%${q}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(profiles.createdAt))
    .limit(200);

  const [total] = await db.select({ value: sql<number>`count(*)::int` }).from(profiles);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="People on Nivasa."
        description={`${total?.value ?? 0} profiles. Verify real people, grant provider or admin access deliberately.`}
      />

      <form
        action="/admin/users"
        className="grid gap-2.5 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
      >
        <div>
          <label className="sr-only" htmlFor="admin-users-q">
            Search members
          </label>
          <input
            id="admin-users-q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, email, city or profession"
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="admin-users-role">
            Role
          </label>
          <select
            id="admin-users-role"
            name="role"
            defaultValue={role ?? ""}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">All roles</option>
            <option value="seeker">Seekers</option>
            <option value="provider">Providers</option>
          </select>
        </div>
        <Button type="submit" className="h-10 rounded-xl px-4">
          <Search className="size-4" /> Search
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-border text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Verification</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ profile: person, email }) => (
              <tr key={person.id} className="text-[11.5px]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-secondary">
                      <Image src={person.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {person.name}, {person.age}
                        {person.isAdmin && (
                          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[8.5px] font-bold text-primary">
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">{email ?? "No email"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize",
                      person.role === "provider"
                        ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {person.role}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{person.plan}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(person.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold",
                        person.verified ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      Profile
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold",
                        person.idVerified ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      ID
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold",
                        person.phoneVerified ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      Phone
                    </span>
                  </div>
                </td>
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[11.5px] text-muted-foreground">
                  No members match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
