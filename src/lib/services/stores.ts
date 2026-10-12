import { useHuntStore } from "@/store/hunt-store";
import {
  defaultBranding,
  defaultContent,
  validateBranding,
  validatePrice,
  validateStoreContent,
} from "@/lib/services/store-builder";
import { getProductById } from "@/lib/services/products";
import { safeDivide } from "@/lib/utils";
import type { Product, Store, StoreStatus, VisualStyle } from "@/types";

/**
 * Store service — backend-ready data access for storefronts.
 * Reads and writes the centralised frontend store. Swapping these bodies for
 * `fetch()` calls later should not require UI changes.
 */

export function getStores(): Store[] {
  return useHuntStore.getState().stores;
}

export function getStoreById(storeId: string): Store | undefined {
  return getStores().find((store) => store.id === storeId);
}

export function getStoreBySlug(slug: string): Store | undefined {
  return getStores().find((store) => store.slug === slug);
}

export function getProductForStore(store: Store): Product | undefined {
  return getProductById(store.productId);
}

export interface StoreStats {
  orders: number;
  revenue: number;
  visitors: number;
  conversionRate: number;
}

export function getStoreStats(storeId: string): StoreStats {
  const state = useHuntStore.getState();
  const orders = state.orders.filter(
    (order) => order.storeId === storeId && order.status !== "refunded",
  );
  const visitors = state.traffic
    .filter((record) => record.storeId === storeId)
    .reduce((sum, record) => sum + record.visitors, 0);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  return {
    orders: orders.length,
    revenue,
    visitors,
    conversionRate: safeDivide(orders.length, visitors) * 100,
  };
}

export interface CreateStoreInput {
  product: Product;
  storeName: string;
  slug: string;
  tagline: string;
  accentColor: string;
  visualStyle: VisualStyle;
  price: number;
  content: Store["content"];
  status?: StoreStatus;
}

export interface CreateStoreResult {
  ok: boolean;
  store?: Store;
  errors?: Record<string, string>;
}

export function createStore(input: CreateStoreInput): CreateStoreResult {
  const branding = {
    storeName: input.storeName.trim(),
    slug: input.slug.trim(),
    tagline: input.tagline.trim(),
    accentColor: input.accentColor,
    visualStyle: input.visualStyle,
  };

  const errors: Record<string, string> = {};

  Object.entries(validateBranding(branding, getStores())).forEach(
    ([key, value]) => {
      if (value) errors[key] = value;
    },
  );

  Object.entries(validateStoreContent(input.content)).forEach(([key, value]) => {
    if (value) errors[key] = value;
  });

  const priceError = validatePrice(input.price);
  if (priceError) errors.price = priceError;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const store = useHuntStore.getState().createStore({
    product: { ...input.product, price: input.price },
    branding,
    content: input.content,
    status: input.status ?? "live",
  });

  return { ok: true, store };
}

export function updateStore(storeId: string, patch: Partial<Store>): void {
  useHuntStore.getState().updateStore(storeId, patch);
}

export function setStoreStatus(storeId: string, status: StoreStatus): void {
  useHuntStore.getState().setStoreStatus(storeId, status);
}

export function duplicateStore(storeId: string): Store | undefined {
  return useHuntStore.getState().duplicateStore(storeId);
}

export function deleteStore(storeId: string): void {
  useHuntStore.getState().deleteStore(storeId);
}

export function slugTaken(slug: string, ignoreStoreId?: string): boolean {
  return getStores().some(
    (store) => store.slug === slug && store.id !== ignoreStoreId,
  );
}

/** Everything the builder needs to prefill itself from a product. */
export function buildDraftForProduct(
  product: Product,
  style: VisualStyle = "minimal",
) {
  return {
    branding: defaultBranding(product, style),
    content: defaultContent(product, style),
  };
}
