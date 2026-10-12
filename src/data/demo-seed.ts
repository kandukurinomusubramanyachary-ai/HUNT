import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateDemoCreative } from "@/lib/services/creatives";
import { buildStore, defaultContent } from "@/lib/services/store-builder";
import { createRandom, isoDaysAgo, randomInt, uid } from "@/lib/utils";
import type {
  ActivityEvent,
  Creative,
  Order,
  Store,
  TrafficRecord,
  WalletTransaction,
} from "@/types";

/**
 * Deterministic demo seed.
 *
 * Everything here is fabricated sample data used to make the product
 * walkable without a backend. Traffic, orders, wallet transactions and
 * activity are generated from the same record set, so every screen agrees
 * with every other screen.
 */

const TRAFFIC_WINDOW_DAYS = 180;

interface StoreSeedConfig {
  key: string;
  productId: string;
  name: string;
  slug: string;
  tagline: string;
  accentColor: string;
  visualStyle: "minimal" | "premium" | "lifestyle";
  status: "live" | "draft" | "paused";
  createdDaysAgo: number;
  baseVisitors: number;
  growth: number;
}

const STORE_SEEDS: StoreSeedConfig[] = [
  {
    key: "aurora",
    productId: "aurora-rest",
    name: "Aurora Sleep",
    slug: "aurora-sleep",
    tagline: "Sleep deeper, wake up clearer",
    accentColor: "#A3E635",
    visualStyle: "premium",
    status: "live",
    createdDaysAgo: 118,
    baseVisitors: 118,
    growth: 0.55,
  },
  {
    key: "nomad",
    productId: "nomad-pour",
    name: "Nomad Coffee Co.",
    slug: "nomad-coffee-co",
    tagline: "Serious coffee, anywhere you land",
    accentColor: "#60A5FA",
    visualStyle: "lifestyle",
    status: "live",
    createdDaysAgo: 74,
    baseVisitors: 86,
    growth: 0.32,
  },
  {
    key: "verdant",
    productId: "verdant-one",
    name: "Verdant Studio",
    slug: "verdant-studio",
    tagline: "Plants that survive your schedule",
    accentColor: "#34D399",
    visualStyle: "minimal",
    status: "draft",
    createdDaysAgo: 6,
    baseVisitors: 0,
    growth: 0,
  },
];

export interface DemoSeed {
  stores: Store[];
  orders: Order[];
  traffic: TrafficRecord[];
  transactions: WalletTransaction[];
  activities: ActivityEvent[];
  creatives: Creative[];
  savedProductIds: string[];
}

function isoWithTime(dateIso: string, hour: number, minute: number): string {
  return `${dateIso}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}:00.000Z`;
}

