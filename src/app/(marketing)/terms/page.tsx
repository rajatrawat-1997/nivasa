import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The rules for using Nivasa: eligibility, community conduct, listings, payments, safety and account termination.",
};

const sections = [
  {
    title: "1. Accepting these terms",
    body: "By creating a Nivasa account or using the service, you agree to these terms and to our privacy policy. If you do not agree, do not use the platform.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 18 years old and legally able to enter into a rental agreement. You must provide accurate information and keep your account credentials secure. One account per person.",
  },
  {
    title: "3. Your profile",
    body: "Use recent photos of yourself. Do not impersonate anyone, post misleading information, or use another person's photos without permission. You are responsible for the content you upload.",
  },
  {
    title: "4. Community conduct",
    body: "Harassment, discrimination, threats, scams, sexual content, spam and attempts to circumvent safety features are not allowed. Do not ask for money before a viewing. Do not pressure anyone to move conversations off the platform.",
  },
  {
    title: "5. Listings and providers",
    body: "Providers must have the legal right to offer the accommodation, use genuine photos of the space, disclose material facts, and follow applicable tenancy law. Listings may be reviewed, edited for policy reasons, paused or removed.",
  },
  {
    title: "6. Matches and messaging",
    body: "Messaging is available only after a mutual match. Nivasa may limit or suspend messaging where abuse is suspected. Unmatching removes the connection, but does not delete records already retained for safety.",
  },
  {
    title: "7. Plans and payments",
    body: "Paid plans are billed through the connected payment provider. A paid plan activates only when the provider confirms payment. Prices and entitlements may change with notice before your next renewal.",
  },
  {
    title: "8. No tenancy relationship",
    body: "Nivasa is a discovery platform. We are not a party to any rental or roommate agreement, do not guarantee accommodation, and do not process rent or deposits. You are responsible for verifying the property and the person before committing.",
  },
  {
    title: "9. Content and licence",
    body: "You keep ownership of your content. You grant Nivasa a limited licence to host, display and moderate it so the service can operate. We may use aggregate, de-identified data to improve matching.",
  },
  {
    title: "10. Suspension and termination",
    body: "We may suspend or terminate accounts that violate these terms, create risk, or are required to be removed by law. You can delete your account at any time from Settings.",
  },
  {
    title: "11. Liability",
    body: "The service is provided as-is. To the extent permitted by law, Nivasa is not liable for indirect or consequential loss arising from accommodation arrangements made between members.",
  },
  {
    title: "12. Contact",
    body: "Questions about these terms? Email legal@nivasa.app.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of use"
        description="The rules that keep Nivasa a respectful, honest place to find a home."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
        <p className="text-[12px] text-muted-foreground">Last updated: 11 November 2026</p>
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
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
          These terms are a plain-language working draft. Before a public launch,
          they should be reviewed by qualified counsel in each market.
        </div>
      </section>
    </>
  );
}
