"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckoutSuccess, DemoCheckout } from "@/components/stores/demo-checkout";
import { flushDemoPersistence } from "@/lib/services/demo-persistence";
import { recordDemoTraffic } from '@/lib/services/demo-traffic';
import { uid } from '@/lib/utils';
import { cn, formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/store/hunt-store";
import type { Order, Store } from "@/types";

export function CartDrawer({
  open,
  onClose,
  store,
  items,
  onQuantityChange,
  onRemove,
  onOrderComplete,
}: {
  open: boolean;
  onClose: () => void;
  store: Store;
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onOrderComplete: (order: Order) => void;
}) {
  const checkoutEventId = React.useRef(uid('demo-checkout-start'));
  const [checkout, setCheckout] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<Order | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (!open) {
      checkoutEventId.current = uid('demo-checkout-start');
      setCheckout(false);
      setCompletedOrder(null);
    } else {
      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      setQuantity(Math.max(total, 1));
    }
  }, [open, items]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * store.price,
    0,
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[#04060A]/70 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed inset-y-0 right-0 z-[61] flex w-full max-w-[420px] flex-col border-l border-border bg-surface shadow-elevated transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-text-secondary" />
            <p className="text-[14px] font-semibold text-text">
              {completedOrder
                ? "Order complete"
                : checkout
                  ? "Demo checkout"
                  : "Your cart"}
            </p>
            {!completedOrder && !checkout ? (
              <span className="tabular rounded-md border border-border bg-elevated px-1.5 text-[11px] text-text-secondary">
                {items.length}
              </span>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close cart"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {completedOrder ? (
            <CheckoutSuccess
              order={completedOrder}
              onReturnToStore={() => {
                setCompletedOrder(null);
                setCheckout(false);
                onClose();
              }}
              onViewAnalytics={async () => {
                await flushDemoPersistence();
                onClose();
                window.location.href = `/analytics?store=${store.id}`;
              }}
            />
          ) : checkout ? (
            <DemoCheckout
              store={store}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onComplete={(order) => {
                setCompletedOrder(order);
                onOrderComplete(order);
              }}
            />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-elevated">
                <ShoppingBag className="size-5 text-text-muted" />
              </span>
              <p className="text-[14px] font-semibold text-text">
                Your cart is empty
              </p>
              <p className="text-[12px] text-text-secondary">
                Add {store.productName} to test the demo checkout flow.
              </p>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Continue shopping
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 rounded-[10px] border border-border bg-elevated/40 p-3"
                >
                  <img
                    src={store.productImage}
                    alt={store.productName}
                    className="size-16 rounded-lg border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-text">
                      {store.productName}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {formatCurrency(store.price)} each
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex h-8 items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="flex h-full w-8 items-center justify-center text-text-secondary hover:text-text"
                          onClick={() =>
                            onQuantityChange(item.productId, item.quantity - 1)
                          }
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="tabular w-8 text-center text-[13px] text-text">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="flex h-full w-8 items-center justify-center text-text-secondary hover:text-text"
                          onClick={() =>
                            onQuantityChange(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${store.productName} from cart`}
                        onClick={() => onRemove(item.productId)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <p className="tabular text-[13px] font-semibold text-text">
                    {formatCurrency(item.quantity * store.price)}
                  </p>
                </div>
              ))}

              <div className="rounded-[10px] border border-border bg-elevated/40 p-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="tabular font-semibold text-text">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted">
                  Shipping and taxes are not calculated in the demo.
                </p>
              </div>
            </div>
          )}
        </div>

        {!completedOrder && !checkout && items.length > 0 ? (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Subtotal</span>
              <span className="tabular text-[17px] font-semibold text-text">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => { recordDemoTraffic(store.id, 'checkout', checkoutEventId.current); setCheckout(true); }}
            >
              Proceed to checkout
            </Button>
            <p className="mt-2 text-center text-[11px] text-text-muted">
              Demo checkout — no payment is collected.
            </p>
          </div>
        ) : null}

        {!completedOrder ? (
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/stores"
              className="text-[11px] text-text-muted hover:text-text-secondary"
            >
              Manage this store in HUNT →
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
