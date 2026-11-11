import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Housing preferences" };

export default async function HousingPreferencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding/basic-details");
  return <OnboardingWizard step="housing" profile={profile} />;
}
