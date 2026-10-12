import type {
  Product,
  Store,
  StoreBranding,
  StoreContent,
  VisualStyle,
} from "@/types";
import { capitalise, isValidSlug, slugify, uid } from "@/lib/utils";

/**
 * Store service — the single place storefronts are created and shaped.
 * Milestone 1 keeps everything in frontend state; these helpers are written
 * so their bodies can later be swapped for API calls without touching the UI.
 */

export const ACCENT_PRESETS: { value: string; label: string }[] = [
  { value: "#A3E635", label: "Signal" },
  { value: "#60A5FA", label: "Atlas" },
  { value: "#34D399", label: "Verdant" },
  { value: "#FBBF24", label: "Ember" },
  { value: "#FB7185", label: "Pulse" },
  { value: "#C084FC", label: "Iris" },
];

export const VISUAL_STYLES: VisualStyle[] = ["minimal", "premium", "lifestyle"];

function lowerFirst(input: string): string {
  if (!input) return input;
  return input.charAt(0).toLowerCase() + input.slice(1);
}

function stripTrailingPeriod(input: string): string {
  return input.replace(/\.$/, "");
}

function shortBenefit(product: Product): string {
  return stripTrailingPeriod(product.benefits[0]?.split(",")[0] ?? product.tagline);
}

export function defaultStoreName(product: Product): string {
  return product.name;
}

export function defaultSlug(product: Product | Store): string {
  return slugify(product.name);
}

export function defaultTagline(product: Product): string {
  return capitalise(product.tagline);
}

export function defaultContent(
  product: Product,
  style: VisualStyle = "minimal",
): StoreContent {
  return generateContent(product, style, 0);
}

const HEADLINE_TEMPLATES: Record<
  VisualStyle,
  ((product: Product, benefit: string, pain: string) => string)[]
> = {
  minimal: [
    (product) => capitalise(product.tagline),
    (_product, benefit) => benefit,
    (product) => `${product.name} — ${lowerFirst(product.tagline)}`,
  ],
  premium: [
    (product) => `The ${product.tagline}`,
    (_product, benefit) => capitalise(`${lowerFirst(benefit)}, and nothing you do not need`),
    (product) => `Considered ${product.category.toLowerCase()}, done properly`,
  ],
  lifestyle: [
    (_product, benefit) => benefit,
    (_product, _benefit, pain) =>
      capitalise(`For anyone done with ${lowerFirst(pain)}`),
    (product, benefit) =>
      `Meet ${product.name} — ${lowerFirst(benefit)}`,
  ],
};

const SUBHEADING_TEMPLATES: Record<
  VisualStyle,
  ((product: Product, benefit: string, pain: string) => string)[]
> = {
  minimal: [
    (product, _benefit, pain) =>
      `${product.name} is built around one complaint that keeps appearing in sample customer discussions: ${pain}.`,
    (product, benefit) =>
      `${benefit}. Everything else about ${product.name} was stripped back to keep it that simple.`,
    (product, _benefit, pain) =>
      `No gimmicks, no bundles you will never open. ${capitalise(pain)} — solved, then left alone.`,
  ],
  premium: [
    (product, benefit) =>
      `A considered ${product.category.toLowerCase()} piece. ${benefit} — without the markup of a legacy brand.`,
    (product, benefit) =>
      `${product.name} is the version we wanted to buy: ${lowerFirst(benefit)}, made from materials that last.`,
    (product, _benefit, pain) =>
      `Most options ask you to accept ${pain}. ${product.name} was designed so you do not have to.`,
  ],
  lifestyle: [
    (_product, benefit, pain) =>
      `${benefit}, because ${pain} should not be the reason you give up.`,
    (product, benefit) =>
      `Built for real mornings, real nights and everything between. ${benefit} — that is the whole idea behind ${product.name}.`,
    (product, _benefit, pain) =>
      `We started with a simple question: why does ${pain} still happen? ${product.name} is the answer we landed on.`,
  ],
};

