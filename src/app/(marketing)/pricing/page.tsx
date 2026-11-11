import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { PricingCards } from "@/components/marketing/pricing-cards";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Nivasa is free to join. Nivasa Plus unlocks unlimited discovery and deeper compatibility insights. Provider Pro helps you fill rooms with the right person.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Find your people. <span className="text-primary">Start free.</span>
          </>
        }
        description="Join, build your profile and start matching without paying anything. Upgrade only when you want more control over your search."
      />

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <PricingCards />

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { title: "No hidden platform fees", body: "Browse and inquire about rooms without a booking commission." },
            { title: "Cancel any time", body: "Annual plans are prepaid, monthly plans can be cancelled before renewal." },
            { title: "Honest entitlements", body: "A plan only activates after the payment provider confirms it." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <ShieldCheck className="size-5 text-success" />
              <h2 className="mt-3 text-[14px] font-semibold">{item.title}</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-[-0.04em]">
            Pricing questions
          </h2>
          <Accordion type="single" collapsible className="mt-8">
            {[
              {
                q: "Is Nivasa really free to join?",
                a: "Yes. The free plan lets you complete your profile, discover people, match mutually, message your matches and browse every room. Paid plans add convenience and reach — not access to basic safety features.",
              },
              {
                q: "What does Nivasa Plus include?",
                a: "Unlimited discovery and likes, the ability to see who liked you, three Super Likes a day, advanced compatibility insights and a monthly profile boost.",
              },
              {
                q: "How does provider pricing work?",
                a: "Provider Pro supports up to ten active listings, featured placement, listing analytics and a lead inbox. Every new listing is reviewed before it goes live.",
              },
              {
                q: "Can I get a refund?",
                a: "Plan purchases are handled by the connected payment provider under its refund policy. Contact us within seven days of a charge and we'll help you resolve it.",
              },
              {
                q: "Do you store my card details?",
                a: "No. Card details are handled entirely by the payment provider. Nivasa only stores the plan, interval and subscription status.",
              },
            ].map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-[14px] font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
            <div>
              <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                <Check className="size-4 text-success" /> Still deciding?
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Try the demo account and explore the product before signing up.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/login">
                Try the demo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
