import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, Sparkles, Users } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nivasa is on a mission to make finding a compatible roommate feel human, honest and safe.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Nivasa"
        title={
          <>
            Home is a <span className="text-primary">people</span> decision.
          </>
        }
        description="Nivasa started with a simple observation: finding a room is easy, but finding someone you can actually live with is hard. We're building for the harder part."
      />

      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="space-y-6 text-[15px] leading-[1.8] text-muted-foreground">
          <p>
            Most rental platforms are built around inventory. They show you a
            room, a price and a location, then leave the most important part —
            the person you&apos;ll share it with — to chance. Nivasa flips that
            order. We start with compatibility, then bring the rooms in.
          </p>
          <p>
            The name comes from the Sanskrit idea of a dwelling, but a Nivasa
            isn&apos;t just four walls. It&apos;s the feeling of coming home to
            someone who gets your routines. The person who knows you like the
            kitchen clean, who doesn&apos;t mind your early alarm, who becomes a
            friend rather than a stranger on the other side of a wall.
          </p>
          <p>
            We&apos;re building for students moving to a new city, professionals
            starting a job, and people who simply want a better flatmate. Every
            part of the product is designed around honesty: verification levels
            that mean something, compatibility scores you can understand, and
            messages that only open when both people want them.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: HeartHandshake,
              title: "People before property",
              body: "The relationship is the product. Rooms are the next step, not the whole story.",
            },
            {
              icon: Compass,
              title: "Clarity over cleverness",
              body: "If we can't explain why something is recommended, we shouldn't recommend it.",
            },
            {
              icon: Users,
              title: "Built for real life",
              body: "Different schedules, tight budgets and shared kitchens. We design for the ordinary.",
            },
            {
              icon: Sparkles,
              title: "Safety is not premium",
              body: "Verification, blocking, reporting and privacy are available on every plan.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold">{title}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-7 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            The short version
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
            Find your people. Find your place.
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            That&apos;s the whole product. Everything else is in service of it.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild className="rounded-full">
              <Link href="/signup">
                Join Nivasa <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-card">
              <Link href="/contact">Say hello</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