/** Deterministic local copy generation — no AI call, no network. */
export function generateContent(
  product: Product,
  style: VisualStyle = "minimal",
  variant = 0,
): StoreContent {
  if (!product.isDemo) return {
    heroHeadline: product.name, heroSubheading: product.tagline, benefits: product.benefits,
    highlights: [], faqs: [{ question: 'What should I know about this product?', answer: 'Research candidate. Specifications, sourcing, fulfillment, returns and warranty require validation before publication.' }],
    ctaText: 'Learn more',
  };
  const index = Math.abs(Math.round(variant)) % 3;
  const benefit = capitalise(shortBenefit(product));
  const pain = stripTrailingPeriod(
    product.sentiment.painPoints[0] ?? "the usual compromises",
  );

  const headline = HEADLINE_TEMPLATES[style][index](product, benefit, pain);
  const subheading = SUBHEADING_TEMPLATES[style][index](product, benefit, pain);

  return {
    heroHeadline: capitalise(headline),
    heroSubheading: subheading,
    benefits: product.benefits.slice(0, 3),
    highlights: product.specs.slice(0, 4).map((s) => `${s.label}: ${s.value}`),
    faqs: [
      {
        question: `What makes ${product.name} different?`,
        answer: product.story,
      },
      {
        question: `Who is ${product.name} for?`,
        answer: `${product.benefits.join(" ")} It suits anyone who has already tried the cheaper option and wants it to actually work.`,
      },
      {
        question: "What if it does not work out?",
        answer: `Every order is covered by a 30-day return window and a ${product.specs[product.specs.length - 1]?.value ?? "12-month"} warranty. This is a demo storefront — no payment is collected and nothing is shipped.`,
      },
    ],
    ctaText: `Shop ${product.name}`,
  };
}

export function defaultBranding(
  product: Product,
  style: VisualStyle = "minimal",
): StoreBranding {
  return {
    storeName: defaultStoreName(product),
    slug: slugify(product.name),
    tagline: defaultTagline(product),
    accentColor: ACCENT_PRESETS[0].value,
    visualStyle: style,
  };
}

export interface CreateStoreInput {
  product: Product;
  branding: StoreBranding;
  content: StoreContent;
  status?: Store["status"];
}

export function buildStore(input: CreateStoreInput): Store {
  const { product, branding, content, status = "live" } = input;
  return {
    id: uid("store"),
    slug: branding.slug,
    name: branding.storeName,
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    description: product.tagline,
    category: product.category,
    benefits: product.benefits,
    branding: { ...branding },
    content: {
      ...content,
      benefits: content.benefits.slice(0, 3),
      faqs: content.faqs.slice(0, 6),
    },
    status,
    createdAt: new Date().toISOString(),
    isDemo: product.isDemo,
  };
}

export interface StoreFormErrors {
  storeName?: string;
  slug?: string;
  price?: string;
  heroHeadline?: string;
}

export function validateBranding(
  branding: StoreBranding,
  existingStores: Store[],
  ignoreStoreId?: string,
): StoreFormErrors {
  const errors: StoreFormErrors = {};

  if (!branding.storeName.trim()) {
    errors.storeName = "Store name is required.";
  } else if (branding.storeName.trim().length < 2) {
    errors.storeName = "Store name must be at least 2 characters.";
  }

  const slug = branding.slug.trim();
  if (!slug) {
    errors.slug = "Store URL is required.";
  } else if (!isValidSlug(slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens only.";
  } else if (
    existingStores.some(
      (store) => store.slug === slug && store.id !== ignoreStoreId,
    )
  ) {
    errors.slug = "This store URL is already in use.";
  }

  return errors;
}

export function validatePrice(price: number): string | undefined {
  if (!Number.isFinite(price)) return "Enter a valid price.";
  if (price <= 0) return "Enter a valid price.";
  if (price > 1000000) return "Price looks too high — check the amount.";
  return undefined;
}

export function validateStoreContent(content: StoreContent): StoreFormErrors {
  const errors: StoreFormErrors = {};
  if (!content.heroHeadline.trim()) {
    errors.heroHeadline = "Hero headline is required.";
  }
  return errors;
}
