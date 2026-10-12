"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { buildDemoSeed } from "@/data/demo-seed";
import { buildStore } from "@/lib/services/store-builder";
import { clamp, slugify, uid } from "@/lib/utils";
import type {
  ActivityEvent,
  Creative,
  Order,
  Product,
  Store,
  StoreBranding,
  StoreContent,
  StoreStatus,
  TrafficRecord,
  WalletTransaction,
} from "@/types";

/**
 * Centralised frontend application state.
 *
 * Milestone 1 has no backend, so this store *is* the system of record.
 * Every screen reads and writes through the service functions in
 * `src/lib/services`, which means swapping in real API calls later should not
 * require changes in the UI layer.
 */

export interface CartItem {
  storeId: string;
  productId: string;
  quantity: number;
}

export type AnalyticsRangeKey = "7d" | "30d" | "90d";

interface HuntState {
  hydrated: boolean;

  stores: Store[];
  orders: Order[];
  traffic: TrafficRecord[];
  transactions: WalletTransaction[];
  activities: ActivityEvent[];
  creatives: Creative[];
  savedProductIds: string[];

  cart: CartItem[];
  reinvestmentPct: number;
  sidebarCollapsed: boolean;
  defaultRange: AnalyticsRangeKey;

  // Lifecycle
  markHydrated: () => void;
  resetDemo: () => void;

  // Preferences
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setDefaultRange: (range: AnalyticsRangeKey) => void;
  setReinvestmentPct: (pct: number) => void;

  // Products
  toggleSavedProduct: (productId: string) => void;

  // Stores
  createStore: (input: {
    product: Product;
    branding: StoreBranding;
    content: StoreContent;
    status?: StoreStatus;
  }) => Store;
  updateStore: (storeId: string, patch: Partial<Store>) => void;
  setStoreStatus: (storeId: string, status: StoreStatus) => void;
  duplicateStore: (storeId: string) => Store | undefined;
  deleteStore: (storeId: string) => void;

  // Cart + orders
  addToCart: (storeId: string, productId: string, quantity?: number) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createDemoOrder: (input: {
    storeId: string;
    quantity: number;
    customerName: string;
  }) => Order | undefined;

  // Creatives
  saveCreative: (creative: Creative) => void;
  deleteCreative: (creativeId: string) => void;

  // Activity
  pushActivity: (event: Omit<ActivityEvent, "id" | "timestamp"> & {
    timestamp?: string;
  }) => void;
}

const seed = buildDemoSeed();

const initialState = {
  stores: seed.stores,
  orders: seed.orders,
  traffic: seed.traffic,
  transactions: seed.transactions,
  activities: seed.activities,
  creatives: seed.creatives,
  savedProductIds: seed.savedProductIds,
  cart: [] as CartItem[],
  reinvestmentPct: 30,
  sidebarCollapsed: false,
  defaultRange: "30d" as AnalyticsRangeKey,
};

