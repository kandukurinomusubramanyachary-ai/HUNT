import { getProducts } from "@/lib/services/products";
import { costLookup } from "@/lib/services/products";
import { previousRange, rangeFor, summarise, type DateRange } from "@/lib/analytics";
import { useHuntStore } from "@/store/hunt-store";
import { safeDivide } from "@/lib/utils";

/**
 * Dashboard service — KPI maths shared by the command center.
 * Every figure is computed from the same order and traffic records used
 * elsewhere, so no screen invents its own numbers.
 */

export interface DashboardKpis {
  productsDiscovered: number;
  productsDiscoveredChange: number;
  activeStores: number;
  activeStoresChange: number;
  revenue: number;
  revenueChange: number;
  conversionRate: number;
  conversionRateChange: number;
  range: DateRange;
}

export function getDashboardKpis(days = 30): DashboardKpis {
  const state = useHuntStore.getState();
  const costOf = costLookup();
  const range = rangeFor(days);
  const previous = previousRange(range);

  const inRange = <T extends { date?: string; createdAt?: string }>(
    records: T[],
    target: DateRange,
  ) =>
    records.filter((record) => {
      const value = (record.date ?? record.createdAt ?? "").slice(0, 10);
      return value >= target.start && value <= target.end;
    });

  const currentTraffic = inRange(state.traffic, range);
  const previousTraffic = inRange(state.traffic, previous);
  const currentOrders = inRange(state.orders, range).filter(
    (order) => order.status === "completed",
  );
  const previousOrders = inRange(state.orders, previous).filter(
    (order) => order.status === "completed",
  );

  const current = summarise(currentTraffic, currentOrders, costOf);
  const prior = summarise(previousTraffic, previousOrders, costOf);

  const products = getProducts();
  const savedCount = state.savedProductIds.length;

  const activeStores = state.stores.filter(
    (store) => store.status === "live",
  ).length;
  const storesCreatedInRange = state.stores.filter((store) => {
    const value = store.createdAt.slice(0, 10);
    return value >= range.start && value <= range.end;
  }).length;

  return {
    productsDiscovered: products.length,
    productsDiscoveredChange: 0,
    activeStores,
    activeStoresChange: storesCreatedInRange,
    revenue: current.revenue,
    revenueChange:
      prior.revenue === 0
        ? current.revenue > 0
          ? 100
          : 0
        : ((current.revenue - prior.revenue) / prior.revenue) * 100,
    conversionRate: current.conversionRate,
    conversionRateChange:
      prior.conversionRate === 0
        ? 0
        : current.conversionRate - prior.conversionRate,
    range,
  };
}

export function getSavedCount(): number {
  return useHuntStore.getState().savedProductIds.length;
}

export function getTotalOrders(): number {
  return useHuntStore.getState().orders.filter(
    (order) => order.status === "completed",
  ).length;
}

export function getBlendedConversion(): number {
  const state = useHuntStore.getState();
  const visitors = state.traffic.reduce(
    (sum, record) => sum + record.visitors,
    0,
  );
  const orders = state.orders.filter((order) => order.status === "completed");
  return safeDivide(orders.length, visitors) * 100;
}
