import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  HeartHandshake,
  Home,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Nivasa matches roommates: build a lifestyle profile, discover compatible people with honest scores, match mutually and find a home together.",
};

const factors = [
  { label: "Cleanliness", weight: "15%", body: "How tidy you both keep shared spaces." },
  { label: "Sleep schedule", weight: "12%", body: "Early bird, night owl or flexible." },
  { label: "Budget", weight: "15%", body: "Whether your monthly ranges genuinely overlap." },
  { label: "Location", weight: "15%", body: "City and neighbourhood overlap." },
  { label: "Food", weight: "8%", body: "Vegetarian, vegan, non-veg or flexible." },
  { label: "Smoking", weight: "10%", body: "A smoke-free home or a shared habit." },
  { label: "Guests", weight: "8%", body: "How often friends and family visit." },
  { label: "Social life", weight: "7%", body: "Hosting, nights in and noise expectations." },
  { label: "Work routine", weight: "5%", body: "Home, office, hybrid or student life." },
  { label: "Pets", weight: "5%", body: "Whether a pet is part of the home." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How Nivasa works"
        title={
          <>
            Less guessing. <span className="text-primary">More fitting.</span>
          </>
        }
        description="Nivasa is built around one idea: the right roommate makes a home. Here's exactly how we help you find them."
        primary={{ label: "Create your profile", href: "/signup" }}
        secondary={{ label: "Explore rooms", href: "/rooms" }}
      />

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="space-y-4">
          {[
            {
              step: "01",
              icon: Sparkles,
              title: "Tell us how you actually live",
              body: "Answer a short lifestyle questionnaire — cleanliness, sleep, food, smoking, pets, guests, work and budget. It takes about four minutes and it's the foundation of every match. You can change your answers any time.",
            },
            {
              step: "02",
              icon: Search,
              title: "Discover people who fit",
              body: "Swipe through real, verified profiles. Each card shows a compatibility score built from your answers, plus lifestyle tags and the reasons behind the match. Use filters for city, budget, move-in date and more.",
            },
            {
              step: "03",
              icon: HeartHandshake,
              title: "Match only when it's mutual",
              body: "A like is private. When two people like each other, it becomes a match and a conversation opens. Nobody can message you before that — and you can unmatch at any time.",
            },
            {
              step: "04",
              icon: Home,
              title: "Find the place together",
              body: "Browse verified rooms, save the ones you love, and send an inquiry directly to the provider. Or use a match's saved rooms as a starting point for your search.",
            },
          ].map(({ step, icon: Icon, title, body }) => (
            <div
              key={step}
              className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-primary">
                <Icon className="size-5.5" />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {step}
                </p>
                <h2 className="mt-1 font-display text-[21px] font-bold tracking-[-0.03em]">
                  {title}
                </h2>
                <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
                The compatibility engine
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-[-0.045em]">
                A score you can understand.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
                We don&apos;t invent percentages. Every score is calculated from
                the answers both people gave, using weighted categories. Admin
                teams can tune the weights without touching the code.
              </p>
              <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  <ShieldCheck className="size-4 text-success" /> What we never do
                </p>
                <ul className="mt-3 space-y-2 text-[12.5px] text-muted-foreground">
                  {[
                    "Show a score when either profile is incomplete.",
                    "Expose private contact details or exact addresses.",
                    "Let anyone message you before a mutual match.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {factors.map((factor) => (
                <div
                  key={factor.label}
                  className="rounded-xl border border-border bg-card px-4 py-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold">{factor.label}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                      {factor.weight}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                    {factor.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-border bg-card p-7 sm:flex-row sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-primary">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-[17px] font-bold">Still have questions?</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Read the FAQ, or talk to a real person. We reply within one working day.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Button asChild variant="outline" className="rounded-full bg-card">
                <Link href="/faq">Read FAQ</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
