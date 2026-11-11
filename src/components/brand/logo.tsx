import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect width="40" height="40" rx="12" fill="#F26B5B" />
      <path
        d="M12 26.5V16.2c0-.8 1-1.2 1.5-.6l5.9 6.6c.4.4 1 .4 1.4 0l5.7-6.4c.6-.6 1.5-.2 1.5.6v10.1"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28.5" cy="12" r="2.5" fill="#252525" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="font-display text-[1.4rem] font-extrabold tracking-[-0.06em] text-foreground">
          nivasa
        </span>
      )}
    </Link>
  );
}
