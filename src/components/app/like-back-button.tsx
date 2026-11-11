"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LikeBackButton({ profileId, name }: { profileId: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [matched, setMatched] = useState(false);

  async function likeBack() {
    setLoading(true);
    try {
      const response = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: profileId, action: "like" }),
      });
      const data = (await response.json()) as {
        matched?: boolean;
        conversationId?: string;
        error?: string;
      };
      if (!response.ok) {
        toast.error(data.error ?? "That like didn't go through. Please try again.");
        return;
      }
      setMatched(true);
      toast.success(`It's a match with ${name.split(" ")[0]}!`, {
        description: "A conversation is ready for you.",
        action: data.conversationId
          ? {
              label: "Say hello",
              onClick: () => router.push(`/app/messages/${data.conversationId}`),
            }
          : undefined,
      });
      router.refresh();
    } catch {
      toast.error("You're offline. That like wasn't saved.");
    } finally {
      setLoading(false);
    }
  }

  if (matched) {
    return (
      <Button size="sm" asChild className="h-8 rounded-full text-[11.5px]">
        <Link href="/app/messages">Message</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => void likeBack()}
      disabled={loading}
      className="h-8 rounded-full text-[11.5px]"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Heart className="size-3.5" />}
      Like back
    </Button>
  );
}
