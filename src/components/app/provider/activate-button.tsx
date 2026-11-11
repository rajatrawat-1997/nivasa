"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ProviderActivateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function activate() {
    setLoading(true);
    try {
      const response = await fetch("/api/provider/activate", { method: "POST" });
      const data = (await response.json()) as { role?: string; error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't set up your provider profile.");
        return;
      }
      toast.success("Provider space is ready.", {
        description: "You can now list rooms — each one gets a quick review.",
      });
      router.refresh();
    } catch {
      toast.error("You're offline. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={() => void activate()} disabled={loading} className="rounded-full">
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      Set up provider profile <ArrowRight className="size-4" />
    </Button>
  );
}
