"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  body: string;
  senderProfileId: string;
  createdAt: string;
  readAt: string | null;
};

type Props = {
  conversationId: string;
  me: { id: string; name: string };
  other: {
    id: string;
    name: string;
    avatarUrl: string;
    profession: string;
    city: string;
    verified: boolean;
  };
  compatibility: number;
  initialMessages: ChatMessage[];
};

const PROMPTS = [
  "What does your ideal Sunday look like?",
  "How do you like to split chores?",
  "Any non-negotiables for a flatmate?",
];

function timeOf(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function dayOf(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function ChatShell({ conversationId, me, other, compatibility, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: ChatMessage[] };
      if (data.messages) {
        setMessages(data.messages);
        setOffline(false);
      }
    } catch {
      setOffline(true);
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      body,
      senderProfileId: me.id,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((current) => [...current, optimistic]);
    setDraft("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, body }),
      });
      const data = (await response.json()) as { message?: ChatMessage; error?: string };
      if (!response.ok || !data.message) {
        setMessages((current) => current.filter((item) => item.id !== optimistic.id));
        setDraft(body);
        toast.error(data.error ?? "Your message didn't send. Try again.");
        return;
      }
      setMessages((current) =>
        current.map((item) => (item.id === optimistic.id ? data.message! : item)),
      );
      void load();
    } catch {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setDraft(body);
      toast.error("You're offline. Your message wasn't sent.");
    } finally {
      setSending(false);
    }
  }

  let lastDay = "";

  return (
    <div className="flex h-[calc(100dvh-11rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[calc(100dvh-8.5rem)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button asChild variant="ghost" size="icon" className="size-8 shrink-0 lg:hidden">
          <Link href="/app/messages" aria-label="Back to messages">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <Link
          href={`/app/profile?preview=${other.id}`}
          className="relative size-10 shrink-0 overflow-hidden rounded-full bg-secondary"
        >
          <Image src={other.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/app/profile?preview=${other.id}`}
            className="flex items-center gap-1 truncate text-[13px] font-semibold hover:text-primary"
          >
            {other.name}
            {other.verified && <BadgeCheck className="size-3.5 text-primary" />}
          </Link>
          <p className="truncate text-[10.5px] text-muted-foreground">
            {other.profession || "Nivasa member"} · {other.city}
          </p>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-primary sm:flex">
          <Sparkles className="size-3" /> {compatibility}% match
        </span>
      </div>

      {offline && (
        <p className="border-b border-warning/20 bg-warning/5 px-4 py-1.5 text-center text-[10.5px] text-muted-foreground">
          Reconnecting… messages will sync when you&apos;re back online.
        </p>
      )}

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="mx-auto mt-6 max-w-sm text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-primary">
              <Sparkles className="size-5" />
            </span>
            <p className="mt-3 font-display text-[15px] font-bold">
              You matched with {other.name.split(" ")[0]}.
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              Break the ice with something that matters for living together. Try one of these:
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-xl border border-border px-3 py-2 text-left text-[11.5px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-brand-soft/40 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const mine = message.senderProfileId === me.id;
          const day = dayOf(message.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={message.id}>
              {showDay && (
                <p className="my-4 text-center text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {day}
                </p>
              )}
              <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[78%] sm:max-w-[65%]")}>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                      mine
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md bg-secondary text-foreground",
                    )}
                  >
                    {message.body}
                  </div>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-[9px] text-muted-foreground",
                      mine ? "justify-end" : "justify-start",
                    )}
                  >
                    {timeOf(message.createdAt)}
                    {mine && message.readAt && <span className="text-primary">· Read</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="chat-message" className="sr-only">
            Message {other.name}
          </label>
          <Textarea
            id="chat-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder={`Message ${other.name.split(" ")[0]}…`}
            rows={1}
            className="min-h-10 flex-1 resize-none rounded-xl border-border bg-background py-2.5 text-[12.5px]"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || draft.trim().length === 0}
            className="size-10 shrink-0 rounded-xl"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-[9.5px] text-muted-foreground">
          Enter to send · Shift + Enter for a new line
          {draft.length > 800 && <span className="float-right">{draft.length}/2000</span>}
        </p>
      </form>
    </div>
  );
}
