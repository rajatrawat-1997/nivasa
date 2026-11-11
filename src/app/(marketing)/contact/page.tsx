import type { Metadata } from "next";
import { Clock, Mail, MapPin, ShieldAlert } from "lucide-react";

import { ContactForm } from "@/components/marketing/contact-form";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Nivasa team about your account, safety, billing or listing a room.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to a <span className="text-primary">real person.</span>
          </>
        }
        description="Questions about your account, a safety concern, or listing a room? Pick a topic and tell us what's going on."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm initialTopic={topic === "safety" ? "safety" : "general"} />

          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: "Email us",
                body: "hello@nivasa.app",
                note: "General questions and support.",
              },
              {
                icon: ShieldAlert,
                title: "Report a safety concern",
                body: "safety@nivasa.app",
                note: "For reports about a member or listing.",
              },
              {
                icon: Clock,
                title: "Response time",
                body: "Within one working day",
                note: "Monday to Friday, 10am–6pm IST.",
              },
              {
                icon: MapPin,
                title: "Where we are",
                body: "Bengaluru, India",
                note: "Nivasa is built and operated in India.",
              },
            ].map(({ icon: Icon, title, body, note }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-primary">
                  <Icon className="size-4" />
                </span>
                <h2 className="mt-3 text-[13.5px] font-semibold">{title}</h2>
                <p className="mt-1 text-[13px] font-medium text-foreground">{body}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
