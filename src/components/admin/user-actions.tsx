"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, IdCard, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function UserAdminActions({
  profileId,
  name,
  verified,
  idVerified,
}: {
  profileId: string;
  name: string;
  verified: boolean;
  idVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(payload: Record<string, boolean>, label: string) {
    const key = Object.keys(payload)[0];
    setLoading(key);
    try {
      const response = await fetch(`/api/admin/users/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't update this member.");
        return;
      }
      toast.success(`${name.split(" ")[0]} — ${label}.`);
      router.refresh();
    } catch {
      toast.error("You're offline. Nothing was updated.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant={verified ? "outline" : "default"}
        size="sm"
        disabled={loading !== null}
        onClick={() =>
          void update({ verified: !verified }, verified ? "verification removed" : "verified")
        }
        className="h-7 rounded-full text-[10px]"
      >
        {loading === "verified" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <BadgeCheck className="size-3" />
        )}
        {verified ? "Unverify" : "Verify"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() =>
          void update({ idVerified: !idVerified }, idVerified ? "ID unverified" : "ID verified")
        }
        className="h-7 rounded-full bg-card text-[10px]"
      >
        {loading === "idVerified" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <IdCard className="size-3" />
        )}
        {idVerified ? "ID ✓" : "ID review"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading !== null}
        onClick={() => void update({ isAdmin: true }, "granted admin access")}
        className="h-7 rounded-full text-[10px] text-muted-foreground"
        aria-label={`Make ${name} an admin`}
      >
        {loading === "isAdmin" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <ShieldCheck className="size-3" />
        )}
        Admin
      </Button>
    </div>
  );
}
