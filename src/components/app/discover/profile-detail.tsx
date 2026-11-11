"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Briefcase,
  CalendarDays,
  Flag,
  Languages,
  Loader2,
  MapPin,
  Share2,
  ShieldOff,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDate, formatINR } from "@/lib/constants";
import type { DiscoverPerson } from "@/components/app/discover/types";
import { cn } from "@/lib/utils";

export function ProfileDetailDialog({
  person,
  open,
  onOpenChange,
  onBlocked,
}: {
  person: DiscoverPerson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlocked: (id: string) => void;
}) {
  const [photo, setPhoto] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("Misleading profile");
  const [details, setDetails] = useState("");
  const [blocking, setBlocking] = useState(false);

  const photos = person.photos.length > 0 ? person.photos : [person.avatarUrl];

  async function toggleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", id: person.id }),
      });
      const data = (await response.json()) as { saved?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Couldn't save this profile.");
      setSaved(Boolean(data.saved));
      toast.success(data.saved ? "Saved to your list." : "Removed from saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this profile.");
    } finally {
      setSaving(false);
    }
  }

  async function submitReport() {
    setReporting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "profile",
          targetId: person.id,
          reason,
          details,
        }),
      });
      if (!response.ok) throw new Error("Couldn't submit the report.");
      toast.success("Report submitted. Our team will review it.");
      setShowReport(false);
      setDetails("");
    } catch {
      toast.error("Couldn't submit the report. Please try again.");
    } finally {
      setReporting(false);
    }
  }

  async function block() {
    setBlocking(true);
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: person.id }),
      });
      if (!response.ok) throw new Error();
      toast.success(`${person.name.split(" ")[0]} has been blocked.`);
      onOpenChange(false);
      onBlocked(person.id);
    } catch {
      toast.error("Couldn't block this profile. Please try again.");
    } finally {
      setBlocking(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/explore`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${person.name} on Nivasa`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      toast.error("Couldn't share this profile.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{person.name}&apos;s profile</DialogTitle>
          <DialogDescription>Full profile and compatibility details</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[16/11] overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[photo]} alt={`${person.name}`} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {person.verified && (
              <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-success">
                <BadgeCheck className="size-3.5" /> Verified
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur">
              <Sparkles className="size-3.5" /> {person.compatibility.overall}% match
            </span>
          </div>
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPhoto(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === photo ? "w-5 bg-white" : "w-1.5 bg-white/50",
                  )}
                  aria-label={`Show photo ${index + 1}`}
                />
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h2 className="font-display text-[26px] font-extrabold tracking-[-0.04em]">
              {person.name}, {person.age}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-[12px] text-white/80">
              <Briefcase className="size-3.5" /> {person.profession}
            </p>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { icon: MapPin, label: "Location", value: `${person.locality || person.city}` },
              { icon: Wallet, label: "Budget", value: `${formatINR(person.budgetMin)}–${formatINR(person.budgetMax)}` },
              { icon: CalendarDays, label: "Move-in", value: person.moveInDate ? formatDate(person.moveInDate) : "Flexible" },
              { icon: Languages, label: "Languages", value: person.languages.slice(0, 2).join(", ") || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border p-3">
                <Icon className="size-3.5 text-primary" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-[11.5px] font-medium leading-snug">{value}</p>
              </div>
            ))}
          </div>

          <section>
            <h3 className="text-[13px] font-semibold">About {person.name.split(" ")[0]}</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{person.bio}</p>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold">Lifestyle</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {person.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {person.lifestyle.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[11.5px]"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold">Why you match</h3>
            <div className="mt-2 rounded-xl bg-brand-soft p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold">
                <Sparkles className="size-3.5 text-primary" />
                {person.compatibility.overall}% compatible · {person.compatibility.lifestyle}% lifestyle fit
              </p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {person.compatibility.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" /> {reason}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 space-y-2.5">
              {person.compatibility.categories.map((category) => (
                <div key={category.key}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-muted-foreground">{category.label}</span>
                    <span className="font-semibold">{category.score}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary/75" style={{ width: `${category.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {showReport && (
            <section className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <h3 className="text-[12.5px] font-semibold">Report this profile</h3>
              <div className="mt-2 space-y-2.5">
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-[12px] outline-none focus:ring-2 focus:ring-ring/30"
                  aria-label="Report reason"
                >
                  {[
                    "Misleading profile",
                    "Harassment or abuse",
                    "Fake profile",
                    "Scam or asking for money",
                    "Inappropriate content",
                    "Something else",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={3}
                  placeholder="Add any details that help us review this."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-ring/30"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void submitReport()}
                    disabled={reporting}
                    className="rounded-full"
                  >
                    {reporting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    Submit report
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReport(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full bg-card"
                onClick={() => void toggleSave()}
                disabled={saving}
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Bookmark className={cn("size-3.5", saved && "fill-current")} />}
                {saved ? "Saved" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full bg-card"
                onClick={() => void share()}
              >
                <Share2 className="size-3.5" /> Share
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={() => setShowReport((value) => !value)}
              >
                <Flag className="size-3.5" /> Report
              </Button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground hover:text-destructive"
                >
                  <ShieldOff className="size-3.5" /> Block
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Block {person.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    They won&apos;t appear in your discovery, and any match or
                    conversation between you will be removed. This can&apos;t be
                    undone from here.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void block()}
                    disabled={blocking}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {blocking ? <Loader2 className="size-4 animate-spin" /> : "Block profile"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
