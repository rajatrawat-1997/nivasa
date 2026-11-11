"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Blocked = { id: string; profileId: string; name: string; avatarUrl: string };

export function SettingsAccount({ blocked }: { blocked: Blocked[] }) {
  const router = useRouter();
  const [items, setItems] = useState(blocked);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function unblock(profileId: string, name: string) {
    setUnblocking(profileId);
    try {
      const response = await fetch("/api/blocks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      if (!response.ok) throw new Error();
      setItems((current) => current.filter((item) => item.profileId !== profileId));
      toast.success(`${name.split(" ")[0]} has been unblocked.`, {
        description: "They can appear in your Discover again.",
      });
    } catch {
      toast.error("Couldn't unblock this profile. Please try again.");
    } finally {
      setUnblocking(null);
    }
  }

  async function deleteAccount() {
    if (confirm !== "DELETE") {
      toast.error("Type DELETE exactly to confirm.");
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const data = (await response.json()) as { deleted?: boolean; error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't delete your account. Please contact support.");
        return;
      }
      await authClient.signOut();
      toast.success("Your account has been deleted.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("You're offline. Your account wasn't deleted.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Blocked profiles</h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          Blocked people can&apos;t appear in your Discover and any existing match is removed.
        </p>
        {items.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-4 text-[11px] text-muted-foreground">
            You haven&apos;t blocked anyone.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-secondary">
                  <Image src={item.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
                </div>
                <span className="flex-1 truncate text-[11.5px] font-medium">{item.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void unblock(item.profileId, item.name)}
                  disabled={unblocking === item.profileId}
                  className="h-7 rounded-full bg-card text-[10.5px]"
                >
                  {unblocking === item.profileId ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <ShieldOff className="size-3" />
                  )}
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Session</h2>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          Signed in on this device. Signing out removes access to your matches and messages here.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="mt-3 rounded-full bg-card"
        >
          {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          Sign out
        </Button>
      </section>

      <section className="rounded-2xl border border-destructive/25 bg-destructive/[0.03] p-5">
        <h2 className="flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.02em] text-destructive">
          <Trash2 className="size-4" /> Delete account
        </h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          This permanently deletes your profile, matches, messages, saved rooms and inquiries. It
          can&apos;t be undone.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-3 rounded-full border-destructive/30 bg-card text-destructive hover:bg-destructive/5">
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your Nivasa account?</AlertDialogTitle>
              <AlertDialogDescription>
                This immediately and permanently removes your profile and all associated data. Type{" "}
                <strong>DELETE</strong> below to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirm">Type DELETE</Label>
              <Input
                id="delete-confirm"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
              <button
                type="button"
                onClick={() => void deleteAccount()}
                disabled={deleting || confirm !== "DELETE"}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-destructive px-4 text-[12px] font-medium text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Delete account
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <p className="text-center text-[10px] text-muted-foreground">
        Questions about your data?{" "}
        <Link href="/contact" className="underline hover:text-foreground">
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}
