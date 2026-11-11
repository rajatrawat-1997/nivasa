import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Your lifestyle" };

export default async function LifestylePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding/basic-details");
  return <OnboardingWizard step="lifestyle" profile={profile} />;
}
