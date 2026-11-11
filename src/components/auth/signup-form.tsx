"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignupForm({ role, plan }: { role?: string; plan?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password needs at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    if (!terms) {
      setError("Please accept the terms and privacy policy to continue.");
      return;
    }

    setLoading(true);
    const { error: authError } = await authClient.signUp.email({
      name: name.trim(),
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message?.toLowerCase().includes("exist")
          ? "An account already exists with this email. Try signing in instead."
          : authError.message || "We couldn't create your account. Please try again.",
      );
      setLoading(false);
      return;
    }

    const query = new URLSearchParams();
    if (role === "provider") query.set("role", "provider");
    if (plan) query.set("plan", plan);
    router.replace(`/onboarding/welcome${query.size ? `?${query.toString()}` : ""}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email address</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="8+ characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-0.5 top-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-confirm">Confirm password</Label>
          <Input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="h-11"
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
        <Checkbox
          id="signup-terms"
          checked={terms}
          onCheckedChange={(value) => setTerms(value === true)}
          className="mt-0.5"
        />
        <label htmlFor="signup-terms" className="text-[11.5px] leading-relaxed text-muted-foreground">
          I&apos;m 18 or older and agree to Nivasa&apos;s{" "}
          <Link href="/terms" className="font-medium text-foreground underline underline-offset-2">
            Terms of use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">
            Privacy policy
          </Link>
          .
        </label>
      </div>

      <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Creating your account…
          </>
        ) : (
          <>
            Create account <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
