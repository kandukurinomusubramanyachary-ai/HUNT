import type {
  Creative,
  CreativeFormat,
  Platform,
  Product,
  StoryboardScene,
} from "@/types";
import { capitalise, uid } from "@/lib/utils";

/**
 * Creative service — local, deterministic demo copy generation.
 * No AI or social platform calls happen here: templates are assembled from
 * product fixtures so the studio is fully usable offline.
 */

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "pinterest", label: "Pinterest" },
];

export const FORMATS: { value: CreativeFormat; label: string }[] = [
  { value: "static", label: "Static ad" },
  { value: "carousel", label: "Carousel" },
  { value: "video", label: "Short-form video concept" },
];

export const OBJECTIVES = [
  "Conversion",
  "Traffic",
  "Awareness",
  "Add to cart",
];

export const AUDIENCES = [
  "Side sleepers 25–45",
  "Frequent travellers",
  "New homeowners",
  "Home fitness beginners",
  "Dog owners in cities",
  "Remote workers",
];

export const TONES = ["Confident", "Friendly", "Premium", "Direct"];

const TONE_HEADLINE: Record<string, (product: Product, benefit: string) => string> = {
  Confident: (_product, benefit) => `Finally: ${benefit}`,
  Friendly: (product, benefit) => `Meet ${product.name}: ${lowerFirst(benefit)}`,
  Premium: (product, benefit) =>
    `Introducing ${product.name} — ${lowerFirst(benefit)}`,
  Direct: (_product, benefit) => benefit,
};

function lowerFirst(input: string): string {
  if (!input) return input;
  return input.charAt(0).toLowerCase() + input.slice(1);
}

function stripTrailingPeriod(input: string): string {
  return input.replace(/\.$/, "");
}

function shortBenefit(product: Product): string {
  return stripTrailingPeriod(
    product.benefits[0]?.split(",")[0] ?? product.tagline,
  );
}

export interface CreativeConfig {
  platform: Platform;
  format: CreativeFormat;
  objective: string;
  audience: string;
  tone: string;
  /** Bumps the template variant so "Regenerate" produces different copy. */
  variant?: number;
}

function hashtagsFor(product: Product, platform: Platform): string {
  const base = product.category
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, "")
    .split(/\s*&\s*|\s+/)
    .filter(Boolean)
    .map((word) => `#${word}`);
  const extra =
    platform === "tiktok"
      ? ["#tiktokmademebuyit", "#smallbusiness"]
      : platform === "pinterest"
        ? ["#homefinds", "#giftideas"]
        : ["#productlaunch", "#shopsmall"];
  return Array.from(new Set([...base, ...extra])).slice(0, 5).join(" ");
}

