import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Nivasa collects, uses and protects your personal information, and the controls you have over your data.",
};

const sections = [
  {
    title: "1. Who we are",
    body: "Nivasa is a roommate matching and room discovery platform operated under the Nivasa brand at nivasa.app. This policy explains what we collect, why we collect it and the choices you have.",
  },
  {
    title: "2. Information we collect",
    body: "Account details such as your name, email, phone number and password hash. Profile details you choose to add, including photos, profession, city, lifestyle answers and housing preferences. Activity such as likes, matches, messages, saved rooms and inquiries. Technical information such as device type, browser and approximate region, used to keep the service secure and reliable.",
  },
  {
    title: "3. Verification information",
    body: "If you choose identity verification, documents are processed by an approved verification provider. We store only the verification outcome and level, not the documents themselves on public or shared systems. Verification documents are never shown to other members.",
  },
  {
    title: "4. How we use your information",
    body: "To create and personalise your experience, calculate compatibility, show relevant rooms, enable messaging between matched members, prevent fraud and abuse, respond to support requests, and meet legal obligations. We do not sell your personal information.",
  },
  {
    title: "5. What other members can see",
    body: "Your first name, age, photos, city, profession, lifestyle tags, budget range and verification badge may be visible to other signed-in members. Your phone number, email, exact address, identity documents and full date of birth are not shown publicly.",
  },
  {
    title: "6. Sharing with providers",
    body: "We use service providers for hosting, database, email, payments and identity verification. They process data only on our instructions and under appropriate contractual safeguards. Payment card details go directly to the payment provider and are not stored by Nivasa.",
  },
  {
    title: "7. Your choices",
    body: "You can edit your profile, control visibility, withdraw consent for optional processing, export your data on request, and delete your account from Settings. Some records may be retained for legal, tax or fraud-prevention reasons.",
    id: "cookies",
  },
  {
    title: "8. Cookies",
    body: "We use essential cookies to keep you signed in and to remember your preferences. We may use limited analytics cookies to understand aggregate product usage. You can control non-essential cookies through your browser settings.",
  },
  {
    title: "9. Security and retention",
    body: "We use encryption in transit, access controls, hashed passwords and server-side authorisation checks. Data is retained while your account is active and for a limited period afterwards where needed for legal or safety reasons.",
  },
  {
    title: "10. Contact",
    body: "For privacy requests or questions, email privacy@nivasa.app. We aim to respond within seven working days.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        description="Your trust is the foundation of Nivasa. This is how we handle your information."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
        <p className="text-[12px] text-muted-foreground">Last updated: 11 November 2026</p>
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <div key={section.title} id={section.id}>
              <h2 className="font-display text-[18px] font-bold tracking-[-0.02em]">
                {section.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-[1.8] text-muted-foreground">
                {section.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-[12.5px] text-muted-foreground">
          This policy is a plain-language summary of our current practices. It is
          not legal advice. Before launching publicly, Nivasa should have this
          reviewed by qualified counsel for the markets it operates in.
        </div>
      </section>
    </>
  );
}
