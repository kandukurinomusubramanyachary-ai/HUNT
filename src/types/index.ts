/**
 * HUNT — shared domain types.
 * These mirror the future API contracts. Milestone 1 is frontend-only,
 * so every record that is not created by the user is flagged `isDemo`.
 */

export type DataSourceType =
  | "google-trends"
  | "reddit"
  | "social-signals"
  | "competitor-research";

export type CompetitionLevel = "low" | "medium" | "high";

export type TrendDirection = "up" | "down" | "flat";

export interface TrendPoint {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Normalised search / demand interest, 0-100 */
  value: number;
}

export interface EvidenceItem {
  id: string;
  source: DataSourceType;
  /** Human readable source label, e.g. r/BuyItForLife */
  label: string;
  title: string;
  snippet: string;
  /** External reference. Sample references are illustrative only. */
  url: string;
  sentiment?: "positive" | "neutral" | "negative";
  signal?: string;
}

export interface Competitor {
  id: string;
  name: string;
  price: number;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  adReference: string;
  channel: string;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  mentions: number;
  painPoints: string[];
  benefits: string[];
}

export interface ScoreBreakdown {
  demand: number;
  competition: number;
  margin: number;
  confidence: number;
  rationale: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  image: string;
  price: number;
  compareAtPrice: number;
  estimatedCost: number;
  opportunityScore: number;
  growthPct: number;
  trendDirection: TrendDirection;
  trendPoints: TrendPoint[];
  competitionLevel: CompetitionLevel;
  /** Sources this opportunity was assembled from. */
  sources: DataSourceType[];
  evidence: EvidenceItem[];
  competitors: Competitor[];
  sentiment: SentimentSummary;
  scores: ScoreBreakdown;
  benefits: string[];
  specs: { label: string; value: string }[];
  story: string;
  recommendation: {
    opportunity: string;
    risks: string[];
    positioning: string;
  };
  dataSourceType: "demo-fixture" | "live-intelligence";
  isDemo: boolean;
}

export type StoreStatus = "live" | "draft" | "paused";

export type VisualStyle = "minimal" | "premium" | "lifestyle";

export interface StoreBranding {
  storeName: string;
  slug: string;
  tagline: string;
  accentColor: string;
  visualStyle: VisualStyle;
}

export interface StoreContent {
  heroHeadline: string;
  heroSubheading: string;
  benefits: string[];
  highlights: string[];
  faqs: { question: string; answer: string }[];
  ctaText: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  compareAtPrice: number;
  description: string;
  category: string;
  benefits: string[];
  branding: StoreBranding;
  content: StoreContent;
  status: StoreStatus;
  createdAt: string;
  isDemo: boolean;
}

export type OrderStatus = "completed" | "pending" | "refunded";

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
  isDemo: boolean;
  customerName?: string;
  createdAt: string;
}

export type ActivityEventType =
  | "product-discovered"
  | "store-created"
  | "creative-generated"
  | "order-completed"
  | "store-updated"
  | "store-deleted";

export interface ActivityEvent {
  id: string;
  storeId?: string;
  eventType: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  isDemo: boolean;
}

export type Platform = "instagram" | "facebook" | "tiktok" | "pinterest";
export type CreativeFormat = "static" | "carousel" | "video";

export interface StoryboardScene {
  id: string;
  time: string;
  shot: string;
  visual: string;
  onScreenText: string;
  audio: string;
}

export interface Creative {
  id: string;
  provider?: "Template (deterministic)";
  model?: "template-v1";
  created_at?: string;
  source_product_id?: string;
  productId: string;
  productName: string;
  platform: Platform;
  format: CreativeFormat;
  objective: string;
  audience: string;
  tone: string;
  headline: string;
  body: string;
  caption: string;
  callToAction: string;
  hooks: string[];
  headlineVariants: string[];
  storyboard: StoryboardScene[];
  videoPrompt: string;
  createdAt: string;
  isDemo: boolean;
}

export type WalletTransactionType =
  | "sale-credit"
  | "marketing-debit"
  | "operating-debit";

export type TransactionStatus = "settled" | "pending";

export interface WalletTransaction {
  id: string;
  storeId: string;
  storeName: string;
  description: string;
  type: WalletTransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  isDemo: boolean;
}

/** One day of simulated storefront traffic. Drives every analytics figure. */
export interface TrafficRecord {
  id: string;
  storeId: string;
  date: string;
  visitors: number;
  productViews: number;
  checkoutStarts: number;
  adSpend: number;
  isDemo: boolean;
}

export interface AnalyticsSummary {
  visitors: number;
  productViews: number;
  checkoutStarts: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  checkoutCompletionRate: number;
  checkoutRate: number;
  averageOrderValue: number;
  grossProfit: number;
  netProfit: number;
  estimatedProductCost: number;
  estimatedMarketingCost: number;
  estimatedFees: number;
}

export interface AnalyticsSeriesPoint {
  date: string;
  label: string;
  visitors: number;
  orders: number;
  revenue: number;
}

export interface StoreComparisonRow {
  storeId: string;
  storeName: string;
  status: StoreStatus;
  visitors: number;
  orders: number;
  revenue: number;
  conversionRate: number;
}
