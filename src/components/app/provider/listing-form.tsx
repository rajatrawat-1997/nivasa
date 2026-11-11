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
import {
  AMENITIES,
  CITIES,
  FURNISHING,
  NEIGHBOURHOODS,
  PROPERTY_TYPES,
  ROOM_TYPES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ListingFormValues = {
  title: string;
  propertyType: string;
  roomType: string;
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  address: string;
  description: string;
  amenities: string[];
  furnishing: string;
  availableFrom: string;
  houseRules: string[];
  occupancy: number;
  photos: string[];
};

const defaultValues: ListingFormValues = {
  title: "",
  propertyType: "apartment",
  roomType: "private-room",
  rent: 20000,
  deposit: 40000,
  city: "Bengaluru",
  locality: "",
  address: "",
  description: "",
  amenities: [],
  furnishing: "furnished",
  availableFrom: "",
  houseRules: [],
  occupancy: 1,
  photos: [],
};

export function ListingForm({
  mode,
  listingId,
  initial,
}: {
  mode: "create" | "edit";
  listingId?: string;
  initial?: Partial<ListingFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ListingFormValues>({ ...defaultValues, ...initial });
  const [rules, setRules] = useState((initial?.houseRules ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    setValues((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  }

  function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > 1_500_000) {
      setError("Please choose images smaller than 1.5 MB each.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValues((current) => ({
        ...current,
        photos: [...current.photos, String(reader.result)].slice(0, 6),
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setError(null);
    if (values.title.trim().length < 8) return setError("Give the listing a clearer title.");
    if (values.description.trim().length < 40) {
      return setError("Describe the room in at least 40 characters.");
    }
    if (!values.locality.trim()) return setError("Add the neighbourhood.");
    if (!values.availableFrom) return setError("Add an availability date.");
    if (values.photos.length === 0) return setError("Add at least one photo.");
    if (values.deposit < 0) return setError("Deposit can't be negative.");

    setSaving(true);
    try {
      const payload = {
        ...values,
        houseRules: rules
          .split("\n")
          .map((rule) => rule.trim())
          .filter(Boolean)
          .slice(0, 10),
      };
      const response = await fetch(
        mode === "create" ? "/api/listings" : `/api/listings/${listingId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Couldn't save this listing. Please try again.");
        return;
      }
      toast.success(mode === "create" ? "Listing submitted for review." : "Listing updated.", {
        description:
          mode === "create"
            ? "It becomes public once a Nivasa admin approves it."
            : "Your changes are live for approved listings.",
      });
      router.push("/app/provider/listings");
      router.refresh();
    } catch {
      setError("You're offline. Your listing wasn't saved.");
    } finally {
      setSaving(false);
    }
  }

  const neighbourhoods = NEIGHBOURHOODS[values.city] ?? [];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">The basics</h2>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="listing-title">Listing title</Label>
            <Input
              id="listing-title"
              value={values.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="Sunlit private room in a 3BHK near Indiranagar metro"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-property">Property type</Label>
            <select
              id="listing-property"
              value={values.propertyType}
              onChange={(event) => set("propertyType", event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {PROPERTY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-room">Room type</Label>
            <select
              id="listing-room"
              value={values.roomType}
              onChange={(event) => set("roomType", event.target.value)}
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
            <Label htmlFor="listing-rent">Monthly rent (₹)</Label>
            <Input
              id="listing-rent"
              type="number"
              inputMode="numeric"
              value={values.rent}
              onChange={(event) => set("rent", Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-deposit">Security deposit (₹)</Label>
            <Input
              id="listing-deposit"
              type="number"
              inputMode="numeric"
              value={values.deposit}
              onChange={(event) => set("deposit", Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-city">City</Label>
            <select
              id="listing-city"
              value={values.city}
              onChange={(event) => {
                set("city", event.target.value);
                set("locality", "");
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
            <Label htmlFor="listing-locality">Neighbourhood</Label>
            <Input
              id="listing-locality"
              value={values.locality}
              onChange={(event) => set("locality", event.target.value)}
              placeholder={neighbourhoods[0] ?? "Area"}
              list="listing-locality-options"
            />
            <datalist id="listing-locality-options">
              {neighbourhoods.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="listing-address">Street address (private)</Label>
            <Input
              id="listing-address"
              value={values.address}
              onChange={(event) => set("address", event.target.value)}
              placeholder="Shared only with people you approve"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="listing-description">Description</Label>
            <Textarea
              id="listing-description"
              value={values.description}
              onChange={(event) => set("description", event.target.value.slice(0, 3000))}
              rows={5}
              placeholder="Who is this room for? What's nearby? What's the flat like?"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-furnishing">Furnishing</Label>
            <select
              id="listing-furnishing"
              value={values.furnishing}
              onChange={(event) => set("furnishing", event.target.value)}
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
            <Label htmlFor="listing-available">Available from</Label>
            <Input
              id="listing-available"
              type="date"
              value={values.availableFrom}
              onChange={(event) => set("availableFrom", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-occupancy">Occupancy</Label>
            <select
              id="listing-occupancy"
              value={values.occupancy}
              onChange={(event) => set("occupancy", Number(event.target.value))}
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
            >
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Photos</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Real, recent photos only. Listings with honest photos get better inquiries.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {values.photos.map((photo, index) => (
            <div key={`${photo.slice(-24)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <Image src={photo} alt={`Listing photo ${index + 1}`} fill sizes="160px" className="object-cover" />
              <button
                type="button"
                onClick={() =>
                  set(
                    "photos",
                    values.photos.filter((_, i) => i !== index),
                  )
                }
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {values.photos.length < 6 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
              <ImagePlus className="size-5" />
              <span className="text-[9.5px] font-medium">Add photo</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleUpload(event.target.files)}
              />
            </label>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em]">Amenities</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {AMENITIES.map((amenity) => {
            const active = values.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {amenity}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="listing-rules">House rules (one per line)</Label>
          <Textarea
            id="listing-rules"
            value={rules}
            onChange={(event) => setRules(event.target.value)}
            rows={3}
            placeholder={"No smoking indoors\nQuiet after 11pm"}
          />
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[11.5px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/app/provider/listings">Cancel</Link>
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving} className="rounded-full px-6">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Submit for review" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
