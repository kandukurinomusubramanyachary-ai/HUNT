"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Minus, Plus } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import type { Store, VisualStyle } from "@/types";

export interface StorefrontTheme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  style: VisualStyle;
}

export function storefrontTheme(store: Store): StorefrontTheme {
  const accent = store.branding.accentColor || "#A3E635";
  const base = {
    minimal: {
      bg: "#FFFFFF",
      surface: "#F6F7F9",
      text: "#0B0E13",
      muted: "#6B7280",
      border: "#E5E7EB",
    },
    premium: {
      bg: "#0D0F13",
      surface: "#15181E",
      text: "#F4F6FA",
      muted: "#98A1AF",
      border: "#242A33",
    },
    lifestyle: {
      bg: "#FBF7F1",
      surface: "#F3ECE1",
      text: "#1A1613",
      muted: "#7A6F62",
      border: "#E6DDD0",
    },
  }[store.branding.visualStyle ?? "minimal"];

  return { ...base, accent, style: store.branding.visualStyle ?? "minimal" };
}

/** Minimum shape the storefront needs — the builder passes a draft. */
export type StorefrontDraft = Pick<
  Store,
  | "name"
  | "slug"
  | "productName"
  | "productImage"
  | "price"
  | "compareAtPrice"
  | "category"
  | "description"
  | "benefits"
  | "branding"
  | "content"
  | "status"
>;

