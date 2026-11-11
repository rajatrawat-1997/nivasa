import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/brand/logo";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <span className="hidden items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-primary sm:flex">
              <ShieldCheck className="size-3" /> Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              {profile.name}
            </span>
            <Link
              href="/app/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium hover:bg-secondary"
            >
              <ArrowLeft className="size-3" /> Back to Nivasa
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
