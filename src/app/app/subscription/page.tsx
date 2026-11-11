import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Check, CreditCard, Sparkles, X } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { PlanButton } from "@/components/app/plan-button";
import { Button } from "@/components/ui/button";
import { PLANS, formatDate } from "@/lib/constants";
import { db } from "@/lib/db";
import { getLikeAllowance } from "@/lib/entitlements";
import { subscriptions } from "@/lib/schema";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscription" };

const planOrder = [
  { id: "free", ...PLANS.free, featured: false },
  { id: "plus", ...PLANS.plus, featured: true },
  { id: "provider", ...PLANS.provider, featured: false },
] as const;

export default async function SubscriptionPage() {
  const profile = await requireProfile();
  const [allowance, history] = await Promise.all([
    getLikeAllowance(profile),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.profileId, profile.id))
      .orderBy(desc(subscriptions.startedAt)),
  ]);

  const currentPlan = planOrder.find((plan) => plan.id === profile.plan) ?? planOrder[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Subscription"
        title="Choose how you find your fit."
        description="Start free. Upgrade when you want to see every like, move faster, or list rooms as a provider."
      />

      <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#252525] p-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/25 blur-3xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F9B4A9]">
            Current plan
          </p>
          <h2 className="mt-1.5 font-display text-[24px] font-extrabold tracking-[-0.04em]">
            {currentPlan.name}
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-white/60">
            {profile.plan === "free"
              ? `Free includes ${allowance.limit ?? 5} likes per day and unlimited browsing.`
              : profile.planRenewsAt
                ? `Renews ${formatDate(profile.planRenewsAt)} · ${profile.planInterval ?? "monthly"} billing`
                : "Active on this account."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-white/10 px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Likes today</p>
              <p className="mt-0.5 text-[12px] font-semibold">
                {allowance.unlimited ? "Unlimited" : `${allowance.used}/${allowance.limit}`}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Renewal</p>
              <p className="mt-0.5 text-[12px] font-semibold">
                {profile.plan === "free" ? "No renewal" : profile.planRenewsAt ? formatDate(profile.planRenewsAt) : "—"}
              </p>
            </div>
          </div>
          {profile.plan === "free" && (
            <Button asChild className="mt-4 h-9 rounded-full bg-white text-[#252525] hover:bg-white/90">
              <a href="#plans">
                <Sparkles className="size-3.5" /> See what Plus unlocks
              </a>
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.02em]">
            <CreditCard className="size-4 text-primary" /> Payments
          </h2>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
            Card payments aren&apos;t connected to this deployment yet, so no plan can be purchased
            and no money changes hands. Choosing a plan saves your interest and explains what will
            happen once checkout is live.
          </p>
          <div className="mt-3 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
            No payment provider is connected. We never mark a plan as active without a real,
            confirmed payment.
          </div>
        </div>
      </section>

      <section id="plans" className="grid gap-4 lg:grid-cols-3">
        {planOrder.map((plan) => {
          const isCurrent = profile.plan === plan.id;
          const available = plan.id !== "provider" || profile.role === "provider";
          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-5",
                plan.featured ? "border-primary shadow-[0_18px_50px_-30px_rgba(242,107,91,0.7)]" : "border-border",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-[17px] font-bold tracking-[-0.02em]">{plan.name}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <p className="mt-3 font-display text-[26px] font-extrabold tracking-[-0.04em]">
                {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                {plan.price > 0 && (
                  <span className="ml-1 text-[11px] font-medium text-muted-foreground">/ month</span>
                )}
              </p>
              {plan.price > 0 && (
                <p className="text-[10.5px] text-muted-foreground">
                  or ₹{plan.yearly.toLocaleString("en-IN")} / year
                </p>
              )}

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[11.5px] text-muted-foreground">
                    {plan.id === "free" ? (
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                    ) : (
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                    )}
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {plan.id === "free" ? (
                  <Button disabled variant="outline" className="w-full rounded-full bg-card">
                    {isCurrent ? "Current plan" : "Included by default"}
                  </Button>
                ) : !available ? (
                  <Button disabled variant="outline" className="w-full rounded-full bg-card">
                    <X className="size-3.5" /> For providers
                  </Button>
                ) : (
                  <PlanButton
                    planName={plan.name}
                    price={plan.price}
                    interval="monthly"
                    current={isCurrent}
                    featured={plan.featured}
                  />
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Billing history</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            No billing history yet. Payments will appear here once a provider is connected.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {history.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2.5 text-[11.5px]">
                <div>
                  <p className="font-medium capitalize">
                    {row.plan} · {row.interval}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Started {formatDate(row.startedAt)} · {row.provider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{row.amount.toLocaleString("en-IN")}</p>
                  <p className="text-[9.5px] capitalize text-muted-foreground">{row.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
