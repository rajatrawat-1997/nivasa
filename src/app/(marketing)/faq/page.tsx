import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Nivasa roommate matching, rooms, verification, privacy and plans.",
};

const groups = [
  {
    title: "Roommate matching",
    items: [
      {
        q: "How does Nivasa decide who I see?",
        a: "We look at your housing preferences (city, neighbourhood, budget and move-in date) and your lifestyle answers. People outside your filters are excluded. Everyone you see is a real profile, and the compatibility score is calculated from both profiles — never generated randomly.",
      },
      {
        q: "What is a mutual match?",
        a: "A like is always private. When you and another person both like each other, you get a match, a celebration screen and a conversation. You can unmatch at any time from the match card or chat.",
      },
      {
        q: "Can I change my answers later?",
        a: "Yes. Open Preferences in your account to update your lifestyle and housing answers. Your compatibility scores recalculate the next time you refresh discovery.",
      },
      {
        q: "Why is my compatibility score low with someone I like?",
        a: "The score is a reflection of the answers both of you gave, weighted by what tends to matter most in shared living. You can always like someone anyway — compatibility is a guide, not a rule.",
      },
    ],
  },
  {
    title: "Rooms and providers",
    items: [
      {
        q: "Are listings verified?",
        a: "Every new or edited listing is reviewed before it goes live. Listings can carry a verified badge once our team has confirmed the photos and basic property details. Always view a room yourself before paying anything.",
      },
      {
        q: "Does Nivasa handle rent or deposits?",
        a: "No. Rent and deposits are agreed directly with the provider. We never ask you to send a holding fee through the platform, and we do not process rent payments.",
      },
      {
        q: "How do I list my room?",
        a: "Create an account, switch to the provider dashboard and publish a listing. Add real photos, rent, deposit, availability and house rules. It stays pending until reviewed.",
      },
    ],
  },
  {
    title: "Safety and privacy",
    items: [
      {
        q: "Who can see my phone number or address?",
        a: "Nobody by default. Your phone number is used for verification only. Exact addresses on listings are private and shared by the provider after you inquire.",
      },
      {
        q: "How do I report a profile or listing?",
        a: "Use the report action on any profile, listing or conversation. Reports go to our moderation queue with an audit trail. If there is an immediate risk to someone's safety, contact local emergency services first.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Settings includes account deletion. We remove your profile, photos and matches. Some records may be retained where required by law or for fraud prevention.",
      },
    ],
  },
  {
    title: "Plans and payments",
    items: [
      {
        q: "Is Nivasa free?",
        a: "Yes. The free plan includes your profile, discovery, mutual matches, basic messaging and room browsing. Nivasa Plus adds convenience features. Provider Pro is for people listing rooms.",
      },
      {
        q: "Do you store my card details?",
        a: "No. Card details are handled by the connected payment provider. We store only your plan, billing interval and subscription status.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title={
          <>
            Questions, <span className="text-primary">answered.</span>
          </>
        }
        description="Everything you need to know about matching, rooms, safety and plans. Can't find it here? We're a message away."
        secondary={{ label: "Contact us", href: "/contact" }}
      />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        {groups.map((group) => (
          <div key={group.title} className="mb-12 last:mb-0">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {group.title}
            </h2>
            <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card px-5">
              {group.items.map((item) => (
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
          </div>
        ))}

        <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
          <div>
            <p className="text-[14px] font-semibold">Still stuck?</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Send us a note and a human will reply.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
