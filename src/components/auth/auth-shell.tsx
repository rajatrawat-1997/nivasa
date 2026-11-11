import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.04fr_0.96fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
          >
            Back to site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-[2rem] font-extrabold tracking-[-0.045em]">
            {title}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-[12.5px] text-muted-foreground">{footer}</div>}
        </div>

        <p className="text-center text-[11px] text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} Nivasa · 18+ only · Find your people. Find your place.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-[#252525] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=85"
          alt="A warm, sunlit shared apartment"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1918] via-[#252525]/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 xl:p-16">
          <span className="flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
            <Sparkles className="size-3.5 text-[#F9B4A9]" /> Compatibility-first
          </span>
          <h2 className="mt-5 max-w-md font-display text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-white">
            The right flatmate changes everything about a home.
          </h2>
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-white/65">
            Honest compatibility, verified profiles and conversations that only
            start when you both want them to.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              { icon: ShieldCheck, label: "Verified profiles" },
              { icon: HeartHandshake, label: "Mutual matches" },
              { icon: BadgeCheck, label: "Reviewed rooms" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/80"
              >
                <Icon className="size-3.5" /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
