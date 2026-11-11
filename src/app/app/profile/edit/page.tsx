import type { Metadata } from "next";

import { PageHeader } from "@/components/app/page-header";
import { ProfileEditForm } from "@/components/app/profile-edit-form";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edit profile"
        title="Keep your profile current."
        description="Small details help the right people find you — and help you filter out the wrong fits early."
      />
      <ProfileEditForm
        initial={{
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          city: profile.city,
          locality: profile.locality,
          profession: profile.profession,
          company: profile.company,
          bio: profile.bio,
          photos: profile.photos,
          avatarUrl: profile.avatarUrl,
          budgetMin: profile.budgetMin,
          budgetMax: profile.budgetMax,
          moveInDate: profile.moveInDate,
          languages: profile.languages,
        }}
      />
    </div>
  );
}
