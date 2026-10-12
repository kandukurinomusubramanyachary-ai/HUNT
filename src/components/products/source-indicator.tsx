import { sourceMeta } from "@/data/demo-evidence";
import { cn } from "@/lib/utils";
import type { DataSourceType } from "@/types";

const DOT: Record<DataSourceType, string> = {
  "google-trends": "#60A5FA",
  reddit: "#FB7185",
  "social-signals": "#A3E635",
  "competitor-research": "#C084FC",
};

export function SourceDot({ source }: { source: DataSourceType }) {
  return (
    <span
      className="size-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: DOT[source] }}
      aria-hidden="true"
    />
  );
}

export function SourceChips({
  sources,
  className,
}: {
  sources: DataSourceType[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {sources.map((source) => (
        <span
          key={source}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-elevated px-1.5 py-0.5 text-[11px] text-text-secondary"
        >
          <SourceDot source={source} />
          {sourceMeta[source].label}
        </span>
      ))}
    </div>
  );
}

export function SourceIndicatorStrip({ className }: { className?: string }) {
  const sources = Object.keys(sourceMeta) as DataSourceType[];
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 rounded-card border border-border bg-surface p-4 sm:grid-cols-4",
        className,
      )}
    >
      {sources.map((source) => (
        <div key={source} className="flex items-start gap-2.5">
          <span
            className="mt-1 size-2 shrink-0 rounded-full"
            style={{ backgroundColor: DOT[source] }}
          />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-text">
              {sourceMeta[source].label}
            </p>
            <p className="text-[11px] leading-4 text-text-muted">
              {sourceMeta[source].description}
            </p>
            <p className="mt-0.5 text-[10px] font-medium tracking-wide text-text-muted/80">
              Sample feed · planned integration
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
