import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  Flag,
  Fingerprint,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserX,
} from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "How Nivasa approaches trust and safety: verification, mutual-match messaging, reporting, privacy controls and practical guidance for meeting a new roommate.",
};

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust & safety"
        title={
          <>
            Trust is the <span className="text-primary">whole point.</span>
          </>
        }
        description="Meeting a new roommate is a big deal. These are the controls, checks and habits that make Nivasa a safer place to start."
        primary={{ label: "Read the community rules", href: "/terms" }}
        secondary={{ label: "Report a concern", href: "/contact?topic=safety" }}
      />

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Profile verification",
              body: "Email and phone verification are available to everyone. Optional ID verification is reviewed by our team — we display the level of verification, never a vague claim.",
            },
            {
              icon: MessageCircle,
              title: "Mutual-match messaging",
              body: "No one can send you a message until you have both liked each other. Pre-match messaging is not enabled by default.",
            },
            {
              icon: Fingerprint,
              title: "Listing review",
              body: "New and edited listings are reviewed before going live. Providers must use photos of the actual space.",
            },
            {
              icon: LockKeyhole,
              title: "Private by default",
              body: "Your phone number, email, exact address and identity documents are never shown publicly. You decide what appears on your profile.",
            },
            {
              icon: Flag,
              title: "Reporting that works",
              body: "Report a profile, listing or message from anywhere in the product. Reports go to a human review queue with an audit trail.",
            },
            {
              icon: UserX,
              title: "Block and unmatch",
              body: "Blocking is immediate and silent. Unmatching closes the conversation and removes the connection from both people's lists.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold">{title}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary">
                Before you meet
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-[-0.045em]">
                Meet safely. Move confidently.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
                We can build safer tools, but the best protection is a good
                process. These simple habits make a real difference.
              </p>
              <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-5">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  <ShieldCheck className="size-4 text-warning" /> Never transfer money before viewing
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  No genuine provider needs a deposit before you have seen the
                  room. Nivasa will never ask you to pay a holding fee by
                  message, and we do not process rent payments.
                </p>
              </div>
            </div>

            <ol className="space-y-4">
              {[
                {
                  title: "Video call first",
                  body: "A short call confirms the person and the space before you travel. It also gives you a feel for how they communicate.",
                },
                {
                  title: "Meet in a public place",
                  body: "For a first meeting, choose a café or co-working space nearby. Tell a friend where you are going and when you expect to be back.",
                },
                {
                  title: "View the room in daylight",
                  body: "Check water pressure, locks, ventilation, internet and the neighbours. Visit the building's shared areas, not just the room.",
                },
                {
                  title: "Get the agreement in writing",
                  body: "Rent, deposit, notice period, utilities and house rules should be agreed in writing before any money changes hands.",
                },
                {
                  title: "Keep conversations on Nivasa",
                  body: "Messages on Nivasa can be reported. Be cautious if someone insists on moving to another app immediately.",
                },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-10">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-primary">
              <Eye className="size-5.5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.03em]">
                What happens when you report something
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Every report is logged and reviewed. Depending on what we find,
                we may remove content, require verification, suspend an account
                or involve law enforcement where there is an immediate risk.
                You&apos;ll be told the outcome where we can share it.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button asChild className="rounded-full">
                  <Link href="/contact?topic=safety">Report a concern</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full bg-card">
                  <Link href="/faq">Safety FAQ</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
