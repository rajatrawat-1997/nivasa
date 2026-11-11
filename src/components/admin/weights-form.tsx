"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompatibilityWeights } from "@/lib/types";
import { cn } from "@/lib/utils";

const labels: { key: keyof CompatibilityWeights; label: string; hint: string }[] = [
  { key: "cleanliness", label: "Cleanliness", hint: "How tidy each person keeps shared spaces." },
  { key: "sleep", label: "Sleep schedule", hint: "Early bird vs night owl routines." },
  { key: "budget", label: "Budget", hint: "Overlap in monthly rent budgets." },
  { key: "location", label: "Location", hint: "Shared city and neighbourhoods." },
  { key: "food", label: "Food", hint: "Dietary compatibility at home." },
  { key: "smoking", label: "Smoking", hint: "Smoker vs smoke-free households." },
  { key: "guests", label: "Guests", hint: "How often friends visit." },
  { key: "social", label: "Social life", hint: "Hosting and quiet-evening preferences." },
  { key: "work", label: "Work routine", hint: "Work from home patterns." },
  { key: "pets", label: "Pets", hint: "Pets at home." },
];

export function WeightsForm({ initial }: { initial: CompatibilityWeights }) {
  const router = useRouter();
  const [weights, setWeights] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  async function save() {
    setError(null);
    if (total < 90 || total > 110) {
      setError("Weights should add up to roughly 100 (between 90 and 110).");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compatibility_weights: weights }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Couldn't save the weights.");
        return;
      }
      toast.success("Compatibility weights updated.", {
        description: "New discovery rounds use these weights immediately.",
      });
      router.refresh();
    } catch {
      setError("You're offline. Nothing was saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {labels.map(({ key, label, hint }) => (
          <div key={key} className="space-y-1.5 rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={`weight-${key}`}>{label}</Label>
              <Input
                id={`weight-${key}`}
                type="number"
                min={0}
                max={100}
                value={weights[key]}
                onChange={(event) =>
                  setWeights((current) => ({
                    ...current,
                    [key]: Math.max(0, Math.min(100, Number(event.target.value))),
                  }))
                }
                className="h-8 w-16 text-center text-[11.5px]"
              />
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">{hint}</p>
            <div className="h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, weights[key] * 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
        <p className={cn("text-[11.5px]", total < 90 || total > 110 ? "font-semibold text-destructive" : "text-muted-foreground")}>
          Total weight: <strong>{total}</strong> / 100
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setWeights({
                cleanliness: 15,
                sleep: 12,
                budget: 15,
                location: 15,
                food: 8,
                smoking: 10,
                guests: 8,
                social: 7,
                work: 5,
                pets: 5,
              })
            }
            className="h-8 rounded-full text-[11px]"
          >
            <RotateCcw className="size-3.5" /> Defaults
          </Button>
          <Button type="button" size="sm" onClick={() => void save()} disabled={saving} className="h-8 rounded-full text-[11px]">
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save weights
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[11.5px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
