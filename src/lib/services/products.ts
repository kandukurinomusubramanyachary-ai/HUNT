import { intelligenceToProduct } from './intelligence-adapter';
import type { IntelligenceOpportunity } from '@/types/intelligence';
const liveProducts = new Map<string, Product>();
export function registerLiveProduct(p: IntelligenceOpportunity) { liveProducts.set(p.id, intelligenceToProduct(p)); }

import { DEMO_PRODUCTS, PRODUCT_CATEGORIES } from "@/data/demo-products";
import { useHuntStore } from "@/store/hunt-store";
import { safeDivide } from "@/lib/utils";
import type { CompetitionLevel, DataSourceType, Product } from "@/types";

/**
 * Product service.
 *
 * Fixtures are sample data shipped with the frontend — these functions are the
 * only way the UI should reach them.
 */

export type ProductSort =
  | "score"
  | "growth"
  | "margin"
  | "price-asc"
  | "price-desc"
  | "competition";

export interface ProductFilter {
  query?: string;
  categories?: string[];
  sources?: DataSourceType[];
  competition?: CompetitionLevel[];
  sort?: ProductSort;
}

const COMPETITION_ORDER: Record<CompetitionLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export { PRODUCT_CATEGORIES };

export function getProducts(): Product[] {
  return [...DEMO_PRODUCTS, ...Array.from(liveProducts.values())];
}

export function getProductById(productId: string): Product | undefined {
  return liveProducts.get(productId) ?? DEMO_PRODUCTS.find((product) => product.id === productId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return DEMO_PRODUCTS.find((product) => product.slug === slug);
}

export function getSavedProductIds(): string[] {
  return useHuntStore.getState().savedProductIds;
}

export function isProductSaved(productId: string): boolean {
  return getSavedProductIds().includes(productId);
}

export function toggleSavedProduct(productId: string): void {
  useHuntStore.getState().toggleSavedProduct(productId);
}

export function getSavedProducts(): Product[] {
  const ids = getSavedProductIds();
  return [...DEMO_PRODUCTS, ...Array.from(liveProducts.values())].filter((product) => ids.includes(product.id));
}

export function grossMargin(product: Product): number {
  return product.price - product.estimatedCost;
}

export function marginPct(product: Product): number {
  return safeDivide(grossMargin(product), product.price) * 100;
}

export function filterProducts(filter: ProductFilter): Product[] {
  const query = (filter.query ?? "").trim().toLowerCase();
  const categories = filter.categories ?? [];
  const sources = filter.sources ?? [];
  const competition = filter.competition ?? [];
  const sort = filter.sort ?? "score";

  const result = DEMO_PRODUCTS.filter((product) => {
    if (
      query &&
      !`${product.name} ${product.tagline} ${product.category}`
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    if (categories.length > 0 && !categories.includes(product.category)) {
      return false;
    }
    if (
      sources.length > 0 &&
      !product.sources.some((source) => sources.includes(source))
    ) {
      return false;
    }
    if (
      competition.length > 0 &&
      !competition.includes(product.competitionLevel)
    ) {
      return false;
    }
    return true;
  });

  const sorted = [...result];
  switch (sort) {
    case "growth":
      sorted.sort((a, b) => b.growthPct - a.growthPct);
      break;
    case "margin":
      sorted.sort((a, b) => marginPct(b) - marginPct(a));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "competition":
      sorted.sort(
        (a, b) =>
          COMPETITION_ORDER[a.competitionLevel] -
          COMPETITION_ORDER[b.competitionLevel],
      );
      break;
    default:
      sorted.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }
  return sorted;
}

export function getTopOpportunities(limit = 3): Product[] {
  return [...DEMO_PRODUCTS]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, limit);
}

export function scoreBand(score: number): {
  label: string;
  tone: "strong" | "promising" | "moderate" | "weak";
  color: string;
} {
  if (score >= 80)
    return { label: "Strong opportunity", tone: "strong", color: "#A3E635" };
  if (score >= 60)
    return { label: "Promising", tone: "promising", color: "#34D399" };
  if (score >= 40)
    return { label: "Moderate", tone: "moderate", color: "#60A5FA" };
  return { label: "Weak", tone: "weak", color: "#FB7185" };
}

/** Estimated unit cost lookup used by the analytics engine. */
export function costLookup(): (productId: string) => number {
  const map = new Map<string, number>();
  DEMO_PRODUCTS.forEach((product) => {
    map.set(product.id, product.estimatedCost);
  });
  return (productId: string) => map.get(productId) ?? 0;
}

export function grossProfitFor(orders: { productId: string; quantity: number }[]) {
  const costOf = costLookup();
  return orders.reduce(
    (sum, order) => sum + costOf(order.productId) * order.quantity,
    0,
  );
}
