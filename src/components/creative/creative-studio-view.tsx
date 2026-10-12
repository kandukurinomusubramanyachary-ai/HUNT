"use client";

import * as React from "react";
import Link from "next/link";
import {
  Copy,
  CopyPlus,
  History,
  Megaphone,
  MonitorPlay,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { CompetitorAdCard } from "@/components/creative/competitor-ad-card";
import { DemoBadge, DemoNote } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  AUDIENCES,
  FORMATS,
  OBJECTIVES,
  PLATFORMS,
  TONES,
  generateDemoCreative,
} from "@/lib/services/creatives";
import { getProductById, getProducts } from "@/lib/services/products";
import { useHuntStore } from "@/store/hunt-store";
import { cn, formatCurrency } from "@/lib/utils";
import type { Creative, CreativeFormat, Platform } from "@/types";

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

function AdPreview({
  creative,
  image,
  productName,
  price,
}: {
  creative: Creative;
  image: string;
  productName: string;
  price: number;
}) {
  if (creative.format === "video") {
    return (
      <div className="overflow-hidden rounded-[10px] border border-border bg-[#0B0E13]">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[11px] text-text-muted">
            {PLATFORM_LABEL[creative.platform]} · 9:16 · 15s concept
          </span>
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <MonitorPlay className="size-3" />
            Storyboard
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 p-3">
          {creative.storyboard.map((scene) => (
            <div key={scene.id} className="flex flex-col gap-1.5">
              <div className="relative aspect-[9/16] overflow-hidden rounded-md border border-border bg-gradient-to-b from-[#1A2029] to-[#0D1016]">
                <img
                  src={image}
                  alt=""
                  className="size-full object-cover opacity-45"
                />
                <span className="absolute bottom-1 left-1 rounded bg-[#090B10]/85 px-1 text-[9px] text-text-secondary">
                  {scene.time}
                </span>
              </div>
              <p className="text-[10px] font-medium leading-3 text-text">
                {scene.onScreenText}
              </p>
              <p className="line-clamp-3 text-[9px] leading-3 text-text-muted">
                {scene.visual}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (creative.format === "carousel") {
    return (
      <div className="overflow-hidden rounded-[10px] border border-border bg-[#0B0E13]">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[11px] text-text-muted">
            {PLATFORM_LABEL[creative.platform]} · carousel · 3 cards
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="overflow-hidden rounded-md border border-border"
            >
              <div className="relative aspect-square bg-[#0D1016]">
                <img
                  src={image}
                  alt=""
                  className="size-full object-cover opacity-80"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090B10] to-transparent p-2">
                  <p className="line-clamp-2 text-[10px] font-semibold leading-3 text-text">
                    {index === 0
                      ? creative.headline
                      : index === 1
                        ? creative.hooks[index - 1]
                        : creative.callToAction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-3 py-2.5">
          <p className="text-[11px] text-text-muted">
            Card 1 hook · Card 2 proof · Card 3 offer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-[#0B0E13]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="size-5 rounded-full bg-gradient-to-br from-brand/80 to-info/70" />
        <span className="text-[11px] font-medium text-text">
          {productName}
        </span>
        <span className="ml-auto text-[11px] text-text-muted">
          {PLATFORM_LABEL[creative.platform]} · static
        </span>
      </div>
      <div className="relative aspect-[4/5] bg-[#0D1016] sm:aspect-[16/10]">
        <img src={image} alt="" className="size-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[16px] font-semibold leading-6 text-text">
            {creative.headline}
          </p>
          <p className="mt-1.5 line-clamp-3 text-[12px] leading-5 text-text-secondary">
            {creative.body}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2.5">
        <div>
          <p className="text-[12px] font-medium text-text">
            {creative.callToAction}
          </p>
          <p className="tabular text-[11px] text-text-muted">
            {formatCurrency(price)} · demo store
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary">
          Learn more
        </span>
      </div>
    </div>
  );
}

export function CreativeStudioView() {
  const products = React.useMemo(() => getProducts(), []);
  const creatives = useHuntStore((state) => state.creatives);
  const saveCreative = useHuntStore((state) => state.saveCreative);
  const deleteCreative = useHuntStore((state) => state.deleteCreative);

  const [productId, setProductId] = React.useState(products[0].id);
  const [platform, setPlatform] = React.useState<Platform>("instagram");
  const [format, setFormat] = React.useState<CreativeFormat>("static");
  const [objective, setObjective] = React.useState(OBJECTIVES[0]);
  const [audience, setAudience] = React.useState(AUDIENCES[0]);
  const [tone, setTone] = React.useState(TONES[0]);
  const [variant, setVariant] = React.useState(0);
  const [creative, setCreative] = React.useState<Creative | null>(null);

  const product = getProductById(productId) ?? products[0];

  const generate = React.useCallback(
    (nextVariant?: number) => {
      const useVariant = nextVariant ?? variant;
      const next = generateDemoCreative(product, {
        platform,
        format,
        objective,
        audience,
        tone,
        variant: useVariant,
      });
      setCreative(next);
      setVariant((useVariant + 1) % 3);
    },
    [product, platform, format, objective, audience, tone, variant],
  );

  React.useEffect(() => {
    if (!creative) generate(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creative]);

  const regenerate = () => generate();
  const saved = creative ? creatives.some((item) => item.id === creative.id) : false;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied`, description: "Pasted-ready text is on your clipboard." });
    } catch {
      toast({
        title: "Unable to copy",
        description: "Your browser blocked clipboard access.",
        tone: "error",
      });
    }
  };

  const handleSave = () => {
    if (!creative) return;
    saveCreative(creative);
    toast({
      title: "Creative saved.",
      description: `${creative.headline} was added to your library.`,
    });
  };

  const handleDuplicate = () => {
    if (!creative) return;
    const createdAt = new Date().toISOString();
    const copy: Creative = {
      ...creative,
      id: `creative-${Math.random().toString(36).slice(2, 9)}`,
      createdAt,
      created_at: createdAt,
    };
    setCreative(copy);
    toast({
      title: "Creative duplicated",
      description: "Edit the copy before saving the new version.",
      tone: "info",
    });
  };

  return (
    <>
      <PageIntro
        title="Creative Studio"
        subtitle="Turn product intelligence into compelling campaigns."
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Commerce" },
          { label: "Ad Studio" },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={regenerate}>
              <RefreshCw />
              Regenerate
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!creative}>
              <Save />
              Save creative
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Configuration */}
        <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 xl:col-span-3">
          <div>
            <h3 className="text-card font-semibold text-text">Campaign</h3>
            <p className="mt-1 text-[12px] text-text-secondary">
              Local template generation — no external AI call.
            </p>
          </div>

          <Field label="Product" htmlFor="creative-product">
            <Select
              value={productId}
              onValueChange={(value) => setProductId(value)}
            >
              <SelectTrigger id="creative-product" aria-label="Product">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Target audience" htmlFor="creative-audience">
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="creative-audience" aria-label="Target audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Platform">
            <div className="grid grid-cols-2 gap-1.5">
              {PLATFORMS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPlatform(item.value)}
                  aria-pressed={platform === item.value}
                  className={cn(
                    "rounded-btn border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                    platform === item.value
                      ? "border-brand/40 bg-brand/10 text-text"
                      : "border-border bg-bg text-text-secondary hover:border-[#38414F]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Campaign objective" htmlFor="creative-objective">
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger id="creative-objective" aria-label="Campaign objective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OBJECTIVES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Brand tone" htmlFor="creative-tone">
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="creative-tone" aria-label="Brand tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Creative format" htmlFor="creative-format">
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as CreativeFormat)}
            >
              <SelectTrigger id="creative-format" aria-label="Creative format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Button variant="primary" onClick={() => generate(0)} className="w-full">
            <Sparkles />
            Generate creative
          </Button>

          <div className="rounded-[10px] border border-border bg-elevated/40 p-3">
            <p className="text-[11px] font-semibold text-text">Source signals</p>
            <p className="mt-1 text-[11px] leading-4 text-text-secondary">
              Copy is assembled from the sample pain points, benefits and
              competitor notes attached to {product.name}.
            </p>
            <Link
              href={`/products/${product.id}`}
              className="mt-2 inline-block text-[11px] font-medium text-info hover:underline"
            >
              View product intelligence
            </Link>
          </div>
        </section>

        {/* Editor */}
        <section className="flex flex-col gap-4 xl:col-span-6">
          {creative ? (
            <>
              <div className="rounded-card border border-border bg-surface p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-card font-semibold text-text">
                      Creative preview
                    </h3>
                    <Badge tone="neutral">{PLATFORM_LABEL[creative.platform]}</Badge>
                    <Badge tone="neutral">
                      {FORMATS.find((item) => item.value === creative.format)?.label}
                    </Badge>
                    <DemoBadge label="Concept mock" />
                    <Badge tone="muted">{creative.provider ?? "Template (deterministic)"} · {creative.model ?? "template-v1"}</Badge>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(creative.caption, "Caption")}
                    >
                      <Copy />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDuplicate}>
                      <CopyPlus />
                      Duplicate
                    </Button>
                  </div>
                </div>

                <AdPreview
                  creative={creative}
                  image={product.image}
                  productName={product.name}
                  price={product.price}
                />

                <div className="mt-5 flex flex-col gap-4">
                  <Field label="Headline" htmlFor="creative-headline">
                    <Input
                      id="creative-headline"
                      value={creative.headline}
                      onChange={(event) =>
                        setCreative({ ...creative, headline: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Body" htmlFor="creative-body">
                    <Textarea
                      id="creative-body"
                      value={creative.body}
                      onChange={(event) =>
                        setCreative({ ...creative, body: event.target.value })
                      }
                    />
                  </Field>
                  <Field
                    label="Caption"
                    htmlFor="creative-caption"
                    hint={`${creative.caption.length} characters`}
                  >
                    <Textarea
                      id="creative-caption"
                      value={creative.caption}
                      className="min-h-[110px]"
                      onChange={(event) =>
                        setCreative({ ...creative, caption: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Call to action" htmlFor="creative-cta">
                    <Input
                      id="creative-cta"
                      value={creative.callToAction}
                      onChange={(event) =>
                        setCreative({
                          ...creative,
                          callToAction: event.target.value,
                        })
                      }
                    />
                  </Field>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={regenerate}>
                    <RefreshCw />
                    Regenerate
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    <Save />
                    {saved ? "Update saved creative" : "Save creative"}
                  </Button>
                </div>
              </div>

              <div className="rounded-card border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-card font-semibold text-text">
                      Video concept
                    </h3>
                    <Badge tone="muted">15s outline</Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(creative.videoPrompt, "Video prompt")}
                  >
                    <Copy />
                    Copy prompt
                  </Button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 text-[11px] font-medium text-text-muted">
                          Time
                        </th>
                        <th className="pb-2 text-[11px] font-medium text-text-muted">
                          Shot
                        </th>
                        <th className="pb-2 text-[11px] font-medium text-text-muted">
                          Visual
                        </th>
                        <th className="pb-2 text-[11px] font-medium text-text-muted">
                          On-screen text
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {creative.storyboard.map((scene) => (
                        <tr
                          key={scene.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          <td className="tabular whitespace-nowrap py-2.5 text-[11px] text-text-secondary">
                            {scene.time}
                          </td>
                          <td className="whitespace-nowrap py-2.5 text-[12px] text-text">
                            {scene.shot}
                          </td>
                          <td className="max-w-[260px] py-2.5 text-[12px] leading-5 text-text-secondary">
                            {scene.visual}
                          </td>
                          <td className="max-w-[180px] py-2.5 text-[12px] text-text">
                            {scene.onScreenText}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-[10px] border border-border bg-elevated/40 p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-text-muted">
                    <MonitorPlay className="size-3" />
                    Higgsfield-ready prompt
                  </p>
                  <p className="text-[12px] leading-5 text-text-secondary">
                    {creative.videoPrompt}
                  </p>
                </div>
                <p className="mt-2 text-[11px] leading-4 text-text-muted">
                  Prompt text is provided for external tools. No video is
                  generated and no API call is made from HUNT.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-card border border-border bg-surface p-6">
              <p className="text-[13px] text-text-secondary">
                Generating creative…
              </p>
            </div>
          )}
        </section>

        {/* References + history */}
        <section className="flex flex-col gap-4 xl:col-span-3">
          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <h3 className="text-card font-semibold text-text">
                Competitor research
              </h3>
              <DemoBadge label="Sample" />
            </div>
            <p className="mt-1 text-[12px] text-text-secondary">
              Positioning notes for {product.name}.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {product.competitors.map((competitor) => (
                <CompetitorAdCard
                  key={competitor.id}
                  competitor={competitor}
                  platform={PLATFORM_LABEL[platform]}
                />
              ))}
            </div>
          </div>

          {creative ? (
            <div className="rounded-card border border-border bg-surface p-5">
              <h3 className="text-card font-semibold text-text">Variations</h3>
              <p className="mt-1 text-[12px] text-text-secondary">
                Click a headline or hook to apply it.
              </p>
              <div className="mt-4">
                <p className="text-[11px] font-medium tracking-wide text-text-muted">
                  Headlines
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {creative.headlineVariants.map((headline) => (
                    <button
                      key={headline}
                      type="button"
                      onClick={() => setCreative({ ...creative, headline })}
                      className={cn(
                        "rounded-[8px] border px-2.5 py-2 text-left text-[12px] leading-4 transition-colors",
                        creative.headline === headline
                          ? "border-brand/40 bg-brand/10 text-text"
                          : "border-border bg-bg text-text-secondary hover:border-[#38414F]",
                      )}
                    >
                      {headline}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-medium tracking-wide text-text-muted">
                  Ad hooks
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {creative.hooks.map((hook) => (
                    <button
                      key={hook}
                      type="button"
                      onClick={() =>
                        setCreative({
                          ...creative,
                          body: `${hook} ${creative.body}`,
                        })
                      }
                      className="rounded-[8px] border border-border bg-bg px-2.5 py-2 text-left text-[12px] leading-4 text-text-secondary transition-colors hover:border-[#38414F]"
                    >
                      {hook}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <History className="size-4 text-text-muted" />
              <h3 className="text-card font-semibold text-text">
                Generation history
              </h3>
            </div>
            <p className="mt-1 text-[12px] text-text-secondary">
              Saved creatives in this workspace.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {creatives.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No saved creatives yet."
                  description="Generate copy and save it to build your library."
                />
              ) : (
                creatives.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-[10px] border border-border bg-elevated/40 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setCreative(item)}
                        className="block w-full truncate text-left text-[12px] font-medium text-text hover:underline"
                      >
                        {item.headline}
                      </button>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
                        <Badge tone="muted" className="px-1 py-0">
                          {PLATFORM_LABEL[item.platform]}
                        </Badge>
                        {item.format}
                        <span>·</span>
                        <RelativeTime timestamp={item.createdAt} />
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete saved creative ${item.headline}`}
                      onClick={() => {
                        deleteCreative(item.id);
                        toast({
                          title: "Creative deleted",
                          description: "The saved copy was removed.",
                        });
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DemoNote>
            Nothing is published. HUNT does not connect to Meta, TikTok or
            Pinterest in this milestone, and no image or video model is called.
          </DemoNote>
        </section>
      </div>
    </>
  );
}
