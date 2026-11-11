"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const topics = [
  { value: "general", label: "General question" },
  { value: "safety", label: "Safety or moderation" },
  { value: "billing", label: "Billing and plans" },
  { value: "provider", label: "Listing a room" },
  { value: "privacy", label: "Privacy request" },
  { value: "press", label: "Press or partnerships" },
];

export function ContactForm({ initialTopic = "general" }: { initialTopic?: string }) {
  const [topic, setTopic] = useState(initialTopic);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prepared, setPrepared] = useState(false);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`[${topic}] ${name || "Nivasa enquiry"}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    return `mailto:hello@nivasa.app?subject=${subject}&body=${body}`;
  }, [topic, name, email, message]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (message.trim().length < 10) next.message = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = document.getElementById(`contact-${Object.keys(next)[0]}`);
      first?.focus();
      return;
    }
    setPrepared(true);
  }

  if (prepared) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-6">
        <CheckCircle2 className="size-6 text-success" />
        <h2 className="mt-3 font-display text-[18px] font-bold">Your message is ready</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          We don&apos;t have an email provider connected in this environment yet,
          so we&apos;ve prepared the message for your mail app instead of
          pretending it was sent. Send it and a real person will reply.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button asChild className="rounded-full">
            <a href={mailto}>
              <Mail className="size-4" /> Open mail app <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-card"
            onClick={() => setPrepared(false)}
          >
            Edit message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="contact-topic">What is this about?</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="contact-topic" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {topics.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Your name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="h-11"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-[11.5px] text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email address</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              className="h-11"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-[11.5px] text-destructive">{errors.email}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder="Tell us what you need help with."
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message && <p className="text-[11.5px] text-destructive">{errors.message}</p>}
        </div>
      </div>

      <Button type="submit" className="mt-5 h-11 w-full rounded-full">
        Prepare message
      </Button>
      <p className="mt-3 text-[11px] text-muted-foreground">
        We normally reply within one working day. For urgent safety concerns,
        contact local emergency services first.
      </p>
    </form>
  );
}
