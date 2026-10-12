import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn, formatSignedPercent } from "@/lib/utils";

export function GrowthIndicator({
  value,
  suffix = "",
  size = "md",
  className,
  showIcon = true,
}: {
  value: number;
  suffix?: string;
  size?: "sm" | "md";
  className?: string;
  showIcon?: boolean;
}) {
  const rounded = Math.round(value * 10) / 10;
  const flat = Math.abs(rounded) < 0.05;
  const tone = flat
    ? "text-text-muted"
    : rounded > 0
      ? "text-positive"
      : "text-negative";
  const Icon = flat ? Minus : rounded > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 font-medium",
        size === "sm" ? "text-[12px]" : "text-[13px]",
        tone,
        className,
      )}
    >
      {showIcon ? <Icon className={size === "sm" ? "size-3" : "size-3.5"} /> : null}
      {flat ? "0%" : formatSignedPercent(rounded)}
      {suffix}
    </span>
  );
}

export function DeltaPill({
  value,
  label,
  invert = false,
  className,
  suffix = "%",
}: {
  value: number;
  label?: string;
  invert?: boolean;
  className?: string;
  /** Use " pts" for percentage-point deltas so the unit reads correctly. */
  suffix?: string;
}) {
  const rounded = Math.round(value * 10) / 10;
  const flat = Math.abs(rounded) < 0.05;
  const positive = invert ? rounded < 0 : rounded > 0;
  const tone = flat
    ? "border-border bg-elevated text-text-secondary"
    : positive
      ? "border-positive/25 bg-positive/10 text-positive"
      : "border-negative/25 bg-negative/10 text-negative";

  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        tone,
        className,
      )}
    >
      {flat
        ? "—"
        : `${rounded > 0 ? "+" : ""}${rounded}${suffix}`}
      {label ? <span className="text-text-muted">{label}</span> : null}
    </span>
  );
}
