"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  ThumbsUp,
} from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { CompetitorCard } from "@/components/products/competitor-card";
import { EvidenceCard } from "@/components/products/evidence-card";
import { SourceChips } from "@/components/products/source-indicator";
import { DemoBadge, DemoNote } from "@/components/shared/demo-badge";
import { GrowthIndicator } from "@/components/shared/growth-indicator";
import { OpportunityScore } from "@/components/shared/opportunity-score";
import { TrendChart } from "@/components/shared/trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import {
  getProductById,
  grossMargin,
  marginPct,
  scoreBand,
  toggleSavedProduct,
} from "@/lib/services/products";
import { useHuntStore } from "@/store/hunt-store";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Product } from "@/types";

type Period = "4" | "8" | "12";

function ScoreBar({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium text-text">{label}</p>
        <p className="tabular text-[13px] font-semibold text-text">{value}</p>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#161B24]">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] leading-4 text-text-muted">{hint}</p>
    </div>
  );
}

function Section({
  title,
  description,
  badge,
  children,
  className,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-surface p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-section font-semibold text-text">{title}</h3>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-secondary text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

import { LiveProductDetail } from './live-intelligence';
export function ProductDetailView({ productId }: { productId: string }) {
  return productId.startsWith('live-') ? <LiveProductDetail productId={productId} /> : <DemoProductDetailView productId={productId} />;
}
function DemoProductDetailView({ productId }: { productId: string }) {
  const router = useRouter();
  const product = React.useMemo(
    () => getProductById(productId),
    [productId],
  ) as Product | undefined;
  const savedProductIds = useHuntStore((state) => state.savedProductIds);
  const [period, setPeriod] = React.useState<Period>("12");

  if (!product) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-display text-text">Product not found</h2>
        <p className="text-body text-text-secondary">
          This sample opportunity is not part of the demo catalogue.
        </p>
        <Button asChild variant="primary">
          <Link href="/discover">Back to Opportunity Radar</Link>
        </Button>
      </div>
    );
  }

  const saved = savedProductIds.includes(product.id);
  const band = scoreBand(product.opportunityScore);
  const trendData = product.trendPoints
    .slice(-Number(period))
    .map((point) => ({ date: point.date, value: point.value }));
  const demandEvidence = product.evidence.filter(
    (item) => item.source === "google-trends" || item.source === "social-signals",
  );
  const socialEvidence = product.evidence.filter(
    (item) => item.source === "reddit" || item.source === "social-signals",
  );
  const competitorEvidence = product.evidence.filter(
    (item) => item.source === "competitor-research",
  );

  const actions = (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          toggleSavedProduct(product.id);
          toast({
            title: saved ? "Removed from shortlist" : "Opportunity saved",
            description: `${product.name} ${
              saved ? "was removed from" : "was added to"
            } your shortlist.`,
          });
        }}
      >
        {saved ? <BookmarkCheck /> : <Bookmark />}
        {saved ? "Saved" : "Save opportunity"}
      </Button>
      <Button asChild variant="primary">
        <Link href={`/stores/new?product=${product.id}`}>
          <Rocket />
          Launch store
        </Link>
      </Button>
    </>
  );

  return (
    <>
      <PageIntro
        title={product.name}
        subtitle={product.tagline}
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Intelligence", href: "/discover" },
          { label: "Discover", href: "/discover" },
          { label: product.name },
        ]}
        actions={actions}
      />

      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/discover")}
        >
          <ArrowLeft />
          Back to Opportunity Radar
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Overview */}
        <section className="rounded-card border border-border bg-surface">
          <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[10px] border border-border bg-[#0D1016]">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{product.category}</Badge>
                    <Badge
                      tone={
                        product.competitionLevel === "low"
                          ? "positive"
                          : product.competitionLevel === "medium"
                            ? "warning"
                            : "negative"
                      }
                    >
                      {product.competitionLevel} competition
                    </Badge>
                    <DemoBadge label="Sample analysis" />
                  </div>
                  <h2 className="mt-3 text-display text-text">{product.name}</h2>
                  <p className="mt-1.5 text-body text-text-secondary">
                    {product.tagline}
                  </p>
                </div>
                <OpportunityScore score={product.opportunityScore} size="lg" />
              </div>

              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Suggested retail",
                    value: formatCurrency(product.price),
                    hint: `Compare at ${formatCurrency(product.compareAtPrice)}`,
                  },
                  {
                    label: "Est. product cost",
                    value: formatCurrency(product.estimatedCost),
                    hint: "Sample landed cost estimate",
                  },
                  {
                    label: "Est. gross margin",
                    value: formatCurrency(grossMargin(product)),
                    hint: `${formatPercent(marginPct(product), 0)} of retail`,
                  },
                  {
                    label: "Sample growth",
                    value: `${product.growthPct > 0 ? "+" : ""}${product.growthPct}%`,
                    hint: "12-week sample interest",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[10px] border border-border bg-elevated/40 px-3 py-2.5"
                  >
                    <dt className="text-[11px] text-text-muted">{item.label}</dt>
                    <dd className="tabular mt-1 text-[17px] font-semibold text-text">
                      {item.value}
                    </dd>
                    <p className="mt-0.5 text-[10px] leading-3 text-text-muted">
                      {item.hint}
                    </p>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-text-muted">
                  Signals included
                </p>
                <SourceChips sources={product.sources} />
              </div>

              <div className="flex flex-wrap gap-2">
                {actions}
              </div>
            </div>
          </div>
        </section>

        {/* Demand + sentiment */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Section
            title="Demand intelligence"
            description="Normalised sample interest over the tracked window."
            badge={<DemoBadge label="Sample curve" />}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="tabular text-[20px] font-semibold text-text">
                  {formatNumber(trendData[trendData.length - 1]?.value ?? 0)}
                </span>
                <GrowthIndicator value={product.growthPct} />
                <span className="text-[11px] text-text-muted">
                  indexed interest
                </span>
              </div>
              <SegmentedControl
                ariaLabel="Demand period"
                value={period}
                onChange={setPeriod}
                size="sm"
                options={[
                  { value: "4", label: "4W" },
                  { value: "8", label: "8W" },
                  { value: "12", label: "12W" },
                ]}
              />
            </div>
            <TrendChart
              data={trendData}
              height={220}
              color={band.color}
              valueFormatter={(value) => `${formatNumber(value)} index`}
            />
            <div className="mt-5 grid grid-cols-1 gap-3">
              {demandEvidence.map((item) => (
                <EvidenceCard key={item.id} evidence={item} />
              ))}
            </div>
          </Section>

          <Section
            title="Social sentiment"
            description="Sample discussion clustering across community threads."
            badge={<DemoBadge label="Sample discussions" />}
          >
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Positive", value: product.sentiment.positive, tone: "#34D399" },
                { label: "Neutral", value: product.sentiment.neutral, tone: "#60A5FA" },
                { label: "Negative", value: product.sentiment.negative, tone: "#FB7185" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[10px] border border-border bg-elevated/40 px-3 py-2.5"
                >
                  <p className="text-[11px] text-text-muted">{item.label}</p>
                  <p className="tabular mt-0.5 text-[18px] font-semibold" style={{ color: item.tone }}>
                    {item.value}%
                  </p>
                </div>
              ))}
            </div>
            <p className="mb-4 text-[12px] text-text-muted">
              {formatNumber(product.sentiment.mentions)} sample mentions
              clustered across the tracked discussions.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-text">
                  <ShieldAlert className="size-3.5 text-negative" />
                  Key pain points
                </p>
                <ul className="space-y-1.5">
                  {product.sentiment.painPoints.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-[12px] leading-5 text-text-secondary"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-negative" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-text">
                  <ThumbsUp className="size-3.5 text-positive" />
                  Frequently mentioned benefits
                </p>
                <ul className="space-y-1.5">
                  {product.sentiment.benefits.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-[12px] leading-5 text-text-secondary"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-positive" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {socialEvidence.map((item) => (
                <EvidenceCard key={item.id} evidence={item} />
              ))}
            </div>
          </Section>
        </div>

        {/* Competitive landscape */}
        <Section
          title="Competitive landscape"
          description="Public storefront references collected as sample data."
          badge={<DemoBadge label="Sample research" />}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {product.competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                ourPrice={product.price}
              />
            ))}
          </div>
          {competitorEvidence.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {competitorEvidence.map((item) => (
                <EvidenceCard key={item.id} evidence={item} />
              ))}
            </div>
          ) : null}
        </Section>

        {/* Assessment + recommendation */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Section
            title="HUNT assessment"
            description="How the overall ranking was assembled."
            badge={<DemoBadge label="Heuristic" />}
          >
            <div className="flex flex-col gap-4">
              <ScoreBar
                label="Demand score"
                value={product.scores.demand}
                hint="Sample interest curve, growth and discussion volume."
              />
              <ScoreBar
                label="Competition score"
                value={product.scores.competition}
                hint="Higher means more room — fewer focused storefronts."
              />
              <ScoreBar
                label="Margin score"
                value={product.scores.margin}
                hint="Estimated gross margin after sample landed cost."
              />
              <ScoreBar
                label="Confidence score"
                value={product.scores.confidence}
                hint="Breadth and consistency of the sample evidence."
              />
            </div>
            <p className="mt-5 rounded-[10px] border border-border bg-elevated/40 p-3.5 text-[12px] leading-5 text-text-secondary">
              {product.scores.rationale}
            </p>
            <p className="mt-3 text-[11px] leading-4 text-text-muted">
              Scores are UI conventions computed from sample inputs. They are
              not validated business predictions.
            </p>
          </Section>

          <Section
            title="Recommendation"
            description="What HUNT would do with this opportunity."
            badge={<Badge tone="brand">Ranked {product.opportunityScore}</Badge>}
          >
            <div className="flex flex-col gap-4">
              <div className="rounded-[10px] border border-border bg-elevated/40 p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-text">
                  <Sparkles className="size-3.5 text-brand" />
                  Key opportunity
                </p>
                <p className="mt-1.5 text-[13px] leading-5 text-text-secondary">
                  {product.recommendation.opportunity}
                </p>
              </div>

              <div className="rounded-[10px] border border-border bg-elevated/40 p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-text">
                  <ShieldAlert className="size-3.5 text-negative" />
                  Main risks
                </p>
                <ul className="mt-2 space-y-1.5">
                  {product.recommendation.risks.map((risk) => (
                    <li
                      key={risk}
                      className="flex gap-2 text-[13px] leading-5 text-text-secondary"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-negative" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[10px] border border-border bg-elevated/40 p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-text">
                  <Target className="size-3.5 text-info" />
                  Suggested positioning
                </p>
                <p className="mt-1.5 text-[13px] leading-5 text-text-secondary">
                  {product.recommendation.positioning}
                </p>
              </div>

              <Button asChild variant="primary" size="lg" className="w-full">
                <Link href={`/stores/new?product=${product.id}`}>
                  <Rocket />
                  Build store
                </Link>
              </Button>
              <DemoNote>
                Product research shown here is sample data shipped with the
                frontend. Evidence links point at public pages for reference
                only.
              </DemoNote>
            </div>
          </Section>
        </div>

        <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <h3 className="text-section font-semibold text-text">Product story</h3>
          <p className="mt-2 max-w-3xl text-body text-text-secondary">
            {product.story}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-[10px] border border-border bg-elevated/40 px-3 py-2.5"
              >
                <p className="text-[10px] tracking-wide text-text-muted">
                  {spec.label}
                </p>
                <p className="mt-1 text-[12px] font-medium text-text">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
          <a
            href="https://trends.google.com/trends/"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-info hover:text-text"
          >
            Verify demand on Google Trends
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </>
  );
}
