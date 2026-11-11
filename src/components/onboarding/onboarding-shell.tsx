import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const steps = [
  { step: 1, label: "Basics", href: "/onboarding/basic-details" },
  { step: 2, label: "Photos", href: "/onboarding/photos" },
  { step: 3, label: "Lifestyle", href: "/onboarding/lifestyle" },
  { step: 4, label: "Housing", href: "/onboarding/housing-preferences" },
  { step: 5, label: "Verify", href: "/onboarding/verification" },
];

export function OnboardingShell({
  current,
  title,
  description,
  children,
  backHref,
  wide = false,
}: {
  current: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  backHref?: string;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <Link
            href="/"
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            Save &amp; exit
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-12">
        {current >= 1 && current <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between gap-1">
              {steps.map((step, index) => {
                const complete = step.step < current;
                const active = step.step === current;
                return (
                  <div key={step.step} className="flex flex-1 items-center gap-1 last:flex-none">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                          complete && "bg-success text-white",
                          active && "bg-primary text-white",
                          !complete && !active && "bg-secondary text-muted-foreground",
                        )}
                      >
                        {complete ? <Check className="size-3.5" /> : step.step}
                      </span>
                      <span
                        className={cn(
                          "hidden text-[12px] font-medium sm:block",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <span
                        className={cn(
                          "mx-2 h-px flex-1",
                          complete ? "bg-success/40" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={cn("mx-auto", wide ? "max-w-3xl" : "max-w-2xl")}>
          {backHref && (
            <Link
              href={backHref}
              className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back
            </Link>
          )}
          <h1 className="text-balance font-display text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-[2.15rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
