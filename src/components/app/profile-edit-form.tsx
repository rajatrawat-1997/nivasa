"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CITIES, NEIGHBOURHOODS } from "@/lib/constants";

type InitialProfile = {
  name: string;
  age: number;
  gender: string;
  city: string;
  locality: string;
  profession: string;
  company: string | null;
  bio: string;
  photos: string[];
  avatarUrl: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  languages: string[];
};

export function ProfileEditForm({ initial }: { initial: InitialProfile }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [age, setAge] = useState(String(initial.age));
  const [gender, setGender] = useState(initial.gender);
  const [profession, setProfession] = useState(initial.profession);
  const [company, setCompany] = useState(initial.company ?? "");
  const [bio, setBio] = useState(initial.bio);
  const [city, setCity] = useState(initial.city);
  const [locality, setLocality] = useState(initial.locality);
  const [budgetMin, setBudgetMin] = useState(String(initial.budgetMin));
  const [budgetMax, setBudgetMax] = useState(String(initial.budgetMax));
  const [moveInDate, setMoveInDate] = useState(initial.moveInDate);
  const [languages, setLanguages] = useState(initial.languages.join(", "));
  const [photos, setPhotos] = useState<string[]>(
    initial.photos.length > 0 ? initial.photos : initial.avatarUrl ? [initial.avatarUrl] : [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const neighbourhoods = NEIGHBOURHOODS[city] ?? [];

  function handleUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Please choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((current) => [...current, String(reader.result)].slice(0, 6));
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setError(null);
    const parsedAge = Number(age);
    const min = Number(budgetMin);
    const max = Number(budgetMax);

    if (name.trim().length < 2) return setError("Add your name (at least 2 characters).");
    if (!Number.isFinite(parsedAge) || parsedAge < 18) {
      return setError("You must be at least 18 to use Nivasa.");
    }
    if (!city) return setError("Choose your city.");
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      return setError("Your maximum budget needs to be higher than your minimum.");
    }
    if (photos.length === 0) return setError("Add at least one photo so people know who you are.");

    setSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: parsedAge,
          gender,
          profession: profession.trim(),
          company: company.trim() || null,
          bio: bio.trim(),
          city,
          locality: locality.trim(),
          budgetMin: min,
          budgetMax: max,
          moveInDate,
          languages: languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8),
          photos,
          avatarUrl: photos[0],
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Couldn't save your profile. Please try again.");
        return;
      }
      toast.success("Profile updated.");
      router.push("/app/profile");
      router.refresh();
    } catch {
      setError("You're offline. Your changes weren't saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Photos</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          The first photo is your main one. Up to six, max 1.5 MB each.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {photos.map((photo, index) => (
            <div key={`${photo.slice(-24)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <Image src={photo} alt={`Photo ${index + 1}`} fill sizes="160px" className="object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[8.5px] font-bold text-[#252525]">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
              <ImagePlus className="size-5" />
              <span className="text-[9.5px] font-medium">Add</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
            </label>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">About you</h2>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Full name</Label>
            <Input id="edit-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-age">Age</Label>
            <Input
              id="edit-age"
              type="number"
              inputMode="numeric"
              min={18}
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-gender">Gender</Label>
            <select
              id="edit-gender"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-profession">Profession</Label>
            <Input
              id="edit-profession"
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              placeholder="Product designer"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-company">Company (optional)</Label>
            <Input
              id="edit-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Where you work or study"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 600))}
              rows={4}
              placeholder="What's it like living with you? Be specific and honest."
            />
            <p className="text-right text-[9.5px] text-muted-foreground">{bio.length}/600</p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-languages">Languages (comma separated)</Label>
            <Input
              id="edit-languages"
              value={languages}
              onChange={(event) => setLanguages(event.target.value)}
              placeholder="English, Hindi, Kannada"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Location and budget</h2>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-city">City</Label>
            <select
              id="edit-city"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setLocality("");
              }}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {CITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-locality">Neighbourhood</Label>
            <Input
              id="edit-locality"
              value={locality}
              onChange={(event) => setLocality(event.target.value)}
              placeholder={neighbourhoods[0] ?? "Your area"}
              list="edit-locality-options"
            />
            <datalist id="edit-locality-options">
              {neighbourhoods.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-budget-min">Minimum budget (₹)</Label>
            <Input
              id="edit-budget-min"
              type="number"
              inputMode="numeric"
              value={budgetMin}
              onChange={(event) => setBudgetMin(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-budget-max">Maximum budget (₹)</Label>
            <Input
              id="edit-budget-max"
              type="number"
              inputMode="numeric"
              value={budgetMax}
              onChange={(event) => setBudgetMax(event.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-move-in">Move-in date</Label>
            <Input
              id="edit-move-in"
              type="date"
              value={moveInDate}
              onChange={(event) => setMoveInDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[11.5px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/app/profile">Cancel</Link>
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving} className="rounded-full px-6">
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
