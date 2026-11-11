import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ListingForm } from "@/components/app/provider/listing-form";
import { db } from "@/lib/db";
import { listings } from "@/lib/schema";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "provider") redirect("/app/provider/dashboard");

  const { listingId } = await params;
  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, listingId), eq(listings.providerProfileId, profile.id)))
    .limit(1);

  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/app/provider/listings"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Your listings
      </Link>
      <PageHeader
        eyebrow="Edit listing"
        title={listing.title}
        description={
          listing.status === "pending"
            ? "This listing is waiting for review. Saving changes keeps it in the queue."
            : "Changes to approved listings appear publicly as soon as you save."
        }
      />
      <ListingForm
        mode="edit"
        listingId={listing.id}
        initial={{
          title: listing.title,
          propertyType: listing.propertyType,
          roomType: listing.roomType,
          rent: listing.rent,
          deposit: listing.deposit,
          city: listing.city,
          locality: listing.locality,
          address: listing.address,
          description: listing.description,
          amenities: listing.amenities,
          furnishing: listing.furnishing,
          availableFrom: listing.availableFrom,
          houseRules: listing.houseRules,
          occupancy: listing.occupancy,
          photos: listing.photos,
        }}
      />
    </div>
  );
}
