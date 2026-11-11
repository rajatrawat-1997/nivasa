"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  HeartHandshake,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CITIES,
  FURNISHING,
  LIFESTYLE_OPTIONS,
  NEIGHBOURHOODS,
  ROOM_TYPES,
  formatINR,
} from "@/lib/constants";
import type { Profile } from "@/lib/schema";
import type { HousingPreferences, Lifestyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultLifestyle: Lifestyle = {
  cleanliness: "moderately-tidy",
  sleep: "flexible",
  smoking: false,
  drinking: "occasionally",
  pets: "comfortable",
  guests: "occasionally",
  parties: "occasionally",
  work: "hybrid",
  food: "flexible",
  noise: "moderate",
  responsibilities: "shared",
};

const defaultHousing: HousingPreferences = {
  city: "Bengaluru",
  neighbourhoods: [],
  budgetMin: 15000,
  budgetMax: 25000,
  moveInDate: "",
  stayDuration: "12 months",
  roomType: "private-room",
  furnishing: "furnished",
  genderPreference: "any",
  requirements: "",
};

function OptionGrid({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: readonly { value: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cn(
              "relative rounded-xl border p-3.5 text-left transition-all",
              selected
                ? "border-primary bg-brand-soft shadow-[0_0_0_1px_var(--primary)]"
                : "border-border bg-card hover:border-foreground/20",
            )}
          >
            <span
              className={cn(
                "absolute right-3 top-3 flex size-4 items-center justify-center rounded-full border",
                selected ? "border-primary bg-primary text-white" : "border-border",
              )}
            >
              {selected && <Check className="size-2.5" />}
            </span>
            <p className="pr-5 text-[12.5px] font-semibold">{option.label}</p>
            {option.description && (
              <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
                {option.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  hint,
  error,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-[10.5px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Footer({
  saving,
  error,
  label = "Continue",
  onClick,
  backHref,
}: {
  saving: boolean;
  error: string | null;
  label?: string;
  onClick: () => void;
  backHref?: string;
}) {
  return (
    <div className="mt-8">
      {error && (
        <div className="mb-3 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[12px] text-destructive">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        {backHref ? (
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={backHref}>Back</Link>
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={onClick} disabled={saving} className="h-11 min-w-[140px] rounded-full">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              {label} <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

type WizardProps = {
  step:
    | "welcome"
    | "basic"
    | "photos"
    | "lifestyle"
    | "housing"
    | "verification"
    | "complete";
  profile: Profile | null;
  email?: string;
  emailVerified?: boolean;
  initialRole?: string;
};

export function OnboardingWizard({
  step,
  profile,
  email,
  emailVerified = false,
  initialRole,
}: WizardProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [role, setRole] = useState<"seeker" | "provider">(
    initialRole === "provider" || profile?.role === "provider" ? "provider" : "seeker",
  );

  const birthYear = new Date().getFullYear() - (profile?.age ?? 24);
  const [name, setName] = useState(profile?.name ?? "");
  const [dob, setDob] = useState(profile ? `${birthYear}-01-01` : "");
  const [gender, setGender] = useState(profile?.gender ?? "prefer-not-to-say");
  const [city, setCity] = useState(profile?.city ?? "Bengaluru");
  const [locality, setLocality] = useState(profile?.locality ?? "");
  const [profession, setProfession] = useState(profile?.profession ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [languages, setLanguages] = useState((profile?.languages ?? []).join(", "));

  const [photos, setPhotos] = useState<string[]>(
    profile?.photos?.length ? profile.photos : profile?.avatarUrl ? [profile.avatarUrl] : [],
  );
  const [photoUrl, setPhotoUrl] = useState("");

  const [lifestyle, setLifestyle] = useState<Lifestyle>(profile?.lifestyle ?? defaultLifestyle);
  const [housing, setHousing] = useState<HousingPreferences>(profile?.housing ?? defaultHousing);
  const [confirmed, setConfirmed] = useState(false);

  const age = useMemo(() => {
    if (!dob) return 0;
    const date = new Date(dob);
    if (Number.isNaN(date.getTime())) return 0;
    const today = new Date();
    let value = today.getFullYear() - date.getFullYear();
    const month = today.getMonth() - date.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < date.getDate())) value -= 1;
    return value;
  }, [dob]);

  async function save(payload: Record<string, unknown>, next?: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "We couldn't save that. Please try again.");
        setSaving(false);
        return;
      }
      if (next) {
        router.push(next);
        router.refresh();
      } else {
        setSaving(false);
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setSaving(false);
    }
  }

  if (step === "welcome") {
    return (
      <OnboardingShell
        current={0}
        title={profile ? `Welcome back, ${profile.name.split(" ")[0]}.` : "Let's find your people."}
        description={
          profile
            ? "Your profile is saved. Pick up where you left off — it only takes a few more minutes."
            : "Five short steps and you're ready to start meeting people who fit. You can change any answer later."
        }
      >
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            What are you here for?
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: "seeker" as const,
                icon: Search,
                title: "Find a roommate",
                body: "I'm looking for someone to live with, or a room to move into.",
              },
              {
                value: "provider" as const,
                icon: HeartHandshake,
                title: "Fill my room",
                body: "I have a room or flat and want to find the right person.",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                aria-pressed={role === option.value}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  role === option.value
                    ? "border-primary bg-brand-soft shadow-[0_0_0_1px_var(--primary)]"
                    : "border-border bg-card hover:border-foreground/20",
                )}
              >
                <option.icon
                  className={cn(
                    "size-5",
                    role === option.value ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <p className="mt-3 text-[14px] font-semibold">{option.title}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                  {option.body}
                </p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            You can switch between seeking and offering later. One account, both modes.
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { icon: Sparkles, text: "A compatibility score built from your real answers." },
            { icon: ShieldCheck, text: "You control what others see. Phone and documents stay private." },
            { icon: LockKeyhole, text: "Messaging only opens after a mutual match." },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-2.5 text-[12.5px] text-muted-foreground">
              <Icon className="mt-0.5 size-4 shrink-0 text-success" /> {text}
            </div>
          ))}
        </div>

        <Footer
          saving={saving}
          error={error}
          label={profile ? "Continue setting up" : "Start my profile"}
          onClick={() => {
            if (profile && role !== profile.role) {
              void save({ role }, "/onboarding/basic-details");
            } else {
              router.push(`/onboarding/basic-details?role=${role}`);
            }
          }}
        />
      </OnboardingShell>
    );
  }

  if (step === "basic") {
    return (
      <OnboardingShell
        current={1}
        title="The basics."
        description="This is what people see first. Keep it simple and honest — it makes better matches."
      >
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Field label="Full name" htmlFor="basic-name">
            <Input
              id="basic-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="h-11"
              placeholder="Your name"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date of birth" htmlFor="basic-dob" hint="You must be 18 or older.">
              <Input
                id="basic-dob"
                type="date"
                value={dob}
                onChange={(event) => setDob(event.target.value)}
                className="h-11"
                max={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field label="Gender" htmlFor="basic-gender">
              <select
                id="basic-gender"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" htmlFor="basic-city">
              <select
                id="basic-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
              >
                {CITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Neighbourhood" htmlFor="basic-locality">
              <Input
                id="basic-locality"
                value={locality}
                onChange={(event) => setLocality(event.target.value)}
                className="h-11"
                placeholder="e.g. Indiranagar"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profession" htmlFor="basic-profession">
              <Input
                id="basic-profession"
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
                className="h-11"
                placeholder="e.g. Product Designer"
              />
            </Field>
            <Field label="Company or university" htmlFor="basic-company" hint="Optional">
              <Input
                id="basic-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="h-11"
                placeholder="e.g. Lumen Studio"
              />
            </Field>
          </div>

          <Field label="A short introduction" htmlFor="basic-bio" hint={`${bio.length}/400 characters`}>
            <Textarea
              id="basic-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 400))}
              rows={3}
              placeholder="What should a potential roommate know about you?"
            />
          </Field>

          <Field
            label="Languages you speak"
            htmlFor="basic-languages"
            hint="Separate with commas."
          >
            <Input
              id="basic-languages"
              value={languages}
              onChange={(event) => setLanguages(event.target.value)}
              className="h-11"
              placeholder="English, Hindi"
            />
          </Field>
        </div>

        {age > 0 && age < 18 && (
          <p className="mt-3 text-[11.5px] text-destructive">
            Nivasa is only available to people aged 18 and over.
          </p>
        )}

        <Footer
          saving={saving}
          error={error}
          onClick={() => {
            if (!name.trim()) return setError("Please add your name.");
            if (!dob) return setError("Please add your date of birth.");
            if (age < 18) return setError("You must be at least 18 to use Nivasa.");
            if (!profession.trim()) return setError("Please add your profession.");
            void save(
              {
                name: name.trim(),
                age,
                gender,
                city,
                locality,
                profession: profession.trim(),
                company: company.trim() || null,
                bio,
                languages: languages
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
                role,
                avatarUrl: profile?.avatarUrl ?? "",
              },
              "/onboarding/photos",
            );
          }}
        />
      </OnboardingShell>
    );
  }

  if (step === "photos") {
    return (
      <OnboardingShell
        current={2}
        backHref="/onboarding/basic-details"
        title="Put a face to the name."
        description="Profiles with a clear, recent photo get far more genuine matches. Add up to three."
      >
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => {
              const photo = photos[index];
              return (
                <div
                  key={index}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl border border-dashed border-border bg-secondary/60"
                >
                  {photo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`Profile photo ${index + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/55 text-[11px] text-white"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white">
                          Main photo
                        </span>
                      )}
                    </>
                  ) : (
                    <label className="flex size-full cursor-pointer flex-col items-center justify-center gap-1.5 text-muted-foreground hover:bg-secondary">
                      <ImagePlus className="size-5" />
                      <span className="text-[10px] font-medium">Add photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1_500_000) {
                            setError("Please choose an image smaller than 1.5 MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = String(reader.result);
                            setPhotos((current) => {
                              const next = [...current];
                              next[index] = result;
                              return next.filter(Boolean).slice(0, 3);
                            });
                            setError(null);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="photo-url">Or paste an image URL</Label>
            <div className="flex gap-2">
              <Input
                id="photo-url"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder="https://…"
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl bg-card"
                onClick={() => {
                  if (!/^https?:\/\//.test(photoUrl)) {
                    setError("Enter a valid image URL starting with http.");
                    return;
                  }
                  setPhotos((current) => [...current, photoUrl].slice(0, 3));
                  setPhotoUrl("");
                  setError(null);
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-soft px-3.5 py-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              In this preview, photos are stored with your profile in the
              database. A production deployment should move them to private
              object storage with moderation.
            </p>
          </div>
        </div>

        <Footer
          saving={saving}
          error={error}
          onClick={() => {
            if (photos.length === 0) return setError("Add at least one photo to continue.");
            void save(
              { photos, avatarUrl: photos[0] },
              "/onboarding/lifestyle",
            );
          }}
        />
      </OnboardingShell>
    );
  }

  if (step === "lifestyle") {
    const update = <K extends keyof Lifestyle>(key: K, value: Lifestyle[K]) =>
      setLifestyle((current) => ({ ...current, [key]: value }));

    return (
      <OnboardingShell
        current={3}
        backHref="/onboarding/photos"
        wide
        title="How do you live?"
        description="There are no wrong answers. Honest ones lead to better matches — and fewer awkward conversations later."
      >
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[12.5px] font-semibold">Cleanliness</p>
            <p className="mb-3 text-[11px] text-muted-foreground">How do you keep shared spaces?</p>
            <OptionGrid
              options={LIFESTYLE_OPTIONS.cleanliness}
              value={lifestyle.cleanliness}
              onChange={(value) => update("cleanliness", value as Lifestyle["cleanliness"])}
            />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[12.5px] font-semibold">Sleep schedule</p>
            <p className="mb-3 text-[11px] text-muted-foreground">When does your day usually start and end?</p>
            <OptionGrid
              options={LIFESTYLE_OPTIONS.sleep}
              value={lifestyle.sleep}
              onChange={(value) => update("sleep", value as Lifestyle["sleep"])}
            />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[12.5px] font-semibold">Smoking</p>
              <p className="mb-3 text-[11px] text-muted-foreground">Do you smoke at home?</p>
              <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                <span className="text-[12.5px] font-medium">
                  {lifestyle.smoking ? "Yes, I smoke" : "No, I don't smoke"}
                </span>
                <Switch
                  checked={lifestyle.smoking}
                  onCheckedChange={(value) => update("smoking", value)}
                  aria-label="Smoking at home"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[12.5px] font-semibold">Drinking</p>
              <p className="mb-3 text-[11px] text-muted-foreground">How often, if at all?</p>
              <OptionGrid
                options={LIFESTYLE_OPTIONS.drinking}
                value={lifestyle.drinking}
                onChange={(value) => update("drinking", value as Lifestyle["drinking"])}
              />
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[12.5px] font-semibold">Pets</p>
            <p className="mb-3 text-[11px] text-muted-foreground">Would a pet be part of the home?</p>
            <OptionGrid
              options={LIFESTYLE_OPTIONS.pets}
              value={lifestyle.pets}
              onChange={(value) => update("pets", value as Lifestyle["pets"])}
            />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[12.5px] font-semibold">Guests</p>
              <p className="mb-3 text-[11px] text-muted-foreground">How often do people visit?</p>
              <OptionGrid
                options={LIFESTYLE_OPTIONS.guests}
                value={lifestyle.guests}
                onChange={(value) => update("guests", value as Lifestyle["guests"])}
              />
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[12.5px] font-semibold">Social life</p>
              <p className="mb-3 text-[11px] text-muted-foreground">Hosting, nights in and noise.</p>
              <OptionGrid
                options={LIFESTYLE_OPTIONS.parties}
                value={lifestyle.parties}
                onChange={(value) => update("parties", value as Lifestyle["parties"])}
              />
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[12.5px] font-semibold">Work routine</p>
            <p className="mb-3 text-[11px] text-muted-foreground">Where do you spend most weekdays?</p>
            <OptionGrid
              options={LIFESTYLE_OPTIONS.work}
              value={lifestyle.work}
              onChange={(value) => update("work", value as Lifestyle["work"])}
              columns={4}
            />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[12.5px] font-semibold">Food</p>
            <p className="mb-3 text-[11px] text-muted-foreground">Any preference for the shared kitchen?</p>
            <OptionGrid
              options={LIFESTYLE_OPTIONS.food}
              value={lifestyle.food}
              onChange={(value) => update("food", value as Lifestyle["food"])}
              columns={4}
            />
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[12.5px] font-semibold">Noise</p>
              <p className="mb-3 text-[11px] text-muted-foreground">How lively should home feel?</p>
              <OptionGrid
                options={LIFESTYLE_OPTIONS.noise}
                value={lifestyle.noise}
                onChange={(value) => update("noise", value as Lifestyle["noise"])}
              />
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[12.5px] font-semibold">Shared responsibilities</p>
              <p className="mb-3 text-[11px] text-muted-foreground">Chores, bills and groceries.</p>
              <OptionGrid
                options={LIFESTYLE_OPTIONS.responsibilities}
                value={lifestyle.responsibilities}
                onChange={(value) => update("responsibilities", value as Lifestyle["responsibilities"])}
              />
            </section>
          </div>
        </div>

        <Footer
          saving={saving}
          error={error}
          onClick={() => void save({ lifestyle }, "/onboarding/housing-preferences")}
        />
      </OnboardingShell>
    );
  }

  if (step === "housing") {
    const areas = NEIGHBOURHOODS[housing.city] ?? [];
    return (
      <OnboardingShell
        current={4}
        backHref="/onboarding/lifestyle"
        wide
        title="What are you looking for?"
        description="Tell us the practical details. We won't show you rooms or people outside your budget and area."
      >
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preferred city" htmlFor="housing-city">
                <select
                  id="housing-city"
                  value={housing.city}
                  onChange={(event) => {
                    const nextCity = event.target.value;
                    setHousing((current) => ({
                      ...current,
                      city: nextCity,
                      neighbourhoods: [],
                    }));
                    if (nextCity !== city) setCity(nextCity);
                  }}
                  className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {CITIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Stay duration" htmlFor="housing-stay">
                <select
                  id="housing-stay"
                  value={housing.stayDuration}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, stayDuration: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {["3 months", "6 months", "12 months", "24 months", "Flexible"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4">
              <p className="text-[12px] font-medium">Preferred neighbourhoods</p>
              <p className="mb-2 text-[11px] text-muted-foreground">Choose as many as you like.</p>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => {
                  const active = housing.neighbourhoods.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() =>
                        setHousing((current) => ({
                          ...current,
                          neighbourhoods: active
                            ? current.neighbourhoods.filter((item) => item !== area)
                            : [...current.neighbourhoods, area],
                        }))
                      }
                      aria-pressed={active}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                        active
                          ? "border-primary bg-brand-soft text-accent-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[12.5px] font-semibold">Monthly budget</p>
            <p className="mb-3 text-[11px] text-muted-foreground">
              An honest range helps us find people you can actually live with.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum" htmlFor="housing-budget-min">
                <Input
                  id="housing-budget-min"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={housing.budgetMin}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, budgetMin: Number(event.target.value) }))
                  }
                  className="h-11"
                />
              </Field>
              <Field label="Maximum" htmlFor="housing-budget-max">
                <Input
                  id="housing-budget-max"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={housing.budgetMax}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, budgetMax: Number(event.target.value) }))
                  }
                  className="h-11"
                />
              </Field>
            </div>
            <p className="mt-2 text-[12px] font-medium text-foreground">
              {formatINR(housing.budgetMin)} – {formatINR(housing.budgetMax)} per month
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Move-in date" htmlFor="housing-move-in">
                <Input
                  id="housing-move-in"
                  type="date"
                  value={housing.moveInDate}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, moveInDate: event.target.value }))
                  }
                  className="h-11"
                />
              </Field>
              <Field label="Room type" htmlFor="housing-room-type">
                <select
                  id="housing-room-type"
                  value={housing.roomType}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, roomType: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {ROOM_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Furnishing" htmlFor="housing-furnishing">
                <select
                  id="housing-furnishing"
                  value={housing.furnishing}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, furnishing: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {FURNISHING.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Flatmate gender preference"
                htmlFor="housing-gender"
                hint="Where local law permits this."
              >
                <select
                  id="housing-gender"
                  value={housing.genderPreference}
                  onChange={(event) =>
                    setHousing((current) => ({ ...current, genderPreference: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="any">No preference</option>
                  <option value="woman">Women only</option>
                  <option value="man">Men only</option>
                  <option value="non-binary">Non-binary only</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <Field
              label="Anything else that matters?"
              htmlFor="housing-requirements"
              hint="Optional — accessibility, quiet hours, a work desk, balcony…"
            >
              <Textarea
                id="housing-requirements"
                rows={3}
                value={housing.requirements}
                onChange={(event) =>
                  setHousing((current) => ({ ...current, requirements: event.target.value.slice(0, 500) }))
                }
                placeholder="e.g. I need a quiet space for calls during the day."
              />
            </Field>
          </section>
        </div>

        <Footer
          saving={saving}
          error={error}
          onClick={() => {
            if (housing.budgetMin > housing.budgetMax) {
              return setError("Your minimum budget can't be higher than your maximum.");
            }
            void save(
              {
                city: housing.city,
                locality: housing.neighbourhoods[0] ?? locality,
                budgetMin: housing.budgetMin,
                budgetMax: housing.budgetMax,
                moveInDate: housing.moveInDate,
                housing,
              },
              "/onboarding/verification",
            );
          }}
        />
      </OnboardingShell>
    );
  }

  if (step === "verification") {
    return (
      <OnboardingShell
        current={5}
        backHref="/onboarding/housing-preferences"
        title="Build a little trust."
        description="Verification helps everyone feel safer. You can add the optional checks later."
      >
        <div className="space-y-3">
          {[
            {
              icon: Mail,
              title: "Email address",
              value: email ?? "Not provided",
              status: emailVerified ? "Verified" : "Not verified",
              ok: emailVerified,
              note: emailVerified
                ? "Your email is confirmed."
                : "No email provider is connected in this preview, so we can't send a verification link yet.",
            },
            {
              icon: Phone,
              title: "Phone number",
              value: "Added during a future step",
              status: "Not connected",
              ok: false,
              note: "SMS verification needs a provider. We won't mark a number as verified until it actually is.",
            },
            {
              icon: BadgeCheck,
              title: "Identity check",
              value: "Optional",
              status: "Not connected",
              ok: false,
              note: "ID verification requires an approved provider. Documents are never shown to other members.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    item.ok ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold">{item.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        item.ok ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{item.value}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{item.note}</p>
                </div>
              </div>
            </div>
          ))}

          <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4 accent-[#F26B5B]"
            />
            <span className="text-[11.5px] leading-relaxed text-muted-foreground">
              I confirm the information on my profile is accurate, and I agree to
              treat other members with respect.
            </span>
          </label>
        </div>

        <Footer
          saving={saving}
          error={error}
          label="Finish setup"
          onClick={() => {
            if (!confirmed) {
              return setError("Please confirm your information is accurate to finish.");
            }
            void save({ onboardingComplete: true }, "/onboarding/complete");
          }}
        />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      current={6}
      title={`Your Nivasa journey starts here, ${profile?.name?.split(" ")[0] ?? "friend"}.`}
      description="Your profile is ready. Now comes the fun part — meeting people who actually fit."
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 text-center sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-56 rounded-full bg-warning/10 blur-2xl" />
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success">
          <Check className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-[-0.04em]">
          You&apos;re all set.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          We&apos;ll show you people who match your city, budget and lifestyle.
          Take your time, read the “why you match” notes, and start with a hello.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/app/discover">
              Discover roommates <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full bg-card px-6">
            <Link href="/app/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { icon: UserRound, title: "Complete your profile", body: "Add photos and a bio." },
          { icon: Search, title: "Set your filters", body: "Fine-tune your discovery." },
          { icon: HeartHandshake, title: "Say hello", body: "Message your matches." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-4">
            <item.icon className="size-4 text-primary" />
            <p className="mt-2 text-[12px] font-semibold">{item.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </OnboardingShell>
  );
}
