import type { Metadata } from "next";

import { PageHeader } from "@/components/app/page-header";
import { PreferencesForm } from "@/components/app/preferences-form";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Preferences" };

export default async function PreferencesPage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Define your fit."
        description="The more accurate this is, the better your compatibility scores — and the fewer wasted conversations."
      />
      <PreferencesForm lifestyle={profile.lifestyle} housing={profile.housing} />
    </div>
  );
}
