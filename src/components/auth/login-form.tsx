"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(nextEmail: string, nextPassword: string, demo = false) {
    setError(null);
    if (!nextEmail || !nextPassword) {
      setError("Enter your email and password to continue.");
      return;
    }
    if (demo) setDemoLoading(true);
    else setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email: nextEmail,
      password: nextPassword,
    });

    if (authError) {
      setError(
        authError.message?.toLowerCase().includes("invalid")
          ? "That email or password doesn't match an account. Try again."
          : authError.message || "We couldn't sign you in. Please try again.",
      );
      setLoading(false);
      setDemoLoading(false);
      return;
    }

    router.replace(redirectTo || "/app/dashboard");
    router.refresh();
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void signIn(email, password);
        }}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[12.5px] text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link href="/forgot-password" className="text-[11.5px] font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full rounded-full" disabled={loading || demoLoading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-full bg-card"
        disabled={loading || demoLoading}
        onClick={() => void signIn("demo@nivasa.app", "Nivasa123!", true)}
      >
        {demoLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Opening demo…
          </>
        ) : (
          <>
            <Sparkles className="size-4 text-primary" /> Explore the demo account
          </>
        )}
      </Button>
      <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
        The demo account is pre-filled with matches, messages and a listing.
      </p>
    </div>
  );
}
