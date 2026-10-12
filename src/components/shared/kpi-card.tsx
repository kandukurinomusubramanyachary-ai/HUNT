import type { LucideIcon } from "lucide-react";

import { DeltaPill } from "@/components/shared/growth-indicator";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  deltaSuffix,
  description,
  invertDelta = false,
  className,
  accent = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  deltaLabel?: string;
  deltaSuffix?: string;
  description?: string;
  invertDelta?: boolean;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-card border border-border bg-surface p-5 transition-colors duration-150 hover:border-[#38414F]",
        className,
      )}
    >
      {accent ? (
        <span className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-brand/[0.07] blur-xl" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md border border-border bg-elevated">
            <Icon className="size-3.5 text-text-secondary" />
          </span>
          <p className="text-label text-text-secondary">{label}</p>
        </div>
        {typeof delta === "number" ? (
          <DeltaPill
            value={delta}
            label={deltaLabel}
            suffix={deltaSuffix}
            invert={invertDelta}
          />
        ) : null}
      </div>
      <p className="tabular mt-4 text-kpi text-text">{value}</p>
      {description ? (
        <p className="mt-1.5 text-[12px] leading-4 text-text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
