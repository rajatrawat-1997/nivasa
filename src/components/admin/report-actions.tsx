"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ReportActions({ reportId, status }: { reportId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(next: "reviewing" | "resolved" | "dismissed") {
    setLoading(next);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't update this report.");
        return;
      }
      toast.success(`Report marked ${next}.`);
      router.refresh();
    } catch {
      toast.error("You're offline. Nothing was updated.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "open" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => void update("reviewing")}
          className="h-7 rounded-full bg-card text-[10px]"
        >
          {loading === "reviewing" ? <Loader2 className="size-3 animate-spin" /> : <Eye className="size-3" />}
          Start review
        </Button>
      )}
      {status !== "resolved" && (
        <Button
          type="button"
          size="sm"
          disabled={loading !== null}
          onClick={() => void update("resolved")}
          className="h-7 rounded-full text-[10px]"
        >
          {loading === "resolved" ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Resolve
        </Button>
      )}
      {status !== "dismissed" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading !== null}
          onClick={() => void update("dismissed")}
          className="h-7 rounded-full text-[10px] text-muted-foreground"
        >
          {loading === "dismissed" ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
          Dismiss
        </Button>
      )}
    </div>
  );
}
