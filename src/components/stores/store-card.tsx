"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RelativeTime } from "@/components/shared/relative-time";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Store, StoreStatus } from "@/types";

const STATUS_TONE: Record<StoreStatus, "positive" | "warning" | "neutral"> = {
  live: "positive",
  draft: "warning",
  paused: "neutral",
};

export function StoreBrandMark({
  store,
  size = "md",
}: {
  store: Store;
  size?: "sm" | "md";
}) {
  const initials = store.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border font-semibold",
        size === "sm" ? "size-8 text-[11px]" : "size-10 text-[13px]",
      )}
      style={{
        borderColor: `${store.branding.accentColor}44`,
        backgroundColor: `${store.branding.accentColor}18`,
        color: store.branding.accentColor,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function StoreCard({
  store,
  stats,
  onDuplicate,
  onDelete,
  onStatusChange,
  highlighted = false,
}: {
  store: Store;
  stats: { orders: number; revenue: number; visitors: number; conversionRate: number };
  onDuplicate: () => void;
  onDelete: () => void;
  onStatusChange: (status: StoreStatus) => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-card border bg-surface transition-colors duration-150 hover:border-[#38414F]",
        highlighted ? "border-brand/50 ring-1 ring-brand/25" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 items-start gap-3">
          <StoreBrandMark store={store} />
          <div className="min-w-0">
            <Link
              href={`/store/${store.slug}`}
              className="truncate text-[14px] font-semibold text-text hover:underline"
            >
              {store.name}
            </Link>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-text-muted">
              hunt.app/store/{store.slug}
              <ExternalLink className="size-3" />
            </p>
            <p className="mt-1 text-[11px] text-text-muted">
              Created{" "}
              <RelativeTime timestamp={store.createdAt} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={STATUS_TONE[store.status]}>{store.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${store.name}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Store status</DropdownMenuLabel>
              {(["live", "draft", "paused"] as StoreStatus[]).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onSelect={() => onStatusChange(status)}
                  disabled={store.status === status}
                >
                  Set to {status}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/stores/new?store=${store.id}`}>
                  <Pencil />
                  Edit store
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDuplicate}>
                <Copy />
                Duplicate store
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem tone="danger" onSelect={onDelete}>
                <Trash2 />
                Delete store
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex gap-3 p-4">
        <img
          src={store.productImage}
          alt={store.productName}
          className="size-16 shrink-0 rounded-lg border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-text">
            {store.productName}
          </p>
          <p className="truncate text-[11px] text-text-muted">
            {store.category} · {store.content.heroHeadline}
          </p>
          <p className="mt-1.5 text-[13px] font-semibold text-text">
            {formatCurrency(store.price)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4">
        <div className="rounded-[8px] border border-border bg-bg/60 px-2.5 py-2">
          <p className="text-[10px] tracking-wide text-text-muted">
            Demo visitors
          </p>
          <p className="tabular mt-0.5 text-[13px] font-semibold text-text">
            {formatNumber(stats.visitors)}
          </p>
        </div>
        <div className="rounded-[8px] border border-border bg-bg/60 px-2.5 py-2">
          <p className="text-[10px] tracking-wide text-text-muted">
            Demo orders
          </p>
          <p className="tabular mt-0.5 text-[13px] font-semibold text-text">
            {formatNumber(stats.orders)}
          </p>
        </div>
        <div className="rounded-[8px] border border-border bg-bg/60 px-2.5 py-2">
          <p className="text-[10px] tracking-wide text-text-muted">
            Conversion
          </p>
          <p className="tabular mt-0.5 text-[13px] font-semibold text-text">
            {formatPercent(stats.conversionRate, 2)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border px-4 py-3">
        <div>
          <p className="text-[10px] tracking-wide text-text-muted">
            Demo revenue
          </p>
          <p className="tabular text-[15px] font-semibold text-text">
            {formatCurrency(stats.revenue)}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/store/${store.slug}`} target="_blank">
              Preview
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/analytics?store=${store.id}`}>
              <BarChart3 />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="secondary" size="icon-sm" aria-label={`Edit ${store.name}`}>
            <Link href={`/stores/new?store=${store.id}`}>
              <Pencil />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
