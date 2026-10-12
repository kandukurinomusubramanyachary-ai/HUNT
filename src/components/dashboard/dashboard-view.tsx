"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Compass,
  LayoutGrid,
  Megaphone,
  PackageSearch,
  Plus,
  ShoppingBag,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { useHydrated } from "@/components/layout/store-hydrator";
import { RelativeTime } from "@/components/shared/relative-time";
import { DemoBadge, DemoNote } from "@/components/shared/demo-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { GrowthIndicator } from "@/components/shared/growth-indicator";
import { Sparkline } from "@/components/shared/sparkline";
import { TrendChart } from "@/components/shared/trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/tabs";
import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";
import { getRecentActivity } from "@/lib/services/activity";
import { getDashboardKpis } from "@/lib/services/dashboard";
import { rangeFor } from "@/lib/analytics";
import { getTopOpportunities, scoreBand } from "@/lib/services/products";
import { getStoreStats } from "@/lib/services/stores";
import { buildSeries } from "@/lib/analytics";
import { useHuntStore } from "@/store/hunt-store";
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";
import type { ActivityEventType } from "@/types";

type RevenueRange = "daily" | "weekly" | "monthly";

const RANGE_CONFIG: Record<
  RevenueRange,
  { days: number; bucket: "day" | "week" | "month" }
> = {
  daily: { days: 14, bucket: "day" },
  weekly: { days: 84, bucket: "week" },
  monthly: { days: 182, bucket: "month" },
};

const ACTIVITY_ICON: Record<ActivityEventType, React.ComponentType<{ className?: string }>> = {
  "product-discovered": PackageSearch,
  "store-created": Store,
  "creative-generated": Megaphone,
  "order-completed": ShoppingBag,
  "store-updated": LayoutGrid,
  "store-deleted": LayoutGrid,
};

