"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserMinus } from "lucide-react";
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

export function UnmatchButton({ matchId, name }: { matchId: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function unmatch() {
    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Couldn't unmatch. Please try again.");
        return;
      }
      toast.success(`You unmatched ${name.split(" ")[0]}.`);
      router.refresh();
    } catch {
      toast.error("You're offline. Couldn't update this match.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-full text-[11px] text-muted-foreground hover:text-destructive"
        >
          <UserMinus className="size-3.5" /> Unmatch
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unmatch {name.split(" ")[0]}?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll lose this conversation for both of you. This can&apos;t be undone, and you
            won&apos;t see each other in Discover again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Keep match</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void unmatch()}
            disabled={loading}
            className="rounded-full bg-destructive text-white hover:bg-destructive/90"
          >
            {loading && <Loader2 className="size-4 animate-spin" />} Unmatch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
