"use client";

import { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveProfileButton({
  profileId,
  initialSaved,
}: {
  profileId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", id: profileId }),
      });
      const data = (await response.json()) as { saved?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Couldn't update your saved list.");
      setSaved(Boolean(data.saved));
      toast.success(data.saved ? "Saved to your list." : "Removed from saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update your saved list.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void toggle()}
      disabled={loading}
      className="h-8 rounded-full bg-card text-[11px]"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Bookmark className={cn("size-3.5", saved && "fill-primary text-primary")} />
      )}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
