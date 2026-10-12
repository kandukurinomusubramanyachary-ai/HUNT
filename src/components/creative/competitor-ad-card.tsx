import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Competitor } from "@/types";

export function CompetitorAdCard({
  competitor,
  platform,
}: {
  competitor: Competitor;
  platform: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-elevated/40 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-text">
            {competitor.name}
          </p>
          <p className="truncate text-[11px] text-text-muted">
            {competitor.positioning}
          </p>
        </div>
        <span className="tabular shrink-0 text-[12px] font-semibold text-text">
          {formatCurrency(competitor.price)}
        </span>
      </div>

      <div className="rounded-md border border-border bg-bg/60 px-2.5 py-2">
        <p className="text-[11px] leading-4 text-text-secondary">
          Angle: leads on{" "}
          <span className="text-text">
            {competitor.strengths[0]?.toLowerCase() ?? "brand strength"}
          </span>
          . Weak on{" "}
          <span className="text-text">
            {competitor.weaknesses[0]?.toLowerCase() ?? "follow-through"}
          </span>
          .
        </p>
        <p className="mt-1 text-[11px] leading-4 text-text-muted">
          Reference channel: {competitor.channel} · {platform}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge tone="muted">Sample reference</Badge>
        <a
          href={competitor.adReference}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-info hover:text-text"
        >
          Source
          <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
