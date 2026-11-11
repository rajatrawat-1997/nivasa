import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/constants";
import { getConversationsFor } from "@/lib/queries";
import { requireProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const profile = await requireProfile();
  const conversations = await getConversationsFor(profile.id);
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Messages"
        title="Your inbox."
        description={
          unread > 0
            ? `${unread} unread ${unread === 1 ? "message" : "messages"} from people you matched with.`
            : "Conversations with your matches. Say hello, ask the practical questions early."
        }
        action={
          <Button asChild variant="outline" className="rounded-full bg-card">
            <Link href="/app/matches">
              <Sparkles className="size-4" /> View matches
            </Link>
          </Button>
        }
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Your inbox is quiet"
          description="Messaging unlocks when you and someone else like each other. Until then, keep discovering."
          action={
            <Button asChild className="rounded-full">
              <Link href="/app/discover">Find your people</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/app/messages/${conversation.id}`}
                  className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-secondary/60"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-secondary">
                    <Image
                      src={conversation.profile.avatarUrl}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                    {conversation.unread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[8.5px] font-bold text-white ring-2 ring-card">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-[12.5px]",
                          conversation.unread > 0 ? "font-bold" : "font-semibold",
                        )}
                      >
                        {conversation.profile.name}
                      </p>
                      <span className="shrink-0 text-[9.5px] text-muted-foreground">
                        {timeAgo(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-[11.5px]",
                          conversation.unread > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {conversation.lastMessage}
                      </p>
                      <span className="hidden shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-semibold text-primary sm:inline">
                        {conversation.compatibility}%
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
