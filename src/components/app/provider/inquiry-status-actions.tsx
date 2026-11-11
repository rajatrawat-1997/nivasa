"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function InquiryStatusActions({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: "new" | "replied" | "closed";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(next: "new" | "replied" | "closed") {
    setLoading(next);
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't update this inquiry.");
        return;
      }
      toast.success(
        next === "replied" ? "Marked as replied." : next === "closed" ? "Inquiry closed." : "Reopened.",
      );
      router.refresh();
    } catch {
      toast.error("You're offline. The inquiry wasn't updated.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status !== "replied" && (
        <Button
          type="button"
          size="sm"
          onClick={() => void update("replied")}
          disabled={loading !== null}
          className="h-7 rounded-full text-[10.5px]"
        >
          {loading === "replied" ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Mark replied
        </Button>
      )}
      {status !== "closed" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void update("closed")}
          disabled={loading !== null}
          className="h-7 rounded-full bg-card text-[10.5px]"
        >
          {loading === "closed" ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
          Close
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void update("new")}
          disabled={loading !== null}
          className="h-7 rounded-full text-[10.5px]"
        >
          {loading === "new" ? <Loader2 className="size-3 animate-spin" /> : <RotateCcw className="size-3" />}
          Reopen
        </Button>
      )}
    </div>
  );
}
