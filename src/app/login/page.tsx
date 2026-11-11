import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app/dashboard");
  const { redirectTo } = await searchParams;

  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to pick up where you left off. Your next match might be one swipe away."
      footer={
        <>
          New to Nivasa?{" "}
          <Link href="/signup" className="font-semibold text-foreground hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
