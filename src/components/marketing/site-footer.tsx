import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";

import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Discover",
    links: [
      { label: "Find roommates", href: "/explore" },
      { label: "Explore rooms", href: "/rooms" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Nivasa", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Safety", href: "/safety" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Cookie policy", href: "/privacy#cookies" },
      { label: "Report a concern", href: "/contact?topic=safety" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
              Find your people. Find your place. Nivasa is a compatibility-first
              home for verified students and professionals across India.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Twitter, label: "X" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nivasa. Made for people finding their place.</p>
          <p>nivasa.app · Bengaluru, India</p>
        </div>
      </div>
    </footer>
  );
}
