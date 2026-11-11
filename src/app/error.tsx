"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-5 text-center">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">
        Something went wrong
      </p>
      <h1 className="mt-2 font-display text-[26px] font-extrabold tracking-[-0.045em]">
        That didn&apos;t load.
      </h1>
      <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
        We hit an unexpected error while loading this page. Try again — if it keeps happening,
        contact support.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => reset()} className="rounded-full">
          <RefreshCw className="size-4" /> Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-card">
          <Link href="/app/dashboard">Back to Nivasa</Link>
        </Button>
      </div>
    </div>
  );
}
