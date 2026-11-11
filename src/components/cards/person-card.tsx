import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Briefcase, MapPin } from "lucide-react";

import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PersonCardProps = {
  id?: string;
  name: string;
  age: number;
  profession: string;
  city: string;
  locality?: string;
  avatarUrl: string;
  budgetMin: number;
  budgetMax: number;
  compatibility?: number;
  tags?: string[];
  verified?: boolean;
  href?: string;
  className?: string;
};

export function PersonCard({
  name,
  age,
  profession,
  city,
  locality,
  avatarUrl,
  budgetMin,
  budgetMax,
  compatibility,
  tags = [],
  verified,
  href,
  className,
}: PersonCardProps) {
  const content = (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:card-shadow",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Image
          src={avatarUrl}
          alt={`${name}, ${age}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {typeof compatibility === "number" && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-sm backdrop-blur">
            {compatibility}% match
          </span>
        )}
        {verified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10.5px] font-medium text-white backdrop-blur">
            <BadgeCheck className="size-3.5" /> Verified
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-display text-[19px] font-bold tracking-[-0.03em]">
            {name}, {age}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/85">
            <Briefcase className="size-3" /> {profession}
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <MapPin className="size-3.5" /> {locality ? `${locality}, ` : ""}
          {city}
        </p>
        <p className="mt-2 text-[13px] font-semibold">
          {formatINR(budgetMin)}–{formatINR(budgetMax)}
          <span className="ml-1 text-[11.5px] font-normal text-muted-foreground">/ month</span>
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        {content}
      </Link>
    );
  }
  return content;
}
