import { ExternalLink, Minus, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { Competitor } from "@/types";

export function CompetitorCard({
  competitor,
  ourPrice,
}: {
  competitor: Competitor;
  ourPrice?: number;
}) {
  const delta =
    ourPrice && ourPrice > 0
      ? ((competitor.price - ourPrice) / ourPrice) * 100
      : 0;

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-text">
            {competitor.name}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {competitor.positioning}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular text-[14px] font-semibold text-text">
            {formatCurrency(competitor.price)}
          </p>
          {ourPrice ? (
            <p
              className={`tabular text-[11px] ${
                delta > 0 ? "text-negative" : "text-positive"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(0)}% vs you
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-text-muted">
            <Plus className="size-3 text-positive" />
            Strengths
          </p>
          <ul className="space-y-1">
            {competitor.strengths.map((item) => (
              <li
                key={item}
                className="text-[12px] leading-4 text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-text-muted">
            <Minus className="size-3 text-negative" />
            Weaknesses
          </p>
          <ul className="space-y-1">
            {competitor.weaknesses.map((item) => (
              <li
                key={item}
                className="text-[12px] leading-4 text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span className="text-[11px] text-text-muted">
          Reference · {competitor.channel}
        </span>
        <a
          href={competitor.adReference}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-info transition-colors hover:text-text"
        >
          Ad reference
          <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
