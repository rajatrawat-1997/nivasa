import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; plan?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/app/dashboard");
  const { role, plan } = await searchParams;

  return (
    <AuthShell
      title="Find your people."
      description="Create a free account, tell us how you live, and start meeting people who actually fit."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm role={role} plan={plan} />
    </AuthShell>
  );
}
