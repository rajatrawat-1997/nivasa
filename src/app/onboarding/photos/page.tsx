import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Add your photos" };

export default async function PhotosPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding/basic-details");
  return <OnboardingWizard step="photos" profile={profile} />;
}
