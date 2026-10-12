"use client";

import * as React from "react";
import Link from "next/link";
import { Compass, PackageSearch } from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { ProductCard } from "@/components/products/product-card";
import {
  ProductFilters,
  type DiscoverFiltersState,
} from "@/components/products/product-filters";
import { SourceIndicatorStrip } from "@/components/products/source-indicator";
import { DemoNote } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  PRODUCT_CATEGORIES,
  getProducts,
  filterProducts,
  toggleSavedProduct,
} from "@/lib/services/products";
import { useHuntStore } from "@/store/hunt-store";
import type { Product } from "@/types";

import { LiveRadar } from './live-intelligence';
export function DiscoverView() {
  const [demo, setDemo] = React.useState(false);
  return demo ? <><div className="mb-4"><Button variant="secondary" onClick={() => setDemo(false)}>Live Mode</Button><span className="ml-3 text-warning">Demo Mode ? sample fixtures</span></div><DemoDiscoverView /></> : <LiveRadar demo={demo} onModeChange={() => setDemo(true)} />;
}
function DemoDiscoverView() {
  const savedProductIds = useHuntStore((state) => state.savedProductIds);
  const [refreshing, setRefreshing] = React.useState(false);
  const [state, setState] = React.useState<DiscoverFiltersState>({
    query: "",
    categories: [],
    sources: [],
    competition: [],
    sort: "score",
    trendWeeks: 12,
  });

  const products = React.useMemo(() => filterProducts(state), [state]);
  const total = getProducts().filter(product => product.isDemo).length;

  const update = (next: Partial<DiscoverFiltersState>) =>
    setState((prev) => ({ ...prev, ...next }));

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Sample analysis refreshed",
        description:
          "Rankings were recalculated from the bundled sample fixtures.",
        tone: "info",
      });
    }, 900);
  };

  const handleSave = (product: Product) => {
    toggleSavedProduct(product.id);
    const saved = !savedProductIds.includes(product.id);
    toast({
      title: saved ? "Opportunity saved" : "Removed from shortlist",
      description: saved
        ? `${product.name} was added to your opportunities shortlist.`
        : `${product.name} was removed from your shortlist.`,
    });
  };

  return (
    <>
      <PageIntro
        title="Opportunity Radar"
        subtitle="Find opportunities before the market gets crowded."
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Intelligence" },
          { label: "Discover" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link href="/opportunities">
              <Compass />
              View shortlist
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <SourceIndicatorStrip />

        <DemoNote>
          These channels represent planned integrations. The signals shown are
          imported sample fixtures, not live scraping or API results.
        </DemoNote>

        <ProductFilters
          state={state}
          onChange={update}
          categories={PRODUCT_CATEGORIES}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          resultCount={products.length}
          totalCount={total}
        />

        {refreshing ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-card border border-border bg-surface"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products match your filters."
            description="Try removing a filter or clearing the search to see the full sample catalogue."
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  setState({
                    query: "",
                    categories: [],
                    sources: [],
                    competition: [],
                    sort: "score",
                    trendWeeks: 12,
                  })
                }
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                saved={savedProductIds.includes(product.id)}
                onToggleSave={handleSave}
                trendWeeks={state.trendWeeks}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
