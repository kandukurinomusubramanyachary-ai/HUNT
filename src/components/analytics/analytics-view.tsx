"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Filter, Info } from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { useHydrated } from "@/components/layout/store-hydrator";
import { ConversionFunnel } from "@/components/shared/conversion-funnel";
import { DemoBadge, DemoNote } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/tabs";
import { Skeleton, SkeletonChart } from "@/components/ui/skeleton";
import {
  buildComparison,
  buildSeries,
  filterOrders,
  filterTraffic,
  previousRange,
  rangeFor,
  summarise,
} from "@/lib/analytics";
import { costLookup } from "@/lib/services/products";
import { useHuntStore, type AnalyticsRangeKey } from "@/store/hunt-store";
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

type MetricKey = "visitors" | "orders" | "revenue" | "conversion";

const METRICS: { value: MetricKey; label: string; color: string }[] = [
  { value: "revenue", label: "Simulated revenue", color: "#A3E635" },
  { value: "orders", label: "Simulated orders", color: "#34D399" },
  { value: "visitors", label: "Demo visitors", color: "#60A5FA" },
  { value: "conversion", label: "Conversion rate", color: "#C084FC" },
];

const RANGE_DAYS: Record<AnalyticsRangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export function AnalyticsView() {
  const searchParams = useSearchParams();
  const storeParam = searchParams.get("store");
  const hydrated = useHydrated();

  const stores = useHuntStore((state) => state.stores);
  const orders = useHuntStore((state) => state.orders);
  const traffic = useHuntStore((state) => state.traffic);
  const defaultRange = useHuntStore((state) => state.defaultRange);

  const [storeId, setStoreId] = React.useState<string>(
    storeParam ?? "all",
  );
  const [range, setRange] = React.useState<AnalyticsRangeKey>(defaultRange);
  const [metric, setMetric] = React.useState<MetricKey>("revenue");

  React.useEffect(() => {
    if (storeParam) setStoreId(storeParam);
  }, [storeParam]);

  const costOf = React.useMemo(() => costLookup(), []);

  const selectedIds = React.useMemo(() => {
    if (storeId === "all") return stores.map((store) => store.id);
    return [storeId];
  }, [storeId, stores]);

  const rangeDates = React.useMemo(() => rangeFor(RANGE_DAYS[range]), [range]);
  const previousDates = React.useMemo(
    () => previousRange(rangeDates),
    [rangeDates],
  );

  const summary = React.useMemo(
    () =>
      summarise(
        filterTraffic(traffic, selectedIds, rangeDates),
        filterOrders(orders, selectedIds, rangeDates),
        costOf,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [traffic, orders, selectedIds, rangeDates],
  );

  const previousSummary = React.useMemo(
    () =>
      summarise(
        filterTraffic(traffic, selectedIds, previousDates),
        filterOrders(orders, selectedIds, previousDates),
        costOf,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [traffic, orders, selectedIds, previousDates],
  );

  const series = React.useMemo(() => {
    const bucket = range === "7d" ? "day" : range === "30d" ? "day" : "week";
    return buildSeries(
      filterTraffic(traffic, selectedIds, rangeDates),
      filterOrders(orders, selectedIds, rangeDates),
      rangeDates,
      bucket,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traffic, orders, selectedIds, rangeDates, range]);

  const chartData = React.useMemo(
    () =>
      series.map((point) => ({
        label: point.label,
        visitors: point.visitors,
        orders: point.orders,
        revenue: point.revenue,
        conversion: point.visitors > 0 ? (point.orders / point.visitors) * 100 : 0,
      })),
    [series],
  );

  const comparison = React.useMemo(
    () => buildComparison(stores, traffic, orders, rangeDates, costOf),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stores, traffic, orders, rangeDates],
  );

  const activeMetric = METRICS.find((item) => item.value === metric)!;
  const changeFor = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

  return (
    <>
      <PageIntro
        title="Performance Analytics"
        subtitle="Measure every step from visitor to purchase."
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Performance" },
          { label: "Analytics" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <a href="/wallet">
              Open wallet
            </a>
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 rounded-card border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <Filter className="size-3.5" />
            Filters
          </span>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="h-9 w-[200px]" aria-label="Store">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={metric} onValueChange={(value) => setMetric(value as MetricKey)}>
            <SelectTrigger className="h-9 w-[190px]" aria-label="Metric">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SegmentedControl
          ariaLabel="Date range"
          value={range}
          onChange={setRange}
          size="sm"
          options={[
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "90d", label: "Last 90 days" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {!hydrated ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[120px] rounded-card" />
            ))
          ) : (
            <>
              <KpiCard
                label="Demo visitors"
                value={formatNumber(summary.visitors)}
                icon={Info}
                delta={changeFor(summary.visitors, previousSummary.visitors)}
                deltaLabel="vs prev"
              />
              <KpiCard
                label="Checkout starts"
                value={formatNumber(summary.checkoutStarts)}
                icon={Filter}
                delta={changeFor(
                  summary.checkoutStarts,
                  previousSummary.checkoutStarts,
                )}
                deltaLabel="vs prev"
                description={`Checkout completion rate: ${formatPercent(summary.checkoutCompletionRate, 2)} (completed orders ÷ checkout starts × 100)`}
              />
              <KpiCard
                label="Simulated orders"
                value={formatNumber(summary.orders)}
                icon={Info}
                delta={changeFor(summary.orders, previousSummary.orders)}
                deltaLabel="vs prev"
              />
              <KpiCard
                label="Simulated revenue"
                value={formatCompact(summary.revenue)}
                icon={Info}
                delta={changeFor(summary.revenue, previousSummary.revenue)}
                deltaLabel="vs prev"
                accent
              />
              <KpiCard
                label="Conversion rate"
                value={formatPercent(summary.conversionRate, 2)}
                icon={Info}
                delta={summary.conversionRate - previousSummary.conversionRate}
                deltaLabel="pts"
                description="Completed orders ÷ unique demo visitors × 100"
              />
              <KpiCard
                label="Average order value"
                value={formatCurrency(summary.averageOrderValue)}
                icon={Info}
                delta={changeFor(
                  summary.averageOrderValue,
                  previousSummary.averageOrderValue,
                )}
                deltaLabel="vs prev"
                description="Revenue ÷ orders"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="col-span-1 rounded-card border border-border bg-surface xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-card font-semibold text-text">
                    {activeMetric.label} over time
                  </h3>
                  <DemoBadge label="Simulated" />
                </div>
                <p className="mt-1 text-secondary text-text-secondary">
                  {range === "7d"
                    ? "Daily buckets"
                    : range === "30d"
                      ? "Daily buckets"
                      : "Weekly buckets"}{" "}
                  across the selected stores.
                </p>
              </div>
            </div>
            <div className="px-2 pb-5 sm:px-4">
              {!hydrated ? (
                <Skeleton className="mx-4 h-[260px]" />
              ) : (
                <div style={{ height: 280 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeMetric.color} stopOpacity={0.32} />
                          <stop offset="100%" stopColor={activeMetric.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1C222C" vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatNumber(v)} />
                      <Tooltip
                        cursor={{ stroke: "#38414F", strokeWidth: 1 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          return (
                            <div className="rounded-[8px] border border-border bg-elevated px-3 py-2 shadow-elevated">
                              <p className="text-[11px] text-text-muted">{label}</p>
                              {payload.map((entry) => (
                                <p
                                  key={String(entry.dataKey)}
                                  className="tabular text-[13px] font-semibold text-text"
                                >
                                  {String(entry.dataKey)}:{" "}
                                  {String(entry.dataKey) === "revenue"
                                    ? formatCurrency(Number(entry.value ?? 0))
                                    : String(entry.dataKey) === "conversion"
                                      ? formatPercent(Number(entry.value ?? 0), 2)
                                      : formatNumber(Number(entry.value ?? 0))}
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={metric}
                        stroke={activeMetric.color}
                        strokeWidth={2}
                        fill="url(#metricFill)"
                      />
                      {metric === "revenue" || metric === "conversion" ? (
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#F4F6FA"
                          strokeWidth={1.25}
                          strokeOpacity={0.45}
                          dot={false}
                        />
                      ) : null}
                      {metric === "visitors" ? (
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#A3E635"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      ) : null}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-card font-semibold text-text">
                Conversion funnel
              </h3>
              <DemoBadge label="Demo" />
            </div>
            <p className="mt-1 text-secondary text-text-secondary">
              Visitors through to completed demo orders.
            </p>
            <div className="mt-5">
              {!hydrated ? (
                <Skeleton className="h-[200px]" />
              ) : (
                <ConversionFunnel
                  productViews={summary.productViews}
                  checkoutStarts={summary.checkoutStarts}
                  orders={summary.orders}
                />
              )}
            </div>
            <div className="mt-5 rounded-[10px] border border-border bg-elevated/40 p-3.5">
              <p className="text-[12px] font-semibold text-text">
                Checkout completion rate
              </p>
              <p className="mt-1 text-[12px] leading-5 text-text-secondary">
                {formatPercent(
                  summary.checkoutCompletionRate,
                  1,
                )}{" "}
                of demo checkout sessions were completed.
              </p>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="col-span-1 rounded-card border border-border bg-surface xl:col-span-2">
            <div className="px-5 pb-4 pt-5 sm:px-6">
              <h3 className="text-card font-semibold text-text">
                Store comparison
              </h3>
              <p className="mt-1 text-secondary text-text-secondary">
                Same period, side by side.
              </p>
            </div>
            <div className="overflow-x-auto px-5 pb-5 sm:px-6">
              {!hydrated ? (
                <Skeleton className="h-[160px]" />
              ) : comparison.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-border px-4 py-8 text-center text-secondary text-text-muted">
                  No orders recorded for this period.
                </p>
              ) : (
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-[11px] font-medium text-text-muted">
                        Store
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                        Visitors
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                        Orders
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                        Revenue
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                        Conversion
                      </th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr
                        key={row.storeId}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-text">
                              {row.storeName}
                            </span>
                            <Badge tone="muted">{row.status}</Badge>
                          </div>
                        </td>
                        <td className="tabular text-right text-[13px] text-text">
                          {formatNumber(row.visitors)}
                        </td>
                        <td className="tabular text-right text-[13px] text-text">
                          {formatNumber(row.orders)}
                        </td>
                        <td className="tabular text-right text-[13px] text-text">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="tabular text-right text-[13px] text-text-secondary">
                          {formatPercent(row.conversionRate, 2)}
                        </td>
                        <td className="pl-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStoreId(row.storeId)}
                          >
                            Filter
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-card font-semibold text-text">
                Profit estimate
              </h3>
              <DemoBadge label="Estimated" />
            </div>
            <p className="mt-1 text-secondary text-text-secondary">
              Revenue minus estimated costs. No advertising attribution is
              implied.
            </p>
            <dl className="mt-5 flex flex-col gap-2.5">
              {[
                {
                  label: "Simulated revenue",
                  value: formatCurrency(summary.revenue),
                  tone: "text-text",
                },
                {
                  label: "Estimated product cost",
                  value: `− ${formatCurrency(summary.estimatedProductCost)}`,
                  tone: "text-text-secondary",
                },
                {
                  label: "Gross profit estimate",
                  value: formatCurrency(summary.grossProfit),
                  tone: "text-text",
                },
                {
                  label: "Estimated marketing cost",
                  value: `− ${formatCurrency(summary.estimatedMarketingCost)}`,
                  tone: "text-text-secondary",
                },
                {
                  label: "Estimated fees",
                  value: `− ${formatCurrency(summary.estimatedFees)}`,
                  tone: "text-text-secondary",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 text-[13px]"
                >
                  <dt className="text-text-muted">{row.label}</dt>
                  <dd className={`tabular font-medium ${row.tone}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <dt className="text-[13px] font-semibold text-text">
                  Net profit estimate
                </dt>
                <dd
                  className={`tabular text-[16px] font-semibold ${
                    summary.netProfit >= 0 ? "text-positive" : "text-negative"
                  }`}
                >
                  {formatCurrency(summary.netProfit)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[11px] leading-4 text-text-muted">
              Estimated fees assume 2.9% + ₹25 per order. Marketing cost is the
              simulated daily spend attached to each traffic record.
            </p>
          </section>
        </div>

        {hydrated && summary.orders === 0 ? (
          <EmptyState
            icon={Info}
            title="No orders recorded for this period."
            description="Complete a demo checkout on one of your storefronts, or widen the date range to see earlier activity."
          />
        ) : null}

        <DemoNote>
          Every figure is derived from demo order and traffic records persisted
          in SQLite. Visitors are deduplicated per browser session, store and day.
          No advertising attribution or return-on-ad-spend is shown
          because no real campaigns are running.
        </DemoNote>
      </div>
    </>
  );
}
