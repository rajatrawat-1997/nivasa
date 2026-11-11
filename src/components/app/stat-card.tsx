import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-primary">
            <Icon className="size-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2.5 font-display text-[24px] font-extrabold tracking-[-0.04em]">{value}</p>
      {hint && <p className="mt-0.5 text-[10.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
