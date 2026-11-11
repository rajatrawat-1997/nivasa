"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES, LIFESTYLE_OPTIONS } from "@/lib/constants";
import type { DiscoverFilters } from "@/lib/queries";

export function FiltersDialog({ filters }: { filters: DiscoverFilters }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [city, setCity] = useState(filters.city ?? "");
  const [locality, setLocality] = useState(filters.locality ?? "");
  const [minBudget, setMinBudget] = useState(filters.minBudget?.toString() ?? "");
  const [maxBudget, setMaxBudget] = useState(filters.maxBudget?.toString() ?? "");
  const [minAge, setMinAge] = useState(filters.minAge?.toString() ?? "18");
  const [maxAge, setMaxAge] = useState(filters.maxAge?.toString() ?? "45");
  const [profession, setProfession] = useState(filters.profession ?? "");
  const [work, setWork] = useState(filters.work ?? "");
  const [smoking, setSmoking] = useState(filters.smoking ?? "");
  const [pets, setPets] = useState(filters.pets ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(filters.verifiedOnly ?? false);

  function apply() {
    setApplying(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (locality) params.set("locality", locality);
    if (minBudget) params.set("minBudget", minBudget);
    if (maxBudget) params.set("maxBudget", maxBudget);
    if (minAge) params.set("minAge", minAge);
    if (maxAge) params.set("maxAge", maxAge);
    if (profession) params.set("profession", profession);
    if (work) params.set("work", work);
    if (smoking) params.set("smoking", smoking);
    if (pets) params.set("pets", pets);
    if (verifiedOnly) params.set("verified", "1");
    router.push(`/app/discover${params.size ? `?${params.toString()}` : ""}`);
    setOpen(false);
    setApplying(false);
  }

  function reset() {
    setCity("");
    setLocality("");
    setMinBudget("");
    setMaxBudget("");
    setMinAge("18");
    setMaxAge("45");
    setProfession("");
    setWork("");
    setSmoking("");
    setPets("");
    setVerifiedOnly(false);
    router.push("/app/discover");
    setOpen(false);
  }

  const activeCount = [
    city,
    locality,
    minBudget,
    maxBudget,
    profession,
    work,
    smoking,
    pets,
    verifiedOnly ? "1" : "",
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 rounded-full bg-card text-[12px]">
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Discovery filters</DialogTitle>
          <DialogDescription>
            Narrow your search. We&apos;ll recalculate compatibility for everyone you see.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="filter-city">City</Label>
              <select
                id="filter-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">All cities</option>
                {CITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-locality">Neighbourhood</Label>
              <Input
                id="filter-locality"
                value={locality}
                onChange={(event) => setLocality(event.target.value)}
                placeholder="Any area"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-min-budget">Min budget (₹)</Label>
              <Input
                id="filter-min-budget"
                type="number"
                inputMode="numeric"
                value={minBudget}
                onChange={(event) => setMinBudget(event.target.value)}
                placeholder="10000"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-max-budget">Max budget (₹)</Label>
              <Input
                id="filter-max-budget"
                type="number"
                inputMode="numeric"
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                placeholder="30000"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-min-age">Min age</Label>
              <Input
                id="filter-min-age"
                type="number"
                inputMode="numeric"
                value={minAge}
                onChange={(event) => setMinAge(event.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-max-age">Max age</Label>
              <Input
                id="filter-max-age"
                type="number"
                inputMode="numeric"
                value={maxAge}
                onChange={(event) => setMaxAge(event.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-profession">Profession</Label>
            <Input
              id="filter-profession"
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              placeholder="e.g. Designer, Engineer"
              className="h-10"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="filter-work">Work routine</Label>
              <select
                id="filter-work"
                value={work}
                onChange={(event) => setWork(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Any</option>
                {LIFESTYLE_OPTIONS.work.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-smoking">Smoking</Label>
              <select
                id="filter-smoking"
                value={smoking}
                onChange={(event) => setSmoking(event.target.value as "" | "yes" | "no")}
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Any</option>
                <option value="no">Non-smoker</option>
                <option value="yes">Smoker</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-pets">Pets</Label>
            <select
              id="filter-pets"
              value={pets}
              onChange={(event) => setPets(event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Any</option>
              {LIFESTYLE_OPTIONS.pets.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3.5 py-3">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="size-4 accent-[#F26B5B]"
            />
            <span className="text-[12px] font-medium">Verified profiles only</span>
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={reset} className="rounded-full">
            Clear all
          </Button>
          <Button type="button" onClick={apply} disabled={applying} className="rounded-full px-5">
            {applying ? <Loader2 className="size-4 animate-spin" /> : null}
            Show matches
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
