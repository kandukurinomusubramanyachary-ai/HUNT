import { ExternalLink, MessagesSquare, TrendingUp, Users, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DataSourceType, EvidenceItem } from "@/types";
import { cn } from "@/lib/utils";

const ICON: Record<DataSourceType, React.ComponentType<{ className?: string }>> = {
  "google-trends": TrendingUp,
  reddit: MessagesSquare,
  "social-signals": Users,
  "competitor-research": Search,
};

const SENTIMENT_TONE = {
  positive: "positive",
  neutral: "info",
  negative: "negative",
} as const;

export function EvidenceCard({
  evidence,
  className,
}: {
  evidence: EvidenceItem;
  className?: string;
}) {
  const Icon = ICON[evidence.source];
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[10px] border border-border bg-elevated/40 p-3.5 transition-colors duration-150 hover:border-[#38414F]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-text-muted" />
        <span className="truncate text-[11px] font-semibold text-text-secondary">
          {evidence.label}
        </span>
        {evidence.sentiment ? (
          <Badge tone={SENTIMENT_TONE[evidence.sentiment]} className="ml-auto">
            {evidence.sentiment}
          </Badge>
        ) : null}
      </div>
      <p className="text-[13px] font-medium leading-5 text-text">
        {evidence.title}
      </p>
      <p className="text-[12px] leading-5 text-text-secondary">
        {evidence.snippet}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-1">
        <a
          href={evidence.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-info transition-colors hover:text-text"
        >
          View source
          <ExternalLink className="size-3" />
        </a>
        {evidence.signal ? (
          <span className="tabular text-[11px] text-text-muted">
            {evidence.signal}
          </span>
        ) : null}
      </div>
    </div>
  );
}
