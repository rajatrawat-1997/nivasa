import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 size-[460px] rounded-full bg-[radial-gradient(circle,rgba(242,107,91,0.13),transparent_65%)]" />
        <div className="absolute inset-0 grain opacity-30" />
      </div>
      <div className="relative mx-auto max-w-4xl px-5 py-16 text-center lg:px-8 lg:py-24">
        {eyebrow && (
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-balance font-display text-[2.5rem] font-extrabold leading-[1.06] tracking-[-0.05em] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {(primary || secondary) && (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {primary && (
              <Button asChild size="lg" className="h-11 rounded-full px-6">
                <Link href={primary.href}>
                  {primary.label} <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
            {secondary && (
              <Button asChild size="lg" variant="outline" className="h-11 rounded-full bg-card px-6">
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
