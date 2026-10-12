"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { CartDrawer } from "@/components/stores/cart-drawer";
import {
  QuantityStepper,
  StorefrontLayout,
  storefrontTheme,
} from "@/components/stores/storefront-sections";
import { useHydrated } from "@/components/layout/store-hydrator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getProductById } from "@/lib/services/products";
import { recordDemoVisit } from '@/lib/services/demo-traffic';
import { addToCartAction } from "@/lib/services/cart";
import { useHuntStore, type CartItem } from "@/store/hunt-store";
import { formatCurrency } from "@/lib/utils";
import type { Store } from "@/types";

export function StorefrontView() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const hydrated = useHydrated();
  const stores = useHuntStore((state) => state.stores);
  const cart = useHuntStore((state) => state.cart);

  const store = stores.find((item) => item.slug === slug);

  const [quantity, setQuantity] = React.useState(1);
  const [cartOpen, setCartOpen] = React.useState(false);

  const cartItems = React.useMemo(
    () => (store ? cart.filter((item) => item.storeId === store.id) : []),
    [cart, store],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-[13px] text-text-muted">Loading storefront…</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <h1 className="text-[26px] font-semibold text-text">
          Storefront not found
        </h1>
        <p className="max-w-sm text-body text-text-secondary">
          No store with the URL{" "}
          <span className="font-medium text-text">/store/{slug}</span> exists in
          this browser. Stores you create are saved locally.
        </p>
        <Button asChild variant="primary">
          <Link href="/stores">Back to My Stores</Link>
        </Button>
      </div>
    );
  }

  return (
    <StorefrontExperience
      store={store}
      quantity={quantity}
      setQuantity={setQuantity}
      cartItems={cartItems}
      cartOpen={cartOpen}
      setCartOpen={setCartOpen}
    />
  );
}

function StorefrontExperience({
  store,
  quantity,
  setQuantity,
  cartItems,
  cartOpen,
  setCartOpen,
}: {
  store: Store;
  quantity: number;
  setQuantity: (value: number) => void;
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}) {
  const product = getProductById(store.productId);
  React.useEffect(() => { recordDemoVisit(store.id); }, [store.id]);
  const theme = storefrontTheme(store);
  const setCartQuantity = useHuntStore((state) => state.setCartQuantity);
  const removeFromCart = useHuntStore((state) => state.removeFromCart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    addToCartAction(store.id, store.productId, quantity);
    setCartOpen(true);
  };

  const buyBox = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          quantity={quantity}
          onChange={setQuantity}
          theme={theme}
        />
        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.accent, color: "#0B0E13" }}
        >
          <ShoppingBag className="size-4" />
          Add to cart · {formatCurrency(store.price * quantity)}
        </button>
      </div>
      <p className="text-[12px]" style={{ color: theme.muted }}>
        Demo storefront — no payment is collected and nothing is shipped.
      </p>
    </div>
  );

  const navRight = (
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      className="relative inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-opacity hover:opacity-80"
      style={{ borderColor: theme.border, color: theme.text }}
    >
      <ShoppingBag className="size-4" />
      Cart
      {cartCount > 0 ? (
        <span
          className="tabular flex size-5 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ backgroundColor: theme.accent, color: "#0B0E13" }}
        >
          {cartCount}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      <div className="relative">
        <StorefrontLayout
          store={store}
          specs={product?.specs ?? []}
          buyBox={buyBox}
          navRight={navRight}
          onCta={() => {
            const element = document.querySelector("#hero-anchor");
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
        <span id="hero-anchor" className="absolute left-0 top-16" />

        <Link
          href="/dashboard"
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0B0E13]/85 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3" />
          Back to HUNT dashboard
        </Link>
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        store={store}
        items={cartItems}
        onQuantityChange={(productId, next) =>
          setCartQuantity(productId, next)
        }
        onRemove={(productId) => removeFromCart(productId)}
        onOrderComplete={(order) => {
          toast({
            title: "Demo order recorded.",
            description: `${order.quantity} × ${store.productName} · ${formatCurrency(order.total)}`,
          });
        }}
      />
    </>
  );
}
