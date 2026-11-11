"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PLANS, formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PlanKey = keyof typeof PLANS;

const order: { key: PlanKey; cta: string; href: string; featured?: boolean }[] = [
  { key: "free", cta: "Start for free", href: "/signup" },
  { key: "plus", cta: "Get Nivasa Plus", href: "/signup?plan=plus", featured: true },
  { key: "provider", cta: "List your room", href: "/signup?role=provider" },
];

export function PricingCards({ compact = false }: { compact?: boolean }) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1">
        {(["monthly", "yearly"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setInterval(value)}
            className={cn(
              "rounded-full px-4 py-2 text-[12.5px] font-medium capitalize transition-colors",
              interval === value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={interval === value}
          >
            {value}
            {value === "yearly" && (
              <span className="ml-1.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[9.5px] font-bold text-success">
                Save 33%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={cn("mt-8 grid gap-4", compact ? "md:grid-cols-3" : "lg:grid-cols-3")}>
        {order.map(({ key, cta, href, featured }) => {
          const plan = PLANS[key];
          const price = interval === "monthly" ? plan.price : plan.yearly;
          return (
            <div
              key={key}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6",
                featured
                  ? "border-primary/40 shadow-[0_20px_50px_-30px_rgba(242,107,91,0.5)]"
                  : "border-border",
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <p className="font-display text-[17px] font-bold">{plan.name}</p>
              <p className="mt-1 min-h-[38px] text-[12px] leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-[30px] font-extrabold tracking-[-0.04em]">
                  {price === 0 ? "Free" : formatINR(price)}
                </span>
                {price > 0 && (
                  <span className="text-[11.5px] text-muted-foreground">
                    / {interval === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>
              <Button
                asChild
                className={cn("mt-5 h-11 rounded-full", !featured && "bg-foreground text-background hover:bg-foreground/90")}
                variant={featured ? "default" : "secondary"}
              >
                <Link href={href}>{cta}</Link>
              </Button>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[12.5px]">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        Prices in INR, inclusive of taxes. Cancel any time. Payment provider
        connection is required before a plan can be activated.
      </p>
    </div>
  );
}
