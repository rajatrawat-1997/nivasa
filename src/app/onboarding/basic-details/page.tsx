import type { Metadata } from "next";

import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Your details" };

export default async function BasicDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const [profile, params] = await Promise.all([getCurrentProfile(), searchParams]);
  return <OnboardingWizard step="basic" profile={profile} initialRole={params.role} />;
}
