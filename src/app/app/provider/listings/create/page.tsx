import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ListingForm } from "@/components/app/provider/listing-form";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "List a room" };

export default async function CreateListingPage() {
  const profile = await requireProfile();
  if (profile.role !== "provider") redirect("/app/provider/dashboard");

  return (
    <div className="space-y-6">
      <Link
        href="/app/provider/listings"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Your listings
      </Link>
      <PageHeader
        eyebrow="New listing"
        title="Tell people about the room."
        description="Be specific about the space and the kind of flatmate it suits. Honest listings get better inquiries and fewer wasted visits."
      />
      <ListingForm mode="create" />
    </div>
  );
}
