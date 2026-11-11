"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag, Loader2, ShieldOff } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  "Misleading profile",
  "Inappropriate messages",
  "Harassment or abuse",
  "Fake account",
  "Spam or scam",
  "Something else",
];

export function ProfileSafetyActions({ profileId, name }: { profileId: string; name: string }) {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);

  async function submitReport() {
    setReporting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "profile",
          targetId: profileId,
          reason,
          details,
        }),
      });
      const data = (await response.json()) as { reported?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Couldn't submit your report.");
      setReportOpen(false);
      setDetails("");
      toast.success("Report submitted.", {
        description: "Our safety team reviews every report within 24 hours.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit your report.");
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
        body: JSON.stringify({ profileId }),
      });
      const data = (await response.json()) as { blocked?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Couldn't block this profile.");
      toast.success(`${name.split(" ")[0]} has been blocked.`);
      router.push("/app/discover");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't block this profile.");
    } finally {
      setBlocking(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-[11px] text-muted-foreground"
          >
            <Flag className="size-3.5" /> Report
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report {name.split(" ")[0]}</DialogTitle>
            <DialogDescription>
              Tell us what happened. Reports are confidential and reviewed by the Nivasa safety
              team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="preview-report-reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="preview-report-reason" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preview-report-details">Details (optional)</Label>
              <Textarea
                id="preview-report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Anything that helps us understand what happened."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => void submitReport()}
              disabled={reporting}
              className="w-full rounded-full sm:w-auto"
            >
              {reporting && <Loader2 className="size-4 animate-spin" />} Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-[11px] text-muted-foreground hover:text-destructive"
          >
            <ShieldOff className="size-3.5" /> Block
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {name.split(" ")[0]}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t appear in your Discover again, and any match or conversation between
              you will be removed. This can&apos;t be undone here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void block()}
              disabled={blocking}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {blocking && <Loader2 className="size-4 animate-spin" />} Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
