import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = { title: "You're all set" };

export default async function CompletePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding/basic-details");
  return <OnboardingWizard step="complete" profile={profile} />;
}
