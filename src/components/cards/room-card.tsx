import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BedDouble, CalendarDays, MapPin } from "lucide-react";

import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

const roomTypeLabels: Record<string, string> = {
  "private-room": "Private room",
  "shared-room": "Shared room",
  "entire-flat": "Entire flat",
  studio: "Studio",
};

export type RoomCardData = {
  id: string;
  title: string;
  rent: number;
  city: string;
  locality: string;
  roomType: string;
  furnishing: string;
  availableFrom: string;
  photos: string[];
  verified: boolean;
  amenities: string[];
  featured?: boolean;
};

export function RoomCard({
  listing,
  href,
  action,
  className,
}: {
  listing: RoomCardData;
  href?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const content = (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:card-shadow",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={listing.photos[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {listing.verified && (
              <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-semibold text-[#299D70] shadow-sm">
                <BadgeCheck className="size-3.5" /> Verified
              </span>
            )}
            {listing.featured && (
              <span className="rounded-full bg-[#252525]/85 px-2 py-1 text-[10.5px] font-semibold text-white backdrop-blur">
                Featured
              </span>
            )}
          </div>
          {action}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="font-display text-[19px] font-bold text-white">
            {formatINR(listing.rent)}
            <span className="ml-1 text-[11.5px] font-medium text-white/80">/ month</span>
          </p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-display text-[15.5px] font-semibold tracking-[-0.02em]">
          {listing.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <MapPin className="size-3.5" /> {listing.locality}, {listing.city}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-3.5" /> {roomTypeLabels[listing.roomType] ?? listing.roomType}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> Available{" "}
            {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
              new Date(listing.availableFrom),
            )}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium text-secondary-foreground"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    );
  }
  return content;
}
