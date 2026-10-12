"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Compass,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

import { ALL_NAV_ITEMS } from "@/lib/nav";
import { getProducts } from "@/lib/services/products";
import { useHuntStore } from "@/store/hunt-store";
import { cn } from "@/lib/utils";

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const stores = useHuntStore((state) => state.stores);
  const products = React.useMemo(() => getProducts(), []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = React.useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex h-9 items-center gap-2 rounded-btn border border-border bg-bg px-2.5 text-[13px] text-text-muted transition-colors duration-150 hover:border-[#38414F] hover:text-text-secondary",
          className,
        )}
        aria-label="Search HUNT"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden sm:inline">Search products, stores…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-text-muted md:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global search"
        className="bg-elevated"
        overlayClassName="fixed inset-0 z-[79] bg-[#04060A]/80 backdrop-blur-[2px]"
        contentClassName="fixed left-1/2 top-[16vh] z-[80] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[14px] border border-border bg-elevated shadow-elevated"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-text-muted" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search products, stores and pages…"
            className="h-12 w-full bg-transparent text-body text-text outline-none placeholder:text-text-muted"
          />
        </div>
        <Command.List className="max-h-[52vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-secondary text-text-muted">
            No matches for “{query}”.
          </Command.Empty>

          <Command.Group
            heading="Pages"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
          >
            {ALL_NAV_ITEMS.map((item) => (
              <Command.Item
                key={item.href}
                value={`page ${item.label} ${item.description}`}
                onSelect={() => run(item.href)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary data-[selected=true]:bg-[#232A36] data-[selected=true]:text-text"
              >
                <item.icon className="size-4 text-text-muted" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="hidden truncate text-[11px] text-text-muted sm:block">
                  {item.description}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Products"
            className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
          >
            {products.map((product) => (
              <Command.Item
                key={product.id}
                value={`product ${product.name} ${product.category} ${product.tagline}`}
                onSelect={() => run(`/products/${product.id}`)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary data-[selected=true]:bg-[#232A36] data-[selected=true]:text-text"
              >
                <Package className="size-4 text-text-muted" />
                <span className="flex-1 truncate">{product.name}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <Sparkles className="size-3" />
                  {product.opportunityScore}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Stores"
            className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
          >
            {stores.length === 0 ? (
              <Command.Item
                value="no stores yet"
                onSelect={() => run("/stores/new")}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary data-[selected=true]:bg-[#232A36]"
              >
                <Store className="size-4 text-text-muted" />
                No stores yet — launch your first store
              </Command.Item>
            ) : (
              stores.map((store) => (
                <Command.Item
                  key={store.id}
                  value={`store ${store.name} ${store.slug}`}
                  onSelect={() => run(`/store/${store.slug}`)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary data-[selected=true]:bg-[#232A36] data-[selected=true]:text-text"
                >
                  <ShoppingBag className="size-4 text-text-muted" />
                  <span className="flex-1 truncate">{store.name}</span>
                  <span className="text-[11px] text-text-muted">
                    /{store.slug}
                  </span>
                </Command.Item>
              ))
            )}
          </Command.Group>

          <Command.Group className="mt-1">
            <Command.Item
              value="go to opportunities shortlist"
              onSelect={() => run("/opportunities")}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-body text-text-secondary data-[selected=true]:bg-[#232A36] data-[selected=true]:text-text"
            >
              <Compass className="size-4 text-text-muted" />
              Open saved opportunities
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
