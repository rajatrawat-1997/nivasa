"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InquiryDialog({
  listingId,
  listingTitle,
  providerName,
}: {
  listingId: string;
  listingTitle: string;
  providerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (message.trim().length < 10) {
      toast.error("Add a little more detail so the provider can reply properly.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Your inquiry didn't send. Please try again.");
        return;
      }
      setSent(true);
      toast.success("Inquiry sent.", {
        description: `${providerName.split(" ")[0]} will see it in their provider dashboard.`,
      });
    } catch {
      toast.error("You're offline. Your inquiry wasn't sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setSent(false);
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Send className="size-4" /> Contact provider
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sent ? "Inquiry sent" : "Ask about this room"}</DialogTitle>
          <DialogDescription>
            {sent
              ? `${providerName.split(" ")[0]} has your message and can reply from their provider dashboard.`
              : `${listingTitle} · ${providerName} will see your message.`}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="rounded-xl border border-success/25 bg-success/5 p-4 text-[12px] leading-relaxed text-muted-foreground">
            Your inquiry is saved to your account. Providers reply by email or phone when they
            choose to share their details — we never share yours automatically.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="inquiry-message">Your message</Label>
              <Textarea
                id="inquiry-message"
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Hi! I'm interested in the room. I'm a 26-year-old designer looking to move in next month. Is it still available?"
              />
              <p className="text-right text-[9.5px] text-muted-foreground">{message.length}/1000</p>
            </div>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={sending || message.trim().length === 0}
              className="w-full rounded-full"
            >
              {sending && <Loader2 className="size-4 animate-spin" />}
              Send inquiry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
