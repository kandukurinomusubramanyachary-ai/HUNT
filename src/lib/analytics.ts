import type {
  AnalyticsSeriesPoint,
  AnalyticsSummary,
  Order,
  Store,
  StoreComparisonRow,
  TrafficRecord,
} from "@/types";
import { formatShortDate, isoDaysAgo, safeDivide } from "@/lib/utils";

/** Estimated payment processing fee: 2.9% + ₹25 per order. */
export const PAYMENT_FEE_RATE = 0.029;
export const PAYMENT_FEE_FIXED = 25;

export function rangeFor(days: number): DateRange {
  return {
    start: isoDaysAgo(days - 1),
    end: isoDaysAgo(0),
  };
}

export function previousRange(range: DateRange): DateRange {
  const start = new Date(`${range.start}T00:00:00.000Z`);
  const end = new Date(`${range.end}T00:00:00.000Z`);
  const spanDays =
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - (spanDays - 1));
  return {
    start: previousStart.toISOString().slice(0, 10),
    end: previousEnd.toISOString().slice(0, 10),
  };
}

export interface DateRange {
  /** inclusive ISO date (YYYY-MM-DD) */
  start: string;
  /** inclusive ISO date (YYYY-MM-DD) */
  end: string;
}

export function filterByDate<T extends { date?: string; createdAt?: string }>(
  records: T[],
  range: DateRange,
): T[] {
  return records.filter((record) => {
    const value = (record.date ?? record.createdAt ?? "").slice(0, 10);
    return value >= range.start && value <= range.end;
  });
}

export function filterTraffic(
  traffic: TrafficRecord[],
  storeIds: string[],
  range: DateRange,
): TrafficRecord[] {
  return traffic.filter(
    (record) =>
      storeIds.includes(record.storeId) &&
      record.date >= range.start &&
      record.date <= range.end,
  );
}

export function filterOrders(
  orders: Order[],
  storeIds: string[],
  range: DateRange,
): Order[] {
  return orders.filter(
    (order) =>
      storeIds.includes(order.storeId) &&
      order.status === "completed" &&
      order.createdAt.slice(0, 10) >= range.start &&
      order.createdAt.slice(0, 10) <= range.end,
  );
}

export interface CostLookup {
  /** productId -> estimated unit cost */
  (productId: string): number;
}

export function summarise(
  traffic: TrafficRecord[],
  orders: Order[],
  costOf: CostLookup,
): AnalyticsSummary {
  const completedOrders = orders.filter((order) => order.status === "completed");
  const visitors = traffic.reduce((sum, record) => sum + record.visitors, 0);
  const productViews = traffic.reduce(
    (sum, record) => sum + record.productViews,
    0,
  );
  const checkoutStarts = traffic.reduce(
    (sum, record) => sum + record.checkoutStarts,
    0,
  );
  const revenue = completedOrders.reduce((sum, order) => sum + Math.round(order.total * 100), 0) / 100;
  const orderCount = completedOrders.length;

  const estimatedProductCost = completedOrders.reduce(
    (sum, order) => sum + costOf(order.productId) * order.quantity,
    0,
  );
  const estimatedMarketingCost = traffic.reduce(
    (sum, record) => sum + record.adSpend,
    0,
  );
  const estimatedFees =
    revenue * PAYMENT_FEE_RATE + orderCount * PAYMENT_FEE_FIXED;

  const grossProfit = revenue - estimatedProductCost;
  const netProfit = grossProfit - estimatedMarketingCost - estimatedFees;

  return {
    visitors,
    productViews,
    checkoutStarts,
    orders: orderCount,
    revenue,
    conversionRate: safeDivide(orderCount, visitors) * 100,
    checkoutCompletionRate: safeDivide(orderCount, checkoutStarts) * 100,
    checkoutRate: safeDivide(checkoutStarts, visitors) * 100,
    averageOrderValue: Math.round(safeDivide(revenue, orderCount) * 100) / 100,
    grossProfit,
    netProfit,
    estimatedProductCost,
    estimatedMarketingCost,
    estimatedFees,
  };
}

function monthShortLabel(iso: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const index = Number(iso.slice(5, 7)) - 1;
  return months[index] ?? "—";
}

export function buildSeries(
  traffic: TrafficRecord[],
  orders: Order[],
  range: DateRange,
  bucket: "day" | "week" | "month",
): AnalyticsSeriesPoint[] {
  const map = new Map<string, AnalyticsSeriesPoint>();

  const keyFor = (iso: string) => {
    if (bucket === "day") return iso;
    if (bucket === "month") return `${iso.slice(0, 7)}-01`;
    const date = new Date(`${iso}T00:00:00.000Z`);
    const day = date.getUTCDay();
    const diff = (day + 6) % 7;
    date.setUTCDate(date.getUTCDate() - diff);
    return date.toISOString().slice(0, 10);
  };

  const ensure = (key: string) => {
    let point = map.get(key);
    if (!point) {
      point = {
        date: key,
        label:
          bucket === "month"
            ? monthShortLabel(key)
            : formatShortDate(key),
        visitors: 0,
        orders: 0,
        revenue: 0,
      };
      map.set(key, point);
    }
    return point;
  };

  filterByDate(traffic, range).forEach((record) => {
    const point = ensure(keyFor(record.date));
    point.visitors += record.visitors;
  });

  filterByDate(orders, range).filter((order) => order.status === "completed").forEach((order) => {
    const point = ensure(keyFor(order.createdAt.slice(0, 10)));
    point.orders += 1;
    point.revenue = Math.round((point.revenue + order.total) * 100) / 100;
  });

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildComparison(
  stores: Store[],
  traffic: TrafficRecord[],
  orders: Order[],
  range: DateRange,
  costOf: CostLookup,
): StoreComparisonRow[] {
  return stores
    .map((store) => {
      const storeTraffic = filterTraffic(traffic, [store.id], range);
      const storeOrders = filterOrders(orders, [store.id], range);
      const summary = summarise(storeTraffic, storeOrders, costOf);
      return {
        storeId: store.id,
        storeName: store.name,
        status: store.status,
        visitors: summary.visitors,
        orders: summary.orders,
        revenue: summary.revenue,
        conversionRate: summary.conversionRate,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/** Percentage change between two periods, guarding against zero baselines. */
export function changePct(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}
