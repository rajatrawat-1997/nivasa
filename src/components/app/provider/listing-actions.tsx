"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ListingActions({
  listingId,
  title,
  status,
}: {
  listingId: string;
  title: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(next: "active" | "paused") {
    setLoading(next);
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't update this listing.");
        return;
      }
      toast.success(next === "active" ? "Listing is live." : "Listing paused.");
      router.refresh();
    } catch {
      toast.error("You're offline. The listing wasn't updated.");
    } finally {
      setLoading(null);
    }
  }

  async function remove() {
    setLoading("delete");
    try {
      const response = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't delete this listing.");
        return;
      }
      toast.success("Listing deleted.");
      router.refresh();
    } catch {
      toast.error("You're offline. The listing wasn't deleted.");
    } finally {
      setLoading(null);
    }
  }

  const pending = status === "pending" || status === "rejected";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!pending &&
        (status === "active" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void setStatus("paused")}
            disabled={loading !== null}
            className="h-7 rounded-full bg-card text-[10.5px]"
          >
            {loading === "paused" ? <Loader2 className="size-3 animate-spin" /> : <Pause className="size-3" />}
            Pause
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => void setStatus("active")}
            disabled={loading !== null}
            className="h-7 rounded-full text-[10.5px]"
          >
            {loading === "active" ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />}
            {status === "rented" ? "Mark available" : "Publish"}
          </Button>
        ))}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-full text-[10.5px] text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the listing and all its inquiries. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void remove()}
              disabled={loading === "delete"}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {loading === "delete" && <Loader2 className="size-4 animate-spin" />} Delete listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
