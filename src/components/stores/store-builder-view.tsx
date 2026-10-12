"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Monitor,
  Rocket,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { StorefrontLayout, type StorefrontDraft } from "@/components/stores/storefront-sections";
import { DemoNote } from "@/components/shared/demo-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import {
  ACCENT_PRESETS,
  generateContent,
  defaultSlug,
} from "@/lib/services/store-builder";
import { createStore, getStoreById, updateStore } from "@/lib/services/stores";
import { getProductById, getProducts } from "@/lib/services/products";
import { useHuntStore } from "@/store/hunt-store";
import { cn, formatCurrency, slugify } from "@/lib/utils";
import type { Product, Store, VisualStyle } from "@/types";

const STEPS = [
  { id: 1, label: "Product", hint: "Choose what you are selling" },
  { id: 2, label: "Branding", hint: "Name, slug and visual style" },
  { id: 3, label: "Content", hint: "Headline, benefits and FAQ" },
  { id: 4, label: "Preview", hint: "Check and launch" },
] as const;

interface BuilderState {
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice: number;
  benefits: string[];
  storeName: string;
  slug: string;
  slugTouched: boolean;
  tagline: string;
  accentColor: string;
  visualStyle: VisualStyle;
  heroHeadline: string;
  heroSubheading: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
  ctaText: string;
}

function stateFromProduct(product: Product, style: VisualStyle = "minimal"): BuilderState {
  const content = generateContent(product, style, 0);
  return {
    productId: product.id,
    productName: product.name,
    description: product.tagline,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    benefits: product.isDemo ? product.benefits.slice(0, 3) : [...product.benefits, "", "", ""].slice(0, 3),
    storeName: product.name,
    slug: defaultSlug(product),
    slugTouched: false,
    tagline: product.tagline.charAt(0).toUpperCase() + product.tagline.slice(1),
    accentColor: ACCENT_PRESETS[0].value,
    visualStyle: style,
    heroHeadline: content.heroHeadline,
    heroSubheading: content.heroSubheading,
    highlights: content.highlights,
    faqs: content.faqs,
    ctaText: content.ctaText,
  };
}

function stateFromStore(store: Store): BuilderState {
  return {
    productId: store.productId,
    productName: store.productName,
    description: store.description,
    category: store.category,
    price: store.price,
    compareAtPrice: store.compareAtPrice,
    benefits: store.benefits.slice(0, 3),
    storeName: store.name,
    slug: store.slug,
    slugTouched: true,
    tagline: store.branding.tagline,
    accentColor: store.branding.accentColor,
    visualStyle: store.branding.visualStyle,
    heroHeadline: store.content.heroHeadline,
    heroSubheading: store.content.heroSubheading,
    highlights: store.content.highlights,
    faqs: store.content.faqs,
    ctaText: store.content.ctaText,
  };
}

