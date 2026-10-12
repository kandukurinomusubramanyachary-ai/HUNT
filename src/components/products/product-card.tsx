"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Rocket,
  ScanLine,
} from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";
import { GrowthIndicator } from "@/components/shared/growth-indicator";
import { OpportunityScore } from "@/components/shared/opportunity-score";
import { Sparkline } from "@/components/shared/sparkline";
import {
  SourceChips,
  SourceDot,
} from "@/components/products/source-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marginPct } from "@/lib/services/products";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { Product } from "@/types";

const COMPETITION_TONE = {
  low: "positive",
  medium: "warning",
  high: "negative",
} as const;

export function ProductCard({
  product,
  saved,
  onToggleSave,
  trendWeeks = 12,
}: {
  product: Product;
  saved: boolean;
  onToggleSave: (product: Product) => void;
  trendWeeks?: number;
}) {
  const points = product.trendPoints.slice(-trendWeeks);
  const bandColor =
    product.opportunityScore >= 80
      ? "#A3E635"
      : product.opportunityScore >= 60
        ? "#34D399"
        : product.opportunityScore >= 40
          ? "#60A5FA"
          : "#FB7185";

  return (
    <div className="group relative flex flex-col rounded-card border border-border bg-surface transition-colors duration-150 hover:border-[#38414F]">
      <Link
        href={`/products/${product.id}`}
        className="absolute inset-0 z-0 rounded-card focus-visible:outline-none"
        aria-label={`Analyze ${product.name}`}
      />

      <div className="relative">
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-card border-b border-border bg-[#0D1016]">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <Badge tone="neutral" className="bg-[#090B10]/85 backdrop-blur">
              {product.category}
            </Badge>
          </div>
          <div className="absolute right-3 top-3">
            <Badge tone={COMPETITION_TONE[product.competitionLevel]}>
              {product.competitionLevel} competition
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-text">
              {product.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-[12px] leading-4 text-text-secondary">
              {product.tagline}
            </p>
          </div>
          <OpportunityScore score={product.opportunityScore} size="sm" showLabel={false} />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-elevated/40 px-3 py-2">
          <div>
            <p className="text-[10px] font-medium tracking-wide text-text-muted">
              Demand trend · {trendWeeks}w
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <GrowthIndicator value={product.growthPct} size="sm" />
              <span className="text-[11px] text-text-muted">sample</span>
            </div>
          </div>
          <Sparkline
            values={points.map((point) => point.value)}
            width={104}
            height={32}
            color={bandColor}
          />
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[8px] border border-border bg-bg/60 px-2 py-1.5">
            <dt className="text-[10px] tracking-wide text-text-muted">
              Price
            </dt>
            <dd className="tabular text-[13px] font-semibold text-text">
              {formatCurrency(product.price)}
            </dd>
          </div>
          <div className="rounded-[8px] border border-border bg-bg/60 px-2 py-1.5">
            <dt className="text-[10px] tracking-wide text-text-muted">
              Est. cost
            </dt>
            <dd className="tabular text-[13px] font-semibold text-text-secondary">
              {formatCurrency(product.estimatedCost)}
            </dd>
          </div>
          <div className="rounded-[8px] border border-border bg-bg/60 px-2 py-1.5">
            <dt className="text-[10px] tracking-wide text-text-muted">
              Margin
            </dt>
            <dd className="tabular text-[13px] font-semibold text-positive">
              {formatPercent(marginPct(product), 0)}
            </dd>
          </div>
        </dl>

        <SourceChips sources={product.sources} />

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <DemoBadge label="Sample signals" withIcon={false} />
            <span className="text-[10px] text-text-muted">
              {product.evidence.length} references
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {product.evidence.slice(0, 2).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(event) => event.stopPropagation()}
                className="relative z-10 flex items-center gap-1.5 text-[11px] text-text-muted transition-colors hover:text-info"
              >
                <SourceDot source={item.source} />
                <span className="shrink-0">{item.label}</span>
                <span className="truncate text-text-muted/80">
                  {item.signal ?? item.title}
                </span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="primary" size="sm" className="relative z-10 flex-1">
              <Link href={`/products/${product.id}`}>
                <ScanLine />
                Analyze product
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="relative z-10"
            >
              <Link href={`/stores/new?product=${product.id}`}>
                <Rocket />
                Launch store
              </Link>
            </Button>
            <Button
              variant={saved ? "secondary" : "outline"}
              size="sm"
              className={cn("relative z-10", saved && "border-brand/40 text-brand")}
              onClick={() => onToggleSave(product)}
              aria-pressed={saved}
            >
              {saved ? (
                <>
                  <BookmarkCheck />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark />
                  Save opportunity
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