function daysInRange(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${startIso}T00:00:00.000Z`);
  const end = new Date(`${endIso}T00:00:00.000Z`);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function buildTraffic(store: Store, config: StoreSeedConfig): TrafficRecord[] {
  if (config.status !== "live") return [];
  const random = createRandom(`${store.id}-traffic`);
  const days = Math.min(TRAFFIC_WINDOW_DAYS, config.createdDaysAgo);
  const startIso = isoDaysAgo(days - 1);
  const endIso = isoDaysAgo(1);
  const dates = daysInRange(startIso, endIso);
  const total = Math.max(dates.length - 1, 1);

  return dates.map((date, index) => {
    const dow = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 1.16 : 1;
    const trend = 1 + (index / total) * config.growth;
    const noise = 0.78 + random() * 0.44;
    const visitors = Math.max(
      8,
      Math.round(config.baseVisitors * trend * weekend * noise),
    );
    const productViews = Math.round(visitors * (0.54 + random() * 0.14));
    const checkoutStarts = Math.round(visitors * (0.055 + random() * 0.035));
    const adSpend = Math.round(visitors * (4.2 + random() * 3.1));
    return {
      id: `${store.id}-traffic-${date}`,
      storeId: store.id,
      date,
      visitors,
      productViews,
      checkoutStarts,
      adSpend,
      isDemo: true,
    };
  });
}

function buildOrders(
  store: Store,
  config: StoreSeedConfig,
  traffic: TrafficRecord[],
): { orders: Order[]; transactions: WalletTransaction[] } {
  const orders: Order[] = [];
  const transactions: WalletTransaction[] = [];
  if (config.status !== "live") return { orders, transactions };

  const random = createRandom(`${store.id}-orders`);
  let counter = 0;

  traffic.forEach((record) => {
    const expected = record.checkoutStarts * (0.22 + random() * 0.12);
    let count = Math.floor(expected);
    if (random() < expected - count) count += 1;

    for (let i = 0; i < count; i += 1) {
      counter += 1;
      const roll = random();
      const quantity = roll < 0.66 ? 1 : roll < 0.92 ? 2 : 3;
      const total = quantity * store.price;
      const createdAt = isoWithTime(
        record.date,
        randomInt(random, 7, 22),
        randomInt(random, 0, 59),
      );
      const orderId = `${store.id}-order-${String(counter).padStart(4, "0")}`;
      orders.push({
        id: orderId,
        storeId: store.id,
        storeName: store.name,
        productId: store.productId,
        quantity,
        unitPrice: store.price,
        total,
        status: "completed",
        isDemo: true,
        createdAt,
      });
      transactions.push({
        id: `${orderId}-txn`,
        storeId: store.id,
        storeName: store.name,
        description: `Demo sale credit · ${store.productName} × ${quantity}`,
        type: "sale-credit",
        amount: total,
        status: "settled",
        timestamp: createdAt,
        isDemo: true,
      });
    }
  });

  return { orders, transactions };
}

function buildRecurringTransactions(
  store: Store,
  config: StoreSeedConfig,
): WalletTransaction[] {
  if (config.status !== "live") return [];
  const transactions: WalletTransaction[] = [];
  const random = createRandom(`${store.id}-spend`);
  const days = config.createdDaysAgo;

  for (let offset = days - 1; offset >= 0; offset -= 7) {
    const date = isoDaysAgo(offset);
    const amount = randomInt(random, 2600, 6400);
    transactions.push({
      id: `${store.id}-ad-${date}`,
      storeId: store.id,
      storeName: store.name,
      description: "Simulated marketing spend · Meta prospecting",
      type: "marketing-debit",
      amount,
      status: offset > 2 ? "settled" : "pending",
      timestamp: isoWithTime(date, 9, 0),
      isDemo: true,
    });
  }

  for (let offset = days - 1; offset >= 0; offset -= 30) {
    const date = isoDaysAgo(offset);
    transactions.push({
      id: `${store.id}-ops-${date}`,
      storeId: store.id,
      storeName: store.name,
      description: "Simulated operating expense · storefront platform fee",
      type: "operating-debit",
      amount: 1999,
      status: "settled",
      timestamp: isoWithTime(date, 6, 30),
      isDemo: true,
    });
  }

  return transactions;
}

export function buildDemoSeed(): DemoSeed {
  const stores: Store[] = [];
  const orders: Order[] = [];
  const traffic: TrafficRecord[] = [];
  const transactions: WalletTransaction[] = [];

  STORE_SEEDS.forEach((config) => {
    const product =
      DEMO_PRODUCTS.find((item) => item.id === config.productId) ??
      DEMO_PRODUCTS[0];
    const content = defaultContent(product, config.visualStyle);
    const store = buildStore({
      product,
      branding: {
        storeName: config.name,
        slug: config.slug,
        tagline: config.tagline,
        accentColor: config.accentColor,
        visualStyle: config.visualStyle,
      },
      content: {
        ...content,
        heroHeadline: config.tagline,
      },
      status: config.status,
    });
    store.id = `store-${config.key}`;
    store.createdAt = isoWithTime(isoDaysAgo(config.createdDaysAgo), 10, 15);
    store.isDemo = true;

    const storeTraffic = buildTraffic(store, config);
    const storeOrders = buildOrders(store, config, storeTraffic);

    stores.push(store);
    traffic.push(...storeTraffic);
    orders.push(...storeOrders.orders);
    transactions.push(
      ...storeOrders.transactions,
      ...buildRecurringTransactions(store, config),
    );
  });

  const activities: ActivityEvent[] = [
    {
      id: uid("act"),
      storeId: stores[0]?.id,
      eventType: "store-created",
      title: "Aurora Sleep store launched",
      description: "Storefront created from the Aurora Rest opportunity.",
      timestamp: stores[0]?.createdAt ?? new Date().toISOString(),
      isDemo: true,
    },
    {
      id: uid("act"),
      storeId: stores[1]?.id,
      eventType: "store-created",
      title: "Nomad Coffee Co. store launched",
      description: "Storefront created from the Nomad Pour opportunity.",
      timestamp: stores[1]?.createdAt ?? new Date().toISOString(),
      isDemo: true,
    },
    {
      id: uid("act"),
      eventType: "product-discovered",
      title: "Aurora Rest added to the opportunity radar",
      description: "Sample interest up 207% across the tracked 12-week window.",
      timestamp: isoWithTime(isoDaysAgo(2), 8, 12),
      isDemo: true,
    },
    {
      id: uid("act"),
      eventType: "creative-generated",
      title: "Instagram creative generated for Aurora Rest",
      description: "Three headline variants and a 15-second storyboard.",
      timestamp: isoWithTime(isoDaysAgo(1), 16, 40),
      isDemo: true,
    },
    {
      id: uid("act"),
      eventType: "product-discovered",
      title: "FetchLoop flagged as declining",
      description: "Sample interest fell in ten of the last eleven weeks.",
      timestamp: isoWithTime(isoDaysAgo(3), 11, 5),
      isDemo: true,
    },
  ];

  const creatives: Creative[] = [];
  const creativeConfigs = [
    { productId: "aurora-rest", platform: "instagram", format: "video", tone: "Premium" },
    { productId: "nomad-pour", platform: "tiktok", format: "static", tone: "Confident" },
    { productId: "verdant-one", platform: "pinterest", format: "carousel", tone: "Friendly" },
  ] as const;

  creativeConfigs.forEach((config, index) => {
    const product = DEMO_PRODUCTS.find((item) => item.id === config.productId);
    if (!product) return;
    const creative = generateDemoCreative(product, {
      platform: config.platform,
      format: config.format,
      objective: OBJECTIVE_BY_INDEX[index % OBJECTIVE_BY_INDEX.length],
      audience: AUDIENCE_BY_PRODUCT[config.productId] ?? "Broad interest",
      tone: config.tone,
      variant: index,
    });
    creative.id = `creative-seed-${index + 1}`;
    creative.createdAt = isoWithTime(isoDaysAgo(index + 1), 14, 20);
    creatives.push(creative);
  });

  return {
    stores,
    orders,
    traffic,
    transactions,
    activities,
    creatives,
    savedProductIds: ["aurora-rest", "verdant-one"],
  };
}

const OBJECTIVE_BY_INDEX = ["Conversion", "Traffic", "Awareness"];

const AUDIENCE_BY_PRODUCT: Record<string, string> = {
  "aurora-rest": "Side sleepers 25–45",
  "nomad-pour": "Frequent travellers",
  "verdant-one": "New homeowners",
};
