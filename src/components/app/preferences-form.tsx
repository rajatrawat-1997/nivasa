"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CITIES, NEIGHBOURHOODS, LIFESTYLE_OPTIONS, ROOM_TYPES, FURNISHING } from "@/lib/constants";
import type { HousingPreferences, Lifestyle } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PreferencesForm({
  lifestyle: initialLifestyle,
  housing: initialHousing,
}: {
  lifestyle: Lifestyle;
  housing: HousingPreferences;
}) {
  const router = useRouter();
  const [lifestyle, setLifestyle] = useState<Lifestyle>(initialLifestyle);
  const [housing, setHousing] = useState<HousingPreferences>(initialHousing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setLife<K extends keyof Lifestyle>(key: K, value: Lifestyle[K]) {
    setLifestyle((current) => ({ ...current, [key]: value }));
  }

  function setHouse<K extends keyof HousingPreferences>(key: K, value: HousingPreferences[K]) {
    setHousing((current) => ({ ...current, [key]: value }));
  }

  function toggleNeighbourhood(area: string) {
    setHousing((current) => {
      const has = current.neighbourhoods.includes(area);
      return {
        ...current,
        neighbourhoods: has
          ? current.neighbourhoods.filter((item) => item !== area)
          : [...current.neighbourhoods, area].slice(0, 8),
      };
    });
  }

  async function save() {
    setError(null);
    if (housing.budgetMax < housing.budgetMin) {
      setError("Your maximum budget needs to be higher than your minimum.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifestyle, housing }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Couldn't save your preferences. Please try again.");
        return;
      }
      toast.success("Preferences updated.", {
        description: "Your compatibility scores will reflect these on the next round.",
      });
      router.refresh();
    } catch {
      setError("You're offline. Your preferences weren't saved.");
    } finally {
      setSaving(false);
    }
  }

  const areas = NEIGHBOURHOODS[housing.city] ?? [];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">How you live</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          These answers drive your compatibility scores. Be honest — mismatches are expensive later.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["cleanliness", "Cleanliness"],
              ["sleep", "Sleep schedule"],
              ["drinking", "Drinking"],
              ["pets", "Pets"],
              ["guests", "Guests"],
              ["parties", "Social life"],
              ["work", "Work routine"],
              ["food", "Food"],
              ["noise", "Noise at home"],
              ["responsibilities", "Chores"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`pref-${key}`}>{label}</Label>
              <select
                id={`pref-${key}`}
                value={lifestyle[key]}
                onChange={(event) => setLife(key, event.target.value as Lifestyle[typeof key])}
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
              >
                {LIFESTYLE_OPTIONS[key].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.description}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="pref-smoking">Smoking at home</Label>
            <select
              id="pref-smoking"
              value={lifestyle.smoking ? "yes" : "no"}
              onChange={(event) => setLife("smoking", event.target.value === "yes")}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="no">Smoke-free home</option>
              <option value="yes">Smoking is fine</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">What you're looking for</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pref-city">City</Label>
            <select
              id="pref-city"
              value={housing.city}
              onChange={(event) => {
                setHouse("city", event.target.value);
                setHouse("neighbourhoods", []);
              }}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-move-in">Move-in date</Label>
            <Input
              id="pref-move-in"
              type="date"
              value={housing.moveInDate}
              onChange={(event) => setHouse("moveInDate", event.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Preferred neighbourhoods</Label>
            <div className="flex flex-wrap gap-1.5">
              {areas.map((area) => {
                const active = housing.neighbourhoods.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleNeighbourhood(area)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-budget-min">Minimum budget (₹)</Label>
            <Input
              id="pref-budget-min"
              type="number"
              inputMode="numeric"
              value={housing.budgetMin}
              onChange={(event) => setHouse("budgetMin", Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-budget-max">Maximum budget (₹)</Label>
            <Input
              id="pref-budget-max"
              type="number"
              inputMode="numeric"
              value={housing.budgetMax}
              onChange={(event) => setHouse("budgetMax", Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-room">Room type</Label>
            <select
              id="pref-room"
              value={housing.roomType}
              onChange={(event) => setHouse("roomType", event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {ROOM_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-furnishing">Furnishing</Label>
            <select
              id="pref-furnishing"
              value={housing.furnishing}
              onChange={(event) => setHouse("furnishing", event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {FURNISHING.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-duration">How long?</Label>
            <select
              id="pref-duration"
              value={housing.stayDuration}
              onChange={(event) => setHouse("stayDuration", event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {["3 months", "6 months", "12 months", "24 months", "Flexible"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-gender">Flatmate preference</Label>
            <select
              id="pref-gender"
              value={housing.genderPreference}
              onChange={(event) => setHouse("genderPreference", event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="any">No preference</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pref-requirements">Non-negotiables</Label>
            <Textarea
              id="pref-requirements"
              value={housing.requirements}
              onChange={(event) => setHouse("requirements", event.target.value.slice(0, 1000))}
              rows={3}
              placeholder="No smoking indoors, vegetarian kitchen, quiet after 11pm…"
            />
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[11.5px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={() => void save()} disabled={saving} className="rounded-full px-6">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save preferences
        </Button>
      </div>
    </div>
  );
}
