"use client";

import * as React from "react";
import Link from "next/link";
import { Compass, PackageSearch, Rocket, Trash2 } from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { DemoNote } from "@/components/shared/demo-badge";
import { GrowthIndicator } from "@/components/shared/growth-indicator";
import { Sparkline } from "@/components/shared/sparkline";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  getSavedProducts,
  marginPct,
  scoreBand,
  toggleSavedProduct,
} from "@/lib/services/products";
import { useHuntStore } from "@/store/hunt-store";
import { formatCurrency, formatPercent } from "@/lib/utils";

import { LiveRadar } from './live-intelligence';
export function OpportunitiesView() {
  const [demo, setDemo] = React.useState(false);
  return demo ? <><div className="mb-4"><Button variant="secondary" onClick={() => setDemo(false)}>Live Mode</Button><span className="ml-3 text-warning">Demo Mode ? sample fixtures</span></div><DemoOpportunitiesView /></> : <LiveRadar demo={demo} onModeChange={() => setDemo(true)} shortlist />;
}
function DemoOpportunitiesView() {
  const savedProductIds = useHuntStore((state) => state.savedProductIds);
  const saved = React.useMemo(
    () => getSavedProducts().filter(product => product.isDemo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedProductIds],
  );

  return (
    <>
      <PageIntro
        title="Saved opportunities"
        subtitle="Your shortlist, ranked for action."
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Intelligence" },
          { label: "Opportunities" },
        ]}
        actions={
          <Button asChild variant="primary">
            <Link href="/discover">
              <Compass />
              Open radar
            </Link>
          </Button>
        }
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No saved opportunities yet."
          description="Save products from the Opportunity Radar to compare them side by side before you commit to a launch."
          action={
            <Button asChild variant="primary">
              <Link href="/discover">Browse opportunities</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <h3 className="text-card font-semibold text-text">
                  Ranking board
                </h3>
                <p className="mt-1 text-secondary text-text-secondary">
                  {saved.length} saved product{saved.length === 1 ? "" : "s"},
                  ordered by opportunity score.
                </p>
              </div>
              <DemoNote>Sample scores — not validated predictions.</DemoNote>
            </div>
            <div className="overflow-x-auto px-5 pb-5 sm:px-6">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-[11px] font-medium text-text-muted">
                      #
                    </th>
                    <th className="pb-2 text-[11px] font-medium text-text-muted">
                      Product
                    </th>
                    <th className="pb-2 text-[11px] font-medium text-text-muted">
                      Score
                    </th>
                    <th className="pb-2 text-[11px] font-medium text-text-muted">
                      Trend
                    </th>
                    <th className="pb-2 text-[11px] font-medium text-text-muted">
                      Competition
                    </th>
                    <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                      Retail
                    </th>
                    <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                      Margin
                    </th>
                    <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saved
                    .slice()
                    .sort((a, b) => b.opportunityScore - a.opportunityScore)
                    .map((product, index) => {
                      const band = scoreBand(product.opportunityScore);
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          <td className="tabular py-3 text-[12px] text-text-muted">
                            {String(index + 1).padStart(2, "0")}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt=""
                                className="size-9 rounded-lg border border-border object-cover"
                              />
                              <div className="min-w-0">
                                <Link
                                  href={`/products/${product.id}`}
                                  className="truncate text-[13px] font-medium text-text hover:underline"
                                >
                                  {product.name}
                                </Link>
                                <p className="truncate text-[11px] text-text-muted">
                                  {product.category}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className="tabular text-[13px] font-semibold"
                              style={{ color: band.color }}
                            >
                              {product.opportunityScore}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <GrowthIndicator
                                value={product.growthPct}
                                size="sm"
                              />
                              <Sparkline
                                values={product.trendPoints.map((p) => p.value)}
                                width={56}
                                height={22}
                                color={band.color}
                                fill={false}
                              />
                            </div>
                          </td>
                          <td>
                            <Badge
                              tone={
                                product.competitionLevel === "low"
                                  ? "positive"
                                  : product.competitionLevel === "medium"
                                    ? "warning"
                                    : "negative"
                              }
                            >
                              {product.competitionLevel}
                            </Badge>
                          </td>
                          <td className="tabular text-right text-[13px] text-text">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="tabular text-right text-[13px] text-positive">
                            {formatPercent(marginPct(product), 0)}
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button asChild variant="secondary" size="sm">
                                <Link href={`/products/${product.id}`}>
                                  Analyze
                                </Link>
                              </Button>
                              <Button asChild variant="primary" size="sm">
                                <Link
                                  href={`/stores/new?product=${product.id}`}
                                >
                                  <Rocket />
                                  Launch
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remove ${product.name} from shortlist`}
                                onClick={() => {
                                  toggleSavedProduct(product.id);
                                  toast({
                                    title: "Removed from shortlist",
                                    description: `${product.name} was removed.`,
                                  });
                                }}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
            <h3 className="text-card font-semibold text-text">
              Score comparison
            </h3>
            <p className="mt-1 text-secondary text-text-secondary">
              Opportunity scores across your saved shortlist.
            </p>
            <div className="mt-5 flex flex-col gap-3.5">
              {saved
                .slice()
                .sort((a, b) => b.opportunityScore - a.opportunityScore)
                .map((product) => {
                  const band = scoreBand(product.opportunityScore);
                  return (
                    <div key={product.id}>
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/products/${product.id}`}
                          className="truncate text-[13px] font-medium text-text hover:underline"
                        >
                          {product.name}
                        </Link>
                        <span className="tabular text-[12px] text-text-secondary">
                          {product.opportunityScore} · {band.label}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#161B24]">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${product.opportunityScore}%`,
                            backgroundColor: band.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
