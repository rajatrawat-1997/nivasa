"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ListingAdminActions({
  listingId,
  title,
  status,
  featured,
}: {
  listingId: string;
  title: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(payload: Record<string, unknown>, key: string, message: string) {
    setLoading(key);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't update this listing.");
        return;
      }
      toast.success(message);
      router.refresh();
    } catch {
      toast.error("You're offline. Nothing was updated.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "pending" && (
        <>
          <Button
            type="button"
            size="sm"
            disabled={loading !== null}
            onClick={() => void update({ status: "active" }, "approve", `"${title}" is now live.`)}
            className="h-7 rounded-full text-[10px]"
          >
            {loading === "approve" ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() =>
              void update({ status: "rejected" }, "reject", `"${title}" was rejected.`)
            }
            className="h-7 rounded-full bg-card text-[10px] text-destructive"
          >
            {loading === "reject" ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
            Reject
          </Button>
        </>
      )}
      {status === "active" && (
        <Button
          type="button"
          variant={featured ? "default" : "outline"}
          size="sm"
          disabled={loading !== null}
          onClick={() =>
            void update(
              { featured: !featured },
              "feature",
              featured ? "Removed from featured." : "Added to featured.",
            )
          }
          className="h-7 rounded-full text-[10px]"
        >
          {loading === "feature" ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {featured ? "Unfeature" : "Feature"}
        </Button>
      )}
    </div>
  );
}
