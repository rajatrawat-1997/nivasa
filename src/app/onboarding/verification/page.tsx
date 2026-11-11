import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile, getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Verification" };

export default async function VerificationPage() {
  const [profile, session] = await Promise.all([getCurrentProfile(), getSession()]);
  if (!profile) redirect("/onboarding/basic-details");
  return (
    <OnboardingWizard
      step="verification"
      profile={profile}
      email={session?.user.email}
      emailVerified={session?.user.emailVerified}
    />
  );
}
