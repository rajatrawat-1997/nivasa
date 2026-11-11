import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, MailWarning } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const verified = session.user.emailVerified;

  return (
    <AuthShell
      title={verified ? "You're verified." : "One last check."}
      description="Email verification keeps your account recoverable and your matches safer."
      footer={
        <Link href="/app/dashboard" className="font-semibold text-foreground hover:underline">
          Go to your dashboard
        </Link>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-5">
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${
            verified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}
        >
          {verified ? <BadgeCheck className="size-5" /> : <MailWarning className="size-5" />}
        </span>
        <h2 className="mt-4 text-[15px] font-semibold">
          {verified ? "Email verified" : "Verification email unavailable in this preview"}
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {verified
            ? `Thanks — ${session.user.email} is confirmed. You can use every part of Nivasa.`
            : "No email provider is connected to this environment yet, so we can't send a verification link. Your account works, but we don't show a verified badge for your email until it is actually confirmed."}
        </p>
        <Button asChild className="mt-5 h-11 w-full rounded-full">
          <Link href="/app/dashboard">Continue to Nivasa</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