import { loadOpportunity } from '@/lib/services/intelligence';
import { registerLiveProduct } from '@/lib/services/products';
export function StoreBuilderView() {
  const productId = useSearchParams().get('product');
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    if (!productId?.startsWith('live-')) { setReady(true); return; }
    const controller = new AbortController(); setReady(false); setError('');
    loadOpportunity(productId, controller.signal).then(p => { registerLiveProduct(p); setReady(true); }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [productId]);
  if (error) return <p role="alert" className="text-negative">{error}</p>;
  if (!ready) return <p role="status" className="text-text-secondary">Loading selected product?</p>;
  return <>{productId?.startsWith('live-') && <p className="mb-4 rounded-lg border border-border p-4 text-warning">Research candidate: price, costs, benefits and supplier claims are unverified. Enter your own validated selling price before saving. Generated copy is a draft to review.</p>}<ExistingStoreBuilderView key={productId}/></>;
}
function ExistingStoreBuilderView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product");
  const storeParam = searchParams.get("store");

  const stores = useHuntStore((state) => state.stores);
  const products = React.useMemo(() => getProducts(), []);

  const editingStore = React.useMemo(
    () => (storeParam ? getStoreById(storeParam) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeParam, stores],
  );

  const [step, setStep] = React.useState(1);
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop");
  const [copyVariant, setCopyVariant] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [slugManuallyCleared, setSlugManuallyCleared] = React.useState(false);

  const [state, setState] = React.useState<BuilderState>(() => {
    if (storeParam) {
      const existing = getStoreById(storeParam);
      if (existing) return stateFromStore(existing);
    }
    const product =
      (productParam ? getProductById(productParam) : undefined) ?? products[0];
    return stateFromProduct(product);
  });

  const product =
    getProductById(state.productId) ?? products[0];

  const update = (patch: Partial<BuilderState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const applyProduct = (nextProduct: Product) => {
    const next = stateFromProduct(nextProduct, state.visualStyle);
    setState({
      ...next,
      storeName: slugManuallyCleared ? next.storeName : state.storeName || next.storeName,
      slug: state.slugTouched ? state.slug : next.slug,
      accentColor: state.accentColor,
      visualStyle: state.visualStyle,
    });
  };

  const applyStyle = (style: VisualStyle) => {
    const content = generateContent(product, style, copyVariant);
    setState((prev) => ({
      ...prev,
      visualStyle: style,
      heroHeadline: content.heroHeadline,
      heroSubheading: content.heroSubheading,
    }));
  };

  const regenerateCopy = () => {
    const nextVariant = (copyVariant + 1) % 3;
    const content = generateContent(product, state.visualStyle, nextVariant);
    setCopyVariant(nextVariant);
    setState((prev) => ({
      ...prev,
      heroHeadline: content.heroHeadline,
      heroSubheading: content.heroSubheading,
    }));
    toast({
      title: "Suggested copy generated",
      description: "Copy was assembled locally from the product fixtures.",
      tone: "info",
    });
  };

  const draft: StorefrontDraft = {
    name: state.storeName || "Untitled store",
    slug: state.slug || "untitled-store",
    productName: state.productName,
    productImage: product.image,
    price: Number.isFinite(state.price) ? state.price : 0,
    compareAtPrice: Number.isFinite(state.compareAtPrice)
      ? state.compareAtPrice
      : 0,
    category: state.category,
    description: state.description,
    benefits: state.benefits,
    branding: {
      storeName: state.storeName,
      slug: state.slug,
      tagline: state.tagline,
      accentColor: state.accentColor,
      visualStyle: state.visualStyle,
    },
    content: {
      heroHeadline: state.heroHeadline,
      heroSubheading: state.heroSubheading,
      benefits: state.benefits,
      highlights: state.highlights,
      faqs: state.faqs,
      ctaText: state.ctaText,
    },
    status: "live",
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!state.storeName.trim()) next.storeName = "Store name is required.";
    if (!state.slug.trim()) {
      next.slug = "Store URL is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(state.slug)) {
      next.slug = "Use lowercase letters, numbers and single hyphens only.";
    } else if (
      stores.some(
        (store) => store.slug === state.slug && store.id !== editingStore?.id,
      )
    ) {
      next.slug = "This store URL is already in use.";
    }
    if (!Number.isFinite(state.price) || state.price <= 0) {
      next.price = "Enter a valid price.";
    }
    if (!state.heroHeadline.trim()) {
      next.heroHeadline = "Hero headline is required.";
    }
    return next;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.storeName || nextErrors.slug) setStep(2);
      else if (nextErrors.price) setStep(1);
      else if (nextErrors.heroHeadline) setStep(3);
      toast({
        title: "Check the highlighted fields",
        description: "Some required store details are missing.",
        tone: "error",
      });
      return;
    }

    const content = {
      heroHeadline: state.heroHeadline,
      heroSubheading: state.heroSubheading,
      benefits: state.benefits,
      highlights: state.highlights,
      faqs: state.faqs,
      ctaText: state.ctaText,
    };

    if (editingStore) {
      updateStore(editingStore.id, {
        name: state.storeName.trim(),
        slug: state.slug.trim(),
        productId: state.productId,
        productName: state.productName,
        productImage: product.image,
        price: state.price,
        compareAtPrice: state.compareAtPrice,
        description: state.description,
        category: state.category,
        benefits: state.benefits,
        branding: {
          storeName: state.storeName.trim(),
          slug: state.slug.trim(),
          tagline: state.tagline,
          accentColor: state.accentColor,
          visualStyle: state.visualStyle,
        },
        content,
      });
      toast({
        title: "Changes saved.",
        description: `${state.storeName} was updated.`,
      });
      router.push(`/stores?store=${editingStore.id}`);
      return;
    }

    const result = createStore({
      product: { ...product, name: state.productName, tagline: state.description, category: state.category, compareAtPrice: state.compareAtPrice, benefits: state.benefits },
      storeName: state.storeName,
      slug: state.slug,
      tagline: state.tagline,
      accentColor: state.accentColor,
      visualStyle: state.visualStyle,
      price: state.price,
      content,
    });

    if (!result.ok || !result.store) {
      setErrors(result.errors ?? {});
      toast({
        title: "Unable to create store",
        description: "Check the highlighted fields and try again.",
        tone: "error",
      });
      return;
    }

    toast({
      title: "Store created successfully.",
      description: `${result.store.name} is live at /${result.store.slug}.`,
    });
    router.push(`/store/${result.store.slug}`);
  };

  const previewBuyBox = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex h-11 items-center justify-center rounded-lg px-6 text-[14px] font-semibold"
          style={{
            backgroundColor: state.accentColor,
            color: "#0B0E13",
          }}
        >
          {state.ctaText || "Shop now"}
        </span>
        <span
          className="tabular text-[13px]"
          style={{ color: "rgba(120,120,120,0.9)" }}
        >
          Quantity: 1
        </span>
      </div>
      <p className="text-[11px]" style={{ color: "rgba(120,120,120,0.9)" }}>
        Demo preview — checkout is available on the published storefront.
      </p>
    </div>
  );

  return (
    <>
      <PageIntro
        title={editingStore ? "Edit store" : "AI store builder"}
        subtitle={
          editingStore
            ? `Update ${editingStore.name} and preview changes live.`
            : "Turn a validated product into a finished storefront."
        }
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Commerce", href: "/stores" },
          { label: "My Stores", href: "/stores" },
          { label: editingStore ? "Edit store" : "New store" },
        ]}
        actions={
          <Button
            variant={editingStore ? "primary" : "primary"}
            onClick={handleSubmit}
          >
            {editingStore ? <Save /> : <Rocket />}
            {editingStore ? "Save changes" : "Launch store"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
        {/* Configuration panel */}
        <div className="order-2 flex flex-col rounded-card border border-border bg-surface lg:order-1">
          <div className="flex items-center gap-1 border-b border-border px-4 py-3">
            {STEPS.map((item) => {
              const active = step === item.id;
              const done = step > item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={cn(
                    "flex flex-1 flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors",
                    active ? "bg-elevated" : "hover:bg-elevated/60",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                        done
                          ? "bg-brand text-[#10140A]"
                          : active
                            ? "border border-brand text-brand"
                            : "border border-border text-text-muted",
                      )}
                    >
                      {done ? <Check className="size-2.5" /> : item.id}
                    </span>
                    <span
                      className={cn(
                        "text-[12px] font-medium",
                        active ? "text-text" : "text-text-secondary",
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span className="hidden text-[10px] leading-3 text-text-muted xl:block">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-5">
            {step === 1 ? (
              <div className="flex flex-col gap-4">
                <Field label="Discovered product" htmlFor="product-select">
                  <select
                    id="product-select"
                    value={state.productId}
                    onChange={(event) => {
                      const next = getProductById(event.target.value);
                      if (next) applyProduct(next);
                    }}
                    className="flex h-9 w-full rounded-btn border border-border bg-bg px-3 text-body text-text outline-none focus:border-brand/60"
                  >
                    {products.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · score {item.opportunityScore}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex gap-3 rounded-[10px] border border-border bg-elevated/40 p-3">
                  <img
                    src={product.image}
                    alt=""
                    className="size-16 rounded-lg border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-text">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {product.category}
                    </p>
                    <Link
                      href={`/products/${product.id}`}
                      className="text-[11px] font-medium text-info hover:underline"
                    >
                      View product intelligence
                    </Link>
                  </div>
                </div>

                <Field label="Product name" htmlFor="product-name">
                  <Input
                    id="product-name"
                    value={state.productName}
                    onChange={(event) =>
                      update({ productName: event.target.value })
                    }
                  />
                </Field>

                <Field
                  label="Product description"
                  htmlFor="product-description"
                  hint="Shown in the specifications section"
                >
                  <Textarea
                    id="product-description"
                    value={state.description}
                    onChange={(event) =>
                      update({ description: event.target.value })
                    }
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Retail price (₹)"
                    htmlFor="retail-price"
                    error={errors.price}
                  >
                    <Input
                      id="retail-price"
                      type="number"
                      min={0}
                      value={state.price}
                      invalid={Boolean(errors.price)}
                      onChange={(event) =>
                        update({ price: Number(event.target.value) })
                      }
                    />
                  </Field>
                  <Field
                    label="Compare-at price (₹)"
                    htmlFor="compare-price"
                    hint="Optional"
                  >
                    <Input
                      id="compare-price"
                      type="number"
                      min={0}
                      value={state.compareAtPrice}
                      onChange={(event) =>
                        update({ compareAtPrice: Number(event.target.value) })
                      }
                    />
                  </Field>
                </div>

                <Field
                  label="Benefit highlights"
                  hint="Three shown in the preview"
                >
                  <div className="flex flex-col gap-2">
                    {state.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={benefit}
                          aria-label={`Benefit ${index + 1}`}
                          onChange={(event) => {
                            const next = [...state.benefits];
                            next[index] = event.target.value;
                            update({ benefits: next });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove benefit ${index + 1}`}
                          onClick={() =>
                            update({
                              benefits: state.benefits.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    {state.benefits.length < 3 ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          update({
                            benefits: [
                              ...state.benefits,
                              product.benefits[state.benefits.length] ??
                                "New benefit",
                            ],
                          })
                        }
                      >
                        Add benefit
                      </Button>
                    ) : null}
                  </div>
                </Field>

                <p className="text-[11px] text-text-muted">
                  {product.isDemo ? <>Estimated product cost {formatCurrency(product.estimatedCost)} ? gross margin {formatCurrency(Math.max(state.price - product.estimatedCost, 0))}</> : 'Product cost and gross margin: unknown; supplier validation required.'}
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col gap-4">
                <Field
                  label="Store name"
                  htmlFor="store-name"
                  error={errors.storeName}
                >
                  <Input
                    id="store-name"
                    value={state.storeName}
                    invalid={Boolean(errors.storeName)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setState((prev) => ({
                        ...prev,
                        storeName: value,
                        slug: prev.slugTouched
                          ? prev.slug
                          : slugify(value) || prev.slug,
                      }));
                    }}
                  />
                </Field>

                <Field
                  label="Store URL"
                  htmlFor="store-slug"
                  error={errors.slug}
                  hint={`hunt.app/store/${state.slug || "your-store"}`}
                >
                  <Input
                    id="store-slug"
                    value={state.slug}
                    invalid={Boolean(errors.slug)}
                    onChange={(event) => {
                      setSlugManuallyCleared(event.target.value.length === 0);
                      update({
                        slug: slugify(event.target.value),
                        slugTouched: true,
                      });
                    }}
                  />
                </Field>

                <Field label="Tagline" htmlFor="store-tagline">
                  <Input
                    id="store-tagline"
                    value={state.tagline}
                    onChange={(event) => update({ tagline: event.target.value })}
                  />
                </Field>

                <Field label="Accent colour">
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => update({ accentColor: preset.value })}
                        aria-label={`Accent colour ${preset.label}`}
                        aria-pressed={state.accentColor === preset.value}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg border transition-transform hover:scale-105",
                          state.accentColor === preset.value
                            ? "border-text/40 ring-2 ring-brand/40"
                            : "border-border",
                        )}
                        style={{ backgroundColor: `${preset.value}22` }}
                      >
                        <span
                          className="size-4 rounded-full"
                          style={{ backgroundColor: preset.value }}
                        />
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Visual style">
                  <SegmentedControl
                    ariaLabel="Visual style"
                    value={state.visualStyle}
                    onChange={applyStyle}
                    options={[
                      { value: "minimal", label: "Minimal" },
                      { value: "premium", label: "Premium" },
                      { value: "lifestyle", label: "Lifestyle" },
                    ]}
                    className="w-full"
                  />
                  <p className="mt-2 text-[11px] text-text-muted">
                    Changing the style regenerates the hero copy from the
                    product fixtures.
                  </p>
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-elevated/40 px-3 py-2.5">
                  <div>
                    <p className="text-[12px] font-semibold text-text">
                      Suggested copy
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Generated locally from product data.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={regenerateCopy}>
                    <Sparkles />
                    Generate
                  </Button>
                </div>

                <Field
                  label="Hero headline"
                  htmlFor="hero-headline"
                  error={errors.heroHeadline}
                >
                  <Input
                    id="hero-headline"
                    value={state.heroHeadline}
                    invalid={Boolean(errors.heroHeadline)}
                    onChange={(event) =>
                      update({ heroHeadline: event.target.value })
                    }
                  />
                </Field>

                <Field label="Subheading" htmlFor="hero-subheading">
                  <Textarea
                    id="hero-subheading"
                    value={state.heroSubheading}
                    onChange={(event) =>
                      update({ heroSubheading: event.target.value })
                    }
                  />
                </Field>

                <Field label="Product highlights" hint="Up to four">
                  <div className="flex flex-col gap-2">
                    {state.highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={highlight}
                          aria-label={`Highlight ${index + 1}`}
                          onChange={(event) => {
                            const next = [...state.highlights];
                            next[index] = event.target.value;
                            update({ highlights: next });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove highlight ${index + 1}`}
                          onClick={() =>
                            update({
                              highlights: state.highlights.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    {state.highlights.length < 4 ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          update({
                            highlights: [
                              ...state.highlights,
                              product.specs[state.highlights.length]
                                ? `${product.specs[state.highlights.length].label}: ${product.specs[state.highlights.length].value}`
                                : "New highlight",
                            ],
                          })
                        }
                      >
                        Add highlight
                      </Button>
                    ) : null}
                  </div>
                </Field>

                <Field label="FAQ items">
                  <div className="flex flex-col gap-3">
                    {state.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-[10px] border border-border bg-elevated/40 p-3"
                      >
                        <Input
                          value={faq.question}
                          aria-label={`FAQ question ${index + 1}`}
                          onChange={(event) => {
                            const next = [...state.faqs];
                            next[index] = { ...faq, question: event.target.value };
                            update({ faqs: next });
                          }}
                        />
                        <Textarea
                          value={faq.answer}
                          aria-label={`FAQ answer ${index + 1}`}
                          onChange={(event) => {
                            const next = [...state.faqs];
                            next[index] = { ...faq, answer: event.target.value };
                            update({ faqs: next });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="self-start text-negative"
                          onClick={() =>
                            update({
                              faqs: state.faqs.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 />
                          Remove FAQ
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        update({
                          faqs: [
                            ...state.faqs,
                            {
                              question: "New question",
                              answer: "Add the answer for this question.",
                            },
                          ],
                        })
                      }
                    >
                      Add FAQ
                    </Button>
                  </div>
                </Field>

                <Field label="Call to action" htmlFor="cta-text">
                  <Input
                    id="cta-text"
                    value={state.ctaText}
                    onChange={(event) => update({ ctaText: event.target.value })}
                  />
                </Field>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-[10px] border border-border bg-elevated/40 p-4">
                  <p className="text-[13px] font-semibold text-text">
                    Ready to launch?
                  </p>
                  <ul className="mt-3 space-y-2">
                    {[
                      {
                        label: "Store name",
                        value: state.storeName || "—",
                        ok: Boolean(state.storeName.trim()),
                      },
                      {
                        label: "Store URL",
                        value: `/store/${state.slug || "—"}`,
                        ok: Boolean(state.slug.trim()),
                      },
                      {
                        label: "Retail price",
                        value: formatCurrency(state.price || 0),
                        ok: state.price > 0,
                      },
                      {
                        label: "Hero headline",
                        value: state.heroHeadline || "—",
                        ok: Boolean(state.heroHeadline.trim()),
                      },
                    ].map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center justify-between gap-3 text-[12px]"
                      >
                        <span className="text-text-muted">{item.label}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-text">{item.value}</span>
                          {item.ok ? (
                            <Check className="size-3.5 text-positive" />
                          ) : (
                            <TriangleAlert className="size-3.5 text-negative" />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {Object.keys(errors).length > 0 ? (
                  <div className="rounded-[10px] border border-negative/30 bg-negative/10 p-3">
                    <p className="text-[12px] font-semibold text-negative">
                      Fix these before launching
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {Object.entries(errors).map(([key, value]) => (
                        <li key={key} className="text-[12px] text-text-secondary">
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <p className="text-[12px] leading-5 text-text-secondary">
                  Launching creates the storefront in this browser and opens it.
                  No domain is registered and nothing is hosted — the preview URL
                  is part of the demo app.
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    <ArrowLeft />
                    Edit content
                  </Button>
                  <Button variant="primary" onClick={handleSubmit} className="flex-1">
                    {editingStore ? <Save /> : <Rocket />}
                    {editingStore ? "Save changes" : "Launch store"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              <ArrowLeft />
              Back
            </Button>
            <span className="text-[11px] text-text-muted">
              Step {step} of {STEPS.length}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStep((prev) => Math.min(4, prev + 1))}
              disabled={step === 4}
            >
              Next
              <ArrowRight />
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="order-1 flex flex-col overflow-hidden rounded-card border border-border bg-surface lg:order-2">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand" />
              <p className="text-[13px] font-semibold text-text">Live preview</p>
              <Badge tone="muted">Updates as you type</Badge>
            </div>
            <SegmentedControl
              ariaLabel="Preview device"
              value={device}
              onChange={setDevice}
              size="sm"
              options={[
                {
                  value: "desktop",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Monitor className="size-3.5" />
                      Desktop
                    </span>
                  ) as unknown as string,
                },
                {
                  value: "mobile",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="size-3.5" />
                      Mobile
                    </span>
                  ) as unknown as string,
                },
              ]}
            />
          </div>

          <div className="max-h-[70vh] flex-1 overflow-y-auto bg-[#0B0E13] p-4">
            {device === "mobile" ? (
              <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[20px] border border-border bg-white shadow-elevated">
                <div className="h-6 border-b border-black/5 bg-[#F1F1F1]" />
                <div className="max-h-[62vh] overflow-y-auto">
                  <StorefrontLayout
                    store={draft}
                    specs={product.specs}
                    buyBox={previewBuyBox}
                  />
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-border">
                <StorefrontLayout
                  store={draft}
                  specs={product.specs}
                  buyBox={previewBuyBox}
                />
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <DemoNote>
              Preview only — the published storefront is where demo checkout
              happens.
            </DemoNote>
          </div>
        </div>
      </div>
    </>
  );
}
