"use client";

import { useState } from "react";
import { CreditCard, Loader2, Lock, Mail } from "lucide-react";
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

export function PlanButton({
  planName,
  price,
  interval,
  current,
  featured,
}: {
  planName: string;
  price: number;
  interval: "monthly" | "yearly";
  current?: boolean;
  featured?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (current) {
    return (
      <Button disabled variant="outline" className="w-full rounded-full bg-card">
        Current plan
      </Button>
    );
  }

  async function requestAccess() {
    setSending(true);
    try {
      const response = await fetch("/api/subscription-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, interval }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't save your request. Please try again.");
        return;
      }
      toast.success("Request saved.", {
        description: "We'll email you as soon as card payments go live.",
      });
      setOpen(false);
    } catch {
      toast.error("You're offline. Your request wasn't saved.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={
            featured
              ? "w-full rounded-full bg-primary text-white hover:bg-primary/90"
              : "w-full rounded-full"
          }
          variant={featured ? "default" : "outline"}
        >
          Choose {planName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-primary">
              <Lock className="size-4" />
            </span>
            Payments aren&apos;t connected yet
          </DialogTitle>
          <DialogDescription>
            Nivasa takes payments through a payment provider, and none is connected to this
            deployment yet. Nothing has been charged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-[11.5px] leading-relaxed text-muted-foreground">
          <p>
            You selected <strong className="text-foreground">{planName}</strong> at{" "}
            <strong className="text-foreground">
              ₹{price.toLocaleString("en-IN")}/{interval === "yearly" ? "year" : "month"}
            </strong>
            . We can save your interest so you&apos;re notified the moment checkout is live — no
            card details are collected here.
          </p>
          <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
            <CreditCard className="mt-0.5 size-3.5 shrink-0" />
            <span>
              To accept real payments, the project owner needs to connect a payment provider. Until
              then, no plan can be activated and no money changes hands.
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => void requestAccess()}
            disabled={sending}
            className="w-full rounded-full"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Notify me when it&apos;s live
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full rounded-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
