"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

const typeStyles: Record<string, string> = {
  match: "bg-primary/10 text-primary",
  like: "bg-primary/10 text-primary",
  message: "bg-[#3B82F6]/10 text-[#3B82F6]",
  inquiry: "bg-[#E6A23C]/10 text-[#B7791F]",
  system: "bg-secondary text-foreground",
};

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(items);
  const [marking, setMarking] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const unread = notifications.filter((item) => !item.read).length;

  async function markAll() {
    setMarking(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!response.ok) throw new Error();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      toast.success("All notifications marked as read.");
      router.refresh();
    } catch {
      toast.error("Couldn't mark notifications as read. Please try again.");
    } finally {
      setMarking(false);
    }
  }

  async function open(item: NotificationItem) {
    setOpening(item.id);
    try {
      if (!item.read) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
        setNotifications((current) =>
          current.map((row) => (row.id === item.id ? { ...row, read: true } : row)),
        );
      }
      if (item.href) {
        router.push(item.href);
        router.refresh();
      }
    } finally {
      setOpening(null);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-primary">
          <Bell className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-[17px] font-bold">You&apos;re all caught up</h2>
        <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
          Matches, likes, messages and room inquiries will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] text-muted-foreground">
          {unread > 0 ? `${unread} unread` : "No unread notifications"}
        </p>
        {unread > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void markAll()}
            disabled={marking}
            className="h-8 rounded-full bg-card text-[11px]"
          >
            {marking ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {notifications.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => void open(item)}
                disabled={opening === item.id}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60 disabled:opacity-70",
                  !item.read && "bg-brand-soft/25",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    typeStyles[item.type] ?? "bg-secondary text-foreground",
                  )}
                >
                  {opening === item.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Bell className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-[12.5px]",
                        item.read ? "font-medium" : "font-bold",
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[9.5px] text-muted-foreground">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(item.createdAt))}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </span>
                </span>
                {!item.read && <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