export const useHuntStore = create<HuntState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialState,

      markHydrated: () => set({ hydrated: true }),

      resetDemo: () => {
        const fresh = buildDemoSeed();
        set({
          stores: fresh.stores,
          orders: fresh.orders,
          traffic: fresh.traffic,
          transactions: fresh.transactions,
          activities: fresh.activities,
          creatives: fresh.creatives,
          savedProductIds: fresh.savedProductIds,
          cart: [],
          reinvestmentPct: 30,
        });
      },

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setDefaultRange: (range) => set({ defaultRange: range }),
      setReinvestmentPct: (pct) => set({ reinvestmentPct: clamp(pct, 0, 100) }),

      toggleSavedProduct: (productId) =>
        set((state) => ({
          savedProductIds: state.savedProductIds.includes(productId)
            ? state.savedProductIds.filter((id) => id !== productId)
            : [...state.savedProductIds, productId],
        })),

      createStore: ({ product, branding, content, status }) => {
        const store = buildStore({ product, branding, content, status });
        set((state) => ({ stores: [store, ...state.stores] }));
        get().pushActivity({
          storeId: store.id,
          eventType: "store-created",
          title: `${store.name} store created`,
          description: `Storefront built from the ${product.name} opportunity.`,
          isDemo: store.isDemo,
        });
        return store;
      },

      updateStore: (storeId, patch) =>
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? { ...store, ...patch } : store,
          ),
        })),

      setStoreStatus: (storeId, status) =>
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? { ...store, status } : store,
          ),
        })),

      duplicateStore: (storeId) => {
        const source = get().stores.find((store) => store.id === storeId);
        if (!source) return undefined;
        const existingSlugs = new Set(get().stores.map((store) => store.slug));
        let slug = `${source.slug}-copy`;
        let index = 2;
        while (existingSlugs.has(slug)) {
          slug = `${source.slug}-copy-${index}`;
          index += 1;
        }
        const copy: Store = {
          ...source,
          id: uid("store"),
          slug,
          name: `${source.name} copy`,
          branding: { ...source.branding, slug, storeName: `${source.name} copy` },
          content: {
            ...source.content,
            benefits: [...source.content.benefits],
            highlights: [...source.content.highlights],
            faqs: source.content.faqs.map((faq) => ({ ...faq })),
          },
          status: "draft",
          createdAt: new Date().toISOString(),
          isDemo: source.isDemo,
        };
        set((state) => ({ stores: [copy, ...state.stores] }));
        get().pushActivity({
          storeId: copy.id,
          eventType: "store-created",
          title: `${copy.name} duplicated`,
          description: `Copied from ${source.name} as a draft.`,
          isDemo: copy.isDemo,
        });
        return copy;
      },

      deleteStore: (storeId) =>
        set((state) => ({
          stores: state.stores.filter((store) => store.id !== storeId),
          orders: state.orders.filter((order) => order.storeId !== storeId),
          traffic: state.traffic.filter(
            (record) => record.storeId !== storeId,
          ),
          transactions: state.transactions.filter(
            (txn) => txn.storeId !== storeId,
          ),
          cart: state.cart.filter((item) => item.storeId !== storeId),
        })),

      addToCart: (storeId, productId, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.storeId === storeId && item.productId === productId,
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.storeId === storeId && item.productId === productId
                  ? { ...item, quantity: clamp(item.quantity + quantity, 1, 99) }
                  : item,
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              { storeId, productId, quantity: clamp(quantity, 1, 99) },
            ],
          };
        }),

      setCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((item) => item.productId !== productId)
              : state.cart.map((item) =>
                  item.productId === productId
                    ? { ...item, quantity: clamp(quantity, 1, 99) }
                    : item,
                ),
        })),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        })),

      clearCart: () => set({ cart: [] }),

      createDemoOrder: ({ storeId, quantity, customerName }) => {
        const store = get().stores.find((item) => item.id === storeId);
        if (!store) return undefined;
        const qty = clamp(Math.round(quantity), 1, 99);
        const total = Math.round(qty * store.price * 100) / 100;
        const now = new Date().toISOString();
        const orderId = uid("order");

        const order: Order = {
          id: orderId,
          storeId: store.id,
          storeName: store.name,
          productId: store.productId,
          quantity: qty,
          unitPrice: store.price,
          total,
          status: "completed",
          isDemo: true,
          customerName: customerName.trim() || "Demo customer",
          createdAt: now,
        };

        const transaction: WalletTransaction = {
          id: `${orderId}-txn`,
          storeId: store.id,
          storeName: store.name,
          description: `Demo sale credit · ${store.productName} × ${qty}`,
          type: "sale-credit",
          amount: total,
          status: "pending",
          timestamp: now,
          isDemo: true,
        };

        set((state) => ({
          orders: [order, ...state.orders],
          transactions: [transaction, ...state.transactions],
          cart: state.cart.filter((item) => item.storeId !== storeId),
        }));

        get().pushActivity({
          storeId: store.id,
          eventType: "order-completed",
          title: `Demo order recorded · ${store.name}`,
          description: `${store.productName} × ${qty} — no payment was collected.`,
          isDemo: true,
          timestamp: now,
        });

        return order;
      },

      saveCreative: (creative) =>
        set((state) => {
          const exists = state.creatives.some(
            (item) => item.id === creative.id,
          );
          return {
            creatives: exists
              ? state.creatives.map((item) =>
                  item.id === creative.id ? creative : item,
                )
              : [creative, ...state.creatives],
          };
        }),

      deleteCreative: (creativeId) =>
        set((state) => ({
          creatives: state.creatives.filter(
            (creative) => creative.id !== creativeId,
          ),
        })),

      pushActivity: (event) =>
        set((state) => ({
          activities: [
            {
              ...event,
              id: uid("act"),
              timestamp: event.timestamp ?? new Date().toISOString(),
            },
            ...state.activities,
          ].slice(0, 120),
        })),
    }),
    {
      name: "hunt-frontend-state",
      version: 1,
      // Hydration is triggered manually after mount so server and first
      // client render always agree. See `StoreHydrator`.
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stores: state.stores,
        orders: state.orders,
        traffic: state.traffic,
        transactions: state.transactions,
        activities: state.activities,
        creatives: state.creatives,
        savedProductIds: state.savedProductIds,
        cart: state.cart,
        reinvestmentPct: state.reinvestmentPct,
        sidebarCollapsed: state.sidebarCollapsed,
        defaultRange: state.defaultRange,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

/** Non-reactive access for services. */
export const huntState = () => useHuntStore.getState();

export function isSlugAvailable(slug: string, stores: Store[]): boolean {
  const normalised = slugify(slug);
  return !stores.some((store) => store.slug === normalised);
}