const QUICK_ACTIONS = [
  {
    label: "Hunt products",
    description: "Scan the opportunity radar",
    href: "/discover",
    icon: Compass,
  },
  {
    label: "Launch store",
    description: "Build a storefront from a product",
    href: "/stores/new",
    icon: Store,
  },
  {
    label: "Create advertisement",
    description: "Generate campaign creative",
    href: "/creative",
    icon: Megaphone,
  },
  {
    label: "View analytics",
    description: "Track visitors and orders",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function DashboardView() {
  const hydrated = useHydrated();
  const [range, setRange] = React.useState<RevenueRange>("weekly");

  const stores = useHuntStore((state) => state.stores);
  const orders = useHuntStore((state) => state.orders);
  const traffic = useHuntStore((state) => state.traffic);
  const activities = useHuntStore((state) => state.activities);
  const savedProductIds = useHuntStore((state) => state.savedProductIds);

  const kpis = React.useMemo(
    () => (hydrated ? getDashboardKpis(30) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hydrated, orders, traffic, stores],
  );

  const revenueSeries = React.useMemo(() => {
    if (!hydrated) return [];
    const config = RANGE_CONFIG[range];
    const rangeDates = rangeFor(config.days);
    return buildSeries(traffic, orders, rangeDates, config.bucket).map(
      (point) => ({
        date: point.date,
        value: point.revenue,
        label: point.label,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, range, orders, traffic]);

  const storeRows = React.useMemo(
    () =>
      stores.map((store) => ({
        store,
        stats: getStoreStats(store.id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stores, orders, traffic],
  );

  const activity = React.useMemo(
    () => getRecentActivity(7),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities, orders],
  );

  const topOpportunities = React.useMemo(() => getTopOpportunities(3), []);
  const savedCount = savedProductIds.length;

  const actions = (
    <>
      <Button asChild variant="secondary">
        <Link href="/stores/new">
          <Plus />
          Create store
        </Link>
      </Button>
      <Button asChild variant="primary">
        <Link href="/discover">
          <Compass />
          Discover products
        </Link>
      </Button>
    </>
  );

  return (
    <>
      <PageIntro
        title="Command Center"
        subtitle="Your commerce operations, all in one place."
        breadcrumbs={[{ label: "HUNT", href: "/dashboard" }, { label: "Dashboard" }]}
        actions={actions}
      />

      <div className="grid grid-cols-12 gap-4">
        {/* KPI row */}
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!hydrated || !kpis ? (
            Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : (
            <>
              <KpiCard
                label="Products discovered"
                value={formatNumber(kpis.productsDiscovered)}
                icon={PackageSearch}
                description={`${savedCount} saved to your shortlist`}
              />
              <KpiCard
                label="Active stores"
                value={formatNumber(kpis.activeStores)}
                icon={Store}
                description={`${kpis.activeStoresChange} launched in the last 30 days`}
              />
              <KpiCard
                label="Simulated revenue"
                value={formatCompact(kpis.revenue)}
                icon={TrendingUp}
                delta={kpis.revenueChange}
                deltaLabel="vs prev 30d"
                description="Demo orders only — no real payments"
                accent
              />
              <KpiCard
                label="Demo conversion rate"
                value={formatPercent(kpis.conversionRate, 2)}
                icon={Wallet}
                delta={kpis.conversionRateChange}
                deltaSuffix=" pts"
                description="Demo orders ÷ demo visitors"
              />
            </>
          )}
        </div>

        {/* Revenue overview */}
        <section className="col-span-12 xl:col-span-8">
          <div className="flex h-full flex-col rounded-card border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-card font-semibold text-text">
                    Revenue overview
                  </h3>
                  <DemoBadge />
                </div>
                <p className="mt-1 text-secondary text-text-secondary">
                  Simulated revenue from demo order records.
                </p>
              </div>
              <SegmentedControl
                ariaLabel="Revenue period"
                value={range}
                onChange={setRange}
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
                size="sm"
              />
            </div>
            <div className="flex-1 px-2 pb-5 sm:px-4">
              {!hydrated ? (
                <Skeleton className="mx-4 h-[248px] w-auto" />
              ) : (
                <TrendChart
                  data={revenueSeries}
                  height={248}
                  color="#A3E635"
                  valueFormatter={(value) => formatCurrency(value)}
                />
              )}
            </div>
          </div>
        </section>

        {/* Opportunity radar */}
        <section className="col-span-12 xl:col-span-4">
          <div className="flex h-full flex-col rounded-card border border-border bg-surface">
            <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <h3 className="text-card font-semibold text-text">
                  Opportunity radar
                </h3>
                <p className="mt-1 text-secondary text-text-secondary">
                  Top ranked products from sample signals.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/discover">
                  All
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3 px-5 pb-5 sm:px-6">
              {topOpportunities.map((product) => {
                const band = scoreBand(product.opportunityScore);
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-[10px] border border-border bg-elevated/40 p-3 transition-colors duration-150 hover:border-[#38414F]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-11 shrink-0 rounded-lg border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-text">
                          {product.name}
                        </p>
                        <span
                          className="tabular shrink-0 text-[11px] font-semibold"
                          style={{ color: band.color }}
                        >
                          {product.opportunityScore}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <GrowthIndicator
                          value={product.growthPct}
                          size="sm"
                        />
                        <span className="text-[11px] text-text-muted">
                          {product.competitionLevel} competition
                        </span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <Sparkline
                        values={product.trendPoints.map((point) => point.value)}
                        width={64}
                        height={26}
                        color={band.color}
                      />
                    </div>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/products/${product.id}`}>Details</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Store performance */}
        <section className="col-span-12 xl:col-span-7">
          <div className="flex h-full flex-col rounded-card border border-border bg-surface">
            <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-card font-semibold text-text">
                    Store performance
                  </h3>
                  <DemoBadge label="Demo metrics" />
                </div>
                <p className="mt-1 text-secondary text-text-secondary">
                  Derived from the same order records as analytics.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/stores">
                  Manage
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="px-5 pb-5 sm:px-6">
              {!hydrated ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : storeRows.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-border px-4 py-8 text-center text-secondary text-text-muted">
                  No stores yet. Launch your first store.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 text-[11px] font-medium text-text-muted">
                          Store
                        </th>
                        <th className="pb-2 text-[11px] font-medium text-text-muted">
                          Status
                        </th>
                        <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                          Demo orders
                        </th>
                        <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                          Demo revenue
                        </th>
                        <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                          Conv.
                        </th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {storeRows.map(({ store, stats }) => (
                        <tr
                          key={store.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={store.productImage}
                                alt=""
                                className="size-9 rounded-lg border border-border object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-text">
                                  {store.name}
                                </p>
                                <p className="truncate text-[11px] text-text-muted">
                                  /{store.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge
                              tone={
                                store.status === "live"
                                  ? "positive"
                                  : store.status === "draft"
                                    ? "warning"
                                    : "neutral"
                              }
                            >
                              {store.status}
                            </Badge>
                          </td>
                          <td className="tabular text-right text-[13px] text-text">
                            {formatNumber(stats.orders)}
                          </td>
                          <td className="tabular text-right text-[13px] text-text">
                            {formatCurrency(stats.revenue)}
                          </td>
                          <td className="tabular text-right text-[13px] text-text-secondary">
                            {formatPercent(stats.conversionRate, 2)}
                          </td>
                          <td className="pl-3 text-right">
                            <Button asChild variant="secondary" size="sm">
                              <Link href={`/stores?store=${store.id}`}>
                                Manage store
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recent activity */}
        <section className="col-span-12 xl:col-span-5">
          <div className="flex h-full flex-col rounded-card border border-border bg-surface">
            <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <h3 className="text-card font-semibold text-text">
                  Recent activity
                </h3>
                <p className="mt-1 text-secondary text-text-secondary">
                  Everything recorded in this workspace.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 px-5 pb-5 sm:px-6">
              {!hydrated ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-border px-4 py-8 text-center text-secondary text-text-muted">
                  No activity recorded yet.
                </p>
              ) : (
                activity.map((item) => {
                  const Icon = ACTIVITY_ICON[item.eventType] ?? LayoutGrid;
                  return (
                    <Link
                      key={item.id}
                      href={item.href ?? "/dashboard"}
                      className="flex items-start gap-3 rounded-[10px] px-2 py-2.5 transition-colors duration-150 hover:bg-elevated"
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-elevated">
                        <Icon className="size-3.5 text-text-secondary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-text">
                          {item.title}
                        </p>
                        <p className="truncate text-[11px] text-text-muted">
                          {item.description}
                        </p>
                      </div>
                      <RelativeTime
                        timestamp={item.timestamp}
                        className="shrink-0 text-[11px] text-text-muted"
                      />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="col-span-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-colors duration-150 hover:border-[#38414F]"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-elevated transition-colors group-hover:border-brand/30 group-hover:bg-brand/10">
                  <action.icon className="size-4 text-text-secondary transition-colors group-hover:text-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-text">
                    {action.label}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-secondary" />
              </Link>
            ))}
          </div>
        </section>

        <div className="col-span-12">
          <DemoNote>
            Every figure on this page is simulated sample data generated inside
            your browser. HUNT does not process payments, place advertising or
            collect live market signals in this milestone.
          </DemoNote>
        </div>
      </div>
    </>
  );
}
