"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Bookmark,
  ChevronDown,
  Compass,
  CreditCard,
  Heart,
  HeartHandshake,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  X,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type ShellProfile = {
  name: string;
  avatarUrl: string;
  city: string;
  plan: string;
  isAdmin: boolean;
};

const nav = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/discover", label: "Discover", icon: Compass },
  { href: "/app/likes", label: "Likes", icon: Heart },
  { href: "/app/matches", label: "Matches", icon: HeartHandshake },
  { href: "/app/messages", label: "Messages", icon: MessageCircle },
  { href: "/app/rooms", label: "Explore rooms", icon: Home },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
];

const accountNav = [
  { href: "/app/profile", label: "My profile", icon: UserRound },
  { href: "/app/preferences", label: "Preferences", icon: SlidersIcon },
  { href: "/app/subscription", label: "Subscription", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-brand-soft text-accent-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("size-[18px]", active ? "text-primary" : "text-muted-foreground/80")} />
      <span className="flex-1">{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[9.5px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export function AppShell({
  profile,
  unreadNotifications,
  unreadMessages,
  children,
}: {
  profile: ShellProfile;
  unreadNotifications: number;
  unreadMessages: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/app/dashboard"
      ? pathname === "/app/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-[68px] items-center px-5">
          <Logo href="/app/dashboard" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2 no-scrollbar" aria-label="App navigation">
          <p className="px-3 pb-1.5 pt-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
            Discover
          </p>
          <div className="space-y-0.5">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isActive(item.href)}
                badge={
                  item.href === "/app/messages"
                    ? unreadMessages
                    : item.href === "/app/likes"
                      ? undefined
                      : undefined
                }
              />
            ))}
          </div>

          <p className="px-3 pb-1.5 pt-5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
            Account
          </p>
          <div className="space-y-0.5">
            {accountNav.map((item) => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
            <NavLink
              href="/app/provider/dashboard"
              label="Provider space"
              icon={Home}
              active={pathname.startsWith("/app/provider")}
            />
            {profile.isAdmin && (
              <NavLink
                href="/admin"
                label="Admin"
                icon={ShieldCheck}
                active={pathname.startsWith("/admin")}
              />
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-[#252525] p-4 text-white">
            <Sparkles className="size-4 text-[#F9B4A9]" />
            <p className="mt-2 text-[12px] font-semibold">
              {profile.plan === "plus" ? "Nivasa Plus is active" : "Get more from Nivasa"}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-white/60">
              {profile.plan === "plus"
                ? "Unlimited discovery, Super Likes and deep compatibility insights."
                : "See who liked you, unlock unlimited discovery and deeper match insight."}
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 h-8 w-full rounded-full bg-white text-[11px] text-[#252525] hover:bg-white/90"
            >
              <Link href="/app/subscription">
                {profile.plan === "plus" ? "Manage plan" : "Upgrade plan"}
              </Link>
            </Button>
          </div>
        </nav>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6">
            <div className="lg:hidden">
              <Logo href="/app/dashboard" showWordmark={false} className="size-9" />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11.5px] font-medium text-muted-foreground sm:flex lg:hidden"
            >
              <MapPin className="size-3.5 text-primary" /> {profile.city}
            </button>

            <Link
              href="/app/preferences"
              className="hidden items-center gap-2 rounded-full px-2 py-2 text-[12px] text-muted-foreground hover:text-foreground sm:flex"
            >
              <MapPin className="size-3.5 text-primary" /> {profile.city}
              <ChevronDown className="size-3" />
            </Link>

            <form
              action="/app/discover"
              className="ml-auto hidden max-w-[260px] flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 md:flex"
            >
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="app-search" className="sr-only">
                Search people
              </label>
              <input
                id="app-search"
                name="q"
                placeholder="Search people, rooms…"
                className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/70"
              />
            </form>

            <div className="ml-auto flex items-center gap-1.5 md:ml-0">
              <Link
                href="/app/notifications"
                className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
              >
                <Bell className="size-[18px]" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Link>

              <Link
                href="/app/subscription"
                className="hidden rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground sm:block"
              >
                {profile.plan === "plus" ? "Plus" : profile.plan === "provider" ? "Pro" : "Free"}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Open account menu"
                  >
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        className="size-8 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-primary">
                        {profile.name.slice(0, 1)}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-[12.5px] font-semibold">{profile.name}</p>
                    <p className="mt-0.5 text-[10.5px] font-normal text-muted-foreground">
                      {profile.city} · {profile.plan === "free" ? "Free plan" : profile.plan === "plus" ? "Nivasa Plus" : "Provider Pro"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile">
                      <User className="size-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/preferences">
                      <Settings className="size-4" /> Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/subscription">
                      <CreditCard className="size-4" /> Subscription
                    </Link>
                  </DropdownMenuItem>
                  {profile.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="size-4" /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      void signOut();
                    }}
                    disabled={signingOut}
                  >
                    <LogOut className="size-4" /> {signingOut ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-[286px] bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo href="/app/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-5 space-y-0.5" aria-label="Mobile app navigation">
              {[...nav, ...accountNav].map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                  onClick={() => setMobileOpen(false)}
                  badge={item.href === "/app/messages" ? unreadMessages : undefined}
                />
              ))}
              {profile.isAdmin && (
                <NavLink
                  href="/admin"
                  label="Admin"
                  icon={ShieldCheck}
                  active={pathname.startsWith("/admin")}
                  onClick={() => setMobileOpen(false)}
                />
              )}
            </nav>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-lg lg:hidden"
        aria-label="Bottom navigation"
      >
        {[
          { href: "/app/discover", label: "Discover", icon: Compass },
          { href: "/app/likes", label: "Likes", icon: Heart },
          { href: "/app/matches", label: "Matches", icon: HeartHandshake },
          { href: "/app/messages", label: "Messages", icon: MessageCircle },
          { href: "/app/profile", label: "Profile", icon: UserRound },
        ].map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[9.5px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <item.icon className="size-[19px]" />
                {item.href === "/app/messages" && unreadMessages > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
