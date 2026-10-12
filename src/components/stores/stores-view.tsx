"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Plus, Rows3, Search, Store as StoreIcon } from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { useHydrated } from "@/components/layout/store-hydrator";
import { StoreCard } from "@/components/stores/store-card";
import { DemoNote } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteStore, duplicateStore, getStoreStats, setStoreStatus } from "@/lib/services/stores";
import { useHuntStore } from "@/store/hunt-store";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Store, StoreStatus } from "@/types";

type StatusFilter = "all" | StoreStatus;
type ViewMode = "grid" | "list";

export function StoresView() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("store");
  const hydrated = useHydrated();

  const stores = useHuntStore((state) => state.stores);
  const orders = useHuntStore((state) => state.orders);
  const traffic = useHuntStore((state) => state.traffic);

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [view, setView] = React.useState<ViewMode>("grid");
  const { confirm, dialog } = useConfirmDialog();

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stores.filter((store) => {
      const matchesQuery =
        needle.length === 0 ||
        `${store.name} ${store.slug} ${store.productName} ${store.category}`
          .toLowerCase()
          .includes(needle);
      const matchesStatus = status === "all" || store.status === status;
      return matchesQuery && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, query, status]);

  const rows = React.useMemo(
    () => filtered.map((store) => ({ store, stats: getStoreStats(store.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, orders, traffic],
  );

  const handleDelete = (store: Store) => {
    confirm({
      title: `Delete ${store.name}?`,
      description:
        "This removes the storefront along with its demo orders, traffic records and wallet entries. This cannot be undone.",
      confirmLabel: "Delete store",
      onConfirm: () => {
        deleteStore(store.id);
        toast({
          title: "Store deleted",
          description: `${store.name} and its demo records were removed.`,
        });
      },
    });
  };

  const handleDuplicate = (store: Store) => {
    const copy = duplicateStore(store.id);
    if (copy) {
      toast({
        title: "Store duplicated",
        description: `${copy.name} was created as a draft.`,
      });
    } else {
      toast({
        title: "Unable to duplicate store",
        description: "The original store could not be found.",
        tone: "error",
      });
    }
  };

  const handleStatusChange = (store: Store, next: StoreStatus) => {
    setStoreStatus(store.id, next);
    toast({
      title: "Store status updated",
      description: `${store.name} is now ${next}.`,
    });
  };

  return (
    <>
      <PageIntro
        title="My Stores"
        subtitle="Every storefront you have launched, with demo performance."
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Commerce" },
          { label: "My Stores" },
        ]}
        actions={
          <Button asChild variant="primary">
            <Link href="/stores/new">
              <Plus />
              Create new store
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stores"
            className="pl-9"
            aria-label="Search stores"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            ariaLabel="Status filter"
            value={status}
            onChange={setStatus}
            size="sm"
            options={[
              { value: "all", label: "All" },
              { value: "live", label: "Live" },
              { value: "draft", label: "Draft" },
              { value: "paused", label: "Paused" },
            ]}
          />
          <div className="inline-flex items-center gap-0.5 rounded-btn border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              className={cn(
                "rounded-[6px] p-1.5 transition-colors",
                view === "grid"
                  ? "bg-elevated text-text shadow-card"
                  : "text-text-secondary hover:text-text",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
              className={cn(
                "rounded-[6px] p-1.5 transition-colors",
                view === "list"
                  ? "bg-elevated text-text shadow-card"
                  : "text-text-secondary hover:text-text",
              )}
            >
              <Rows3 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {!hydrated ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[280px] w-full rounded-card" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="No stores yet. Launch your first store."
          description="Pick a product from the Opportunity Radar and HUNT will generate a storefront you can preview and test."
          action={
            <Button asChild variant="primary">
              <Link href="/discover">Browse opportunities</Link>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No stores match your filters."
          description="Try a different search term or clear the status filter."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ store, stats }) => (
            <StoreCard
              key={store.id}
              store={store}
              stats={stats}
              highlighted={store.id === highlightId}
              onDelete={() => handleDelete(store)}
              onDuplicate={() => handleDuplicate(store)}
              onStatusChange={(next) => handleStatusChange(store, next)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-[11px] font-medium text-text-muted">
                  Store
                </th>
                <th className="px-5 py-3 text-[11px] font-medium text-text-muted">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium text-text-muted">
                  Demo visitors
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium text-text-muted">
                  Demo orders
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium text-text-muted">
                  Demo revenue
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium text-text-muted">
                  Conversion
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ store, stats }) => (
                <tr
                  key={store.id}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    store.id === highlightId && "bg-brand/[0.05]",
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={store.productImage}
                        alt=""
                        className="size-9 rounded-lg border border-border object-cover"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/store/${store.slug}`}
                          className="truncate text-[13px] font-medium text-text hover:underline"
                        >
                          {store.name}
                        </Link>
                        <p className="truncate text-[11px] text-text-muted">
                          /{store.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-text-secondary">
                    {store.status}
                  </td>
                  <td className="tabular px-5 py-3 text-right text-[13px] text-text">
                    {formatNumber(stats.visitors)}
                  </td>
                  <td className="tabular px-5 py-3 text-right text-[13px] text-text">
                    {formatNumber(stats.orders)}
                  </td>
                  <td className="tabular px-5 py-3 text-right text-[13px] text-text">
                    {formatCurrency(stats.revenue)}
                  </td>
                  <td className="tabular px-5 py-3 text-right text-[13px] text-text-secondary">
                    {formatPercent(stats.conversionRate, 2)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/store/${store.slug}`} target="_blank">
                          Preview
                        </Link>
                      </Button>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/stores/new?store=${store.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(store)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-negative hover:bg-negative/10"
                        onClick={() => handleDelete(store)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5">
        <DemoNote>
          Store records are saved in this browser and survive a refresh. Preview
          links open the customer-facing storefront in a new tab.
        </DemoNote>
      </div>

      {dialog}
    </>
  );
}