export function StorefrontNav({
  store,
  theme,
  right,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
  right?: React.ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur"
      style={{
        borderColor: theme.border,
        backgroundColor: `${theme.bg}F2`,
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-7 items-center justify-center rounded-md text-[12px] font-bold"
            style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
          >
            {store.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p
              className="truncate text-[14px] font-semibold tracking-tight"
              style={{ color: theme.text }}
            >
              {store.name}
            </p>
            <p className="truncate text-[11px]" style={{ color: theme.muted }}>
              {store.branding.tagline}
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {["Benefits", "Specifications", "Story", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[13px] transition-opacity hover:opacity-70"
              style={{ color: theme.muted }}
            >
              {item}
            </a>
          ))}
        </nav>
        {right}
      </div>
    </header>
  );
}

export function StorefrontHero({
  store,
  theme,
  buyBox,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
  buyBox: React.ReactNode;
}) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
      <div>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: `${theme.accent}1F`, color: theme.accent }}
        >
          {store.category}
        </span>
        <h1
          className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[42px]"
          style={{ color: theme.text }}
        >
          {store.content.heroHeadline}
        </h1>
        <p
          className="mt-4 max-w-xl text-[15px] leading-7"
          style={{ color: theme.muted }}
        >
          {store.content.heroSubheading}
        </p>

        <div className="mt-6 flex items-baseline gap-3">
          <span
            className="tabular text-[30px] font-semibold"
            style={{ color: theme.text }}
          >
            {formatCurrency(store.price)}
          </span>
          {store.compareAtPrice > store.price ? (
            <>
              <span
                className="tabular text-[16px] line-through"
                style={{ color: theme.muted }}
              >
                {formatCurrency(store.compareAtPrice)}
              </span>
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: `${theme.accent}1F`, color: theme.accent }}
              >
                Save {formatCurrency(store.compareAtPrice - store.price)}
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-6">{buyBox}</div>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {["Free shipping over ₹999", "30-day returns", "Secure demo checkout"].map(
            (item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[12px]"
                style={{ color: theme.muted }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
                {item}
              </li>
            ),
          )}
        </ul>
      </div>

      <div
        className="overflow-hidden rounded-2xl border p-3"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <img
          src={store.productImage}
          alt={store.productName}
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {store.content.benefits.slice(0, 3).map((benefit, index) => (
            <div
              key={index}
              className="rounded-lg border px-2.5 py-2"
              style={{ borderColor: theme.border, backgroundColor: theme.bg }}
            >
              <span
                className="tabular text-[11px] font-semibold"
                style={{ color: theme.accent }}
              >
                0{index + 1}
              </span>
              <p
                className="mt-1 line-clamp-3 text-[11px] leading-4"
                style={{ color: theme.muted }}
              >
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StorefrontBenefits({
  store,
  theme,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
}) {
  return (
    <section
      id="benefits"
      className="border-y py-14 sm:py-16"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          className="text-[24px] font-semibold tracking-tight sm:text-[28px]"
          style={{ color: theme.text }}
        >
          Why {store.productName} works
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {store.content.benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-xl border p-5"
              style={{ borderColor: theme.border, backgroundColor: theme.bg }}
            >
              <span
                className="flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold"
                style={{
                  backgroundColor: `${theme.accent}1F`,
                  color: theme.accent,
                }}
              >
                {index + 1}
              </span>
              <p
                className="mt-4 text-[14px] leading-6"
                style={{ color: theme.text }}
              >
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StorefrontSpecs({
  store,
  theme,
  specs,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
  specs: { label: string; value: string }[];
}) {
  if (specs.length === 0) return null;
  return (
    <section id="specifications" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <h2
            className="text-[24px] font-semibold tracking-tight sm:text-[28px]"
            style={{ color: theme.text }}
          >
            Specifications
          </h2>
          <p className="mt-3 text-[14px] leading-6" style={{ color: theme.muted }}>
            {store.description}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {store.content.highlights.map((highlight, index) => (
              <div
                key={index}
                className="rounded-lg border px-3 py-2.5"
                style={{ borderColor: theme.border, backgroundColor: theme.surface }}
              >
                <p className="text-[13px] leading-5" style={{ color: theme.text }}>
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: theme.border }}
        >
          {specs.map((spec, index) => (
            <div
              key={spec.label}
              className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]"
              style={{
                borderBottom: index === specs.length - 1 ? "none" : `1px solid ${theme.border}`,
                backgroundColor: index % 2 === 0 ? theme.surface : theme.bg,
              }}
            >
              <span style={{ color: theme.muted }}>{spec.label}</span>
              <span className="text-right font-medium" style={{ color: theme.text }}>
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StorefrontStory({
  store,
  theme,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
}) {
  return (
    <section
      className="border-y py-14 sm:py-16"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: theme.border }}
        >
          <img
            src={store.productImage}
            alt={`${store.productName} detail`}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <h2
            className="text-[24px] font-semibold tracking-tight sm:text-[28px]"
            style={{ color: theme.text }}
          >
            The story
          </h2>
          <p
            className="mt-4 text-[15px] leading-7"
            style={{ color: theme.muted }}
          >
            {store.content.faqs[0]?.answer ?? store.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {store.content.highlights.slice(0, 2).map((highlight, index) => (
              <span
                key={index}
                className="rounded-full border px-3 py-1 text-[12px]"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StorefrontFaq({
  store,
  theme,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
}) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16">
      <h2
        className="text-[24px] font-semibold tracking-tight sm:text-[28px]"
        style={{ color: theme.text }}
      >
        Frequently asked questions
      </h2>
      <AccordionPrimitive.Root type="single" collapsible className="mt-6">
        {store.content.faqs.map((faq, index) => (
          <AccordionPrimitive.Item
            key={index}
            value={`faq-${index}`}
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left">
                <span
                  className="text-[15px] font-medium"
                  style={{ color: theme.text }}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  style={{ color: theme.muted }}
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p
                className="pb-4 text-[14px] leading-6"
                style={{ color: theme.muted }}
              >
                {faq.answer}
              </p>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  );
}

export function StorefrontCta({
  store,
  theme,
  onPrimary,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
  onPrimary?: () => void;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-16">
      <div
        className="rounded-2xl border px-6 py-10 text-center sm:px-12 sm:py-14"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <h2
          className="text-[24px] font-semibold tracking-tight sm:text-[30px]"
          style={{ color: theme.text }}
        >
          {store.content.ctaText}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[14px]" style={{ color: theme.muted }}>
          {store.branding.tagline}. Demo storefront — no payment is collected.
        </p>
        <button
          type="button"
          onClick={onPrimary}
          className="mt-7 inline-flex h-11 items-center justify-center rounded-lg px-6 text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.accent, color: "#0B0E13" }}
        >
          {store.content.ctaText}
        </button>
      </div>
    </section>
  );
}

export function StorefrontFooter({
  store,
  theme,
}: {
  store: StorefrontDraft;
  theme: StorefrontTheme;
}) {
  return (
    <footer className="border-t py-10" style={{ borderColor: theme.border }}>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="text-[14px] font-semibold" style={{ color: theme.text }}>
            {store.name}
          </p>
          <p className="mt-1 text-[12px]" style={{ color: theme.muted }}>
            {store.branding.tagline}
          </p>
        </div>
        <p className="text-[12px]" style={{ color: theme.muted }}>
          Demo storefront built with HUNT · no real orders are fulfilled
        </p>
      </div>
    </footer>
  );
}

export function QuantityStepper({
  quantity,
  onChange,
  theme,
}: {
  quantity: number;
  onChange: (next: number) => void;
  theme: StorefrontTheme;
}) {
  return (
    <div
      className="inline-flex h-11 items-center rounded-lg border"
      style={{ borderColor: theme.border }}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="flex h-full w-10 items-center justify-center transition-opacity hover:opacity-60"
        style={{ color: theme.text }}
      >
        <Minus className="size-4" />
      </button>
      <span
        className="tabular w-10 text-center text-[14px] font-semibold"
        style={{ color: theme.text }}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(99, quantity + 1))}
        className="flex h-full w-10 items-center justify-center transition-opacity hover:opacity-60"
        style={{ color: theme.text }}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function StorefrontLayout({
  store,
  specs,
  buyBox,
  navRight,
  onCta,
  className,
}: {
  store: StorefrontDraft;
  specs: { label: string; value: string }[];
  buyBox: React.ReactNode;
  navRight?: React.ReactNode;
  onCta?: () => void;
  className?: string;
}) {
  const theme = storefrontTheme(store as Store);
  return (
    <div
      className={cn("min-h-full", className)}
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <StorefrontNav store={store} theme={theme} right={navRight} />
      <StorefrontHero store={store} theme={theme} buyBox={buyBox} />
      <StorefrontBenefits store={store} theme={theme} />
      <StorefrontSpecs store={store} theme={theme} specs={specs} />
      <StorefrontStory store={store} theme={theme} />
      <StorefrontFaq store={store} theme={theme} />
      <StorefrontCta store={store} theme={theme} onPrimary={onCta} />
      <StorefrontFooter store={store} theme={theme} />
    </div>
  );
}