export function generateDemoCreative(
  product: Product,
  config: CreativeConfig,
): Creative {
  const variant = config.variant ?? 0;
  const benefit = stripTrailingPeriod(shortBenefit(product));
  const pain = lowerFirst(
    stripTrailingPeriod(product.sentiment.painPoints[variant % 3] ?? ""),
  );
  const secondBenefit = lowerFirst(
    stripTrailingPeriod(product.benefits[(variant + 1) % 3] ?? ""),
  );

  const toneHeadline =
    (TONE_HEADLINE[config.tone] ?? TONE_HEADLINE.Direct)(product, benefit);

  const headlineVariants = [
    toneHeadline,
    capitalise(benefit),
    `${product.name}: ${lowerFirst(benefit)}`,
  ];

  const headline = headlineVariants[variant % headlineVariants.length];

  const category = product.category.toLowerCase();
  const bodyTemplates = [
    `${capitalise(pain)} — that is the complaint that shows up again and again in ${category} discussions. ${product.name} was built around it: ${lowerFirst(benefit)}, plus ${secondBenefit}.`,
    `Most ${category} options make you choose between quality and price. ${product.name} does not: ${lowerFirst(benefit)}, plus ${secondBenefit}.`,
    `${capitalise(benefit)}. Not a claim — a design decision. ${product.name} exists because one complaint kept coming up: ${pain}.`,
  ];

  const body = bodyTemplates[variant % bodyTemplates.length];

  const hooks = [
    `${capitalise(pain)}? Read this before you buy another one.`,
    `"I stopped rebuying the cheap version." — the most common ${product.name} reaction.`,
    `${capitalise(benefit)}. That is the whole pitch.`,
  ];

  const captionTemplates: Record<Platform, string> = {
    instagram: `${headline}\n\n${body}\n\n${hashtagsFor(product, "instagram")}`,
    facebook: `${headline}\n\n${body}\n\nFree shipping on your first order. ${hashtagsFor(product, "facebook")}`,
    tiktok: `POV: you finally fixed ${pain}\n\n${headline} — ${lowerFirst(benefit)}.\n\n${hashtagsFor(product, "tiktok")}`,
    pinterest: `${headline} — ${lowerFirst(benefit)}. Save this for your next ${product.category.toLowerCase()} upgrade.\n\n${hashtagsFor(product, "pinterest")}`,
  };

  const storyboard: StoryboardScene[] = [
    {
      id: uid("scene"),
      time: "0.0s – 3.0s",
      shot: "Macro, static",
      visual: `Extreme close-up on the ${product.name} detail that answers "${pain}". Shallow depth of field, single soft key light from the left.`,
      onScreenText: capitalise(pain),
      audio: "Ambient room tone, no music yet",
    },
    {
      id: uid("scene"),
      time: "3.0s – 6.0s",
      shot: "Handheld reveal",
      visual: `Pull back to reveal ${product.name} in use. Natural motion, one continuous take.`,
      onScreenText: headline,
      audio: "Beat drops — lo-fi, 90 BPM",
    },
    {
      id: uid("scene"),
      time: "6.0s – 9.0s",
      shot: "Overhead, 45°",
      visual: `Demonstrate the core mechanism. Show the result, not the packaging.`,
      onScreenText: capitalise(benefit),
      audio: "Voiceover: “Watch this part.”",
    },
    {
      id: uid("scene"),
      time: "9.0s – 12.0s",
      shot: "Split frame",
      visual: `Side-by-side with the generic alternative. Keep the comparison factual and visual.`,
      onScreenText: "The difference is the details",
      audio: "Voiceover explains the difference in one sentence",
    },
    {
      id: uid("scene"),
      time: "12.0s – 15.0s",
      shot: "Product hero, slow push",
      visual: `${product.name} centred on a clean background, price on screen, brand mark bottom right.`,
      onScreenText: `Shop ${product.name} — demo store`,
      audio: "Music resolves, soft click on end card",
    },
  ];

  const videoPrompt = [
    `Vertical 9:16 product film, 15 seconds, ${product.category.toLowerCase()} category.`,
    `Subject: ${product.name} — ${product.tagline}.`,
    `Style: ${config.tone.toLowerCase()} brand tone, clean seamless background, soft directional key light, shallow depth of field, premium product-photography look.`,
    `Shot list: macro detail → handheld reveal → overhead mechanism demo → side-by-side comparison → hero end card with price.`,
    `Text overlays: "${headline}".`,
    `Pacing: cuts every 3 seconds, no faces, no logos other than the end card.`,
    `Note: reference concept only — no footage is generated in this demo.`,
  ].join(" ");

  const createdAt = new Date().toISOString();
  return {
    id: uid("creative"),
    provider: "Template (deterministic)",
    model: "template-v1",
    created_at: createdAt,
    source_product_id: product.id,
    productId: product.id,
    productName: product.name,
    platform: config.platform,
    format: config.format,
    objective: config.objective,
    audience: config.audience,
    tone: config.tone,
    headline,
    body,
    caption: captionTemplates[config.platform],
    callToAction: `Shop ${product.name}`,
    hooks,
    headlineVariants,
    storyboard,
    videoPrompt,
    createdAt,
    isDemo: true,
  };
}
