import type { Metadata } from "next";
import Link from "next/link";
import { MailQuestion } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password."
      description="We'll help you get back into your account."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-primary">
          <MailQuestion className="size-5" />
        </span>
        <h2 className="mt-4 text-[15px] font-semibold">Email reset isn&apos;t connected yet</h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          This preview environment doesn&apos;t have an email provider connected,
          so we can&apos;t send a reset link. We won&apos;t pretend one was sent.
          You can sign in with the demo account, or contact support and a person
          will help you recover your account.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Button asChild className="h-11 rounded-full">
            <Link href="/login">Use the demo account</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full bg-card">
            <Link href="/contact?topic=general">Contact support</Link>
          </Button>
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Demo login: demo@nivasa.app · Password: Nivasa123!
      </p>
    </AuthShell>
  );
}
