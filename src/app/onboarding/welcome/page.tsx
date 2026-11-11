import type { Metadata } from "next";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Welcome to Nivasa" };

export default async function OnboardingWelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const [profile, params] = await Promise.all([getCurrentProfile(), searchParams]);
  return <OnboardingWizard step="welcome" profile={profile} initialRole={params.role} />;
}
