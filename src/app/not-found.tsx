import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <Logo />
      <p className="mt-8 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">
        404
      </p>
      <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-[-0.045em] sm:text-[34px]">
        This page moved out.
      </h1>
      <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
        The link may be outdated, or the room or profile you were looking for is no longer
        available.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="rounded-full">
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-card">
          <Link href="/rooms">Browse rooms</Link>
        </Button>
      </div>
    </div>
  );
}
