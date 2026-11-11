"use client";

import { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveListingButton({
  listingId,
  initialSaved,
  variant = "icon",
}: {
  listingId: string;
  initialSaved: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", id: listingId }),
      });
      const data = (await response.json()) as { saved?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Couldn't update saved rooms.");
      setSaved(Boolean(data.saved));
      toast.success(data.saved ? "Room saved." : "Removed from saved rooms.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update saved rooms.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => void toggle()}
        disabled={loading}
        className="rounded-full bg-card"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
        )}
        {saved ? "Saved" : "Save room"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      }}
      disabled={loading}
      aria-label={saved ? "Remove room from saved" : "Save room"}
      aria-pressed={saved}
      className="flex size-8 items-center justify-center rounded-full bg-white/95 text-[#252525] shadow-sm transition-colors hover:bg-white disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
      )}
    </button>
  );
}
