"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QuantityStepper, storefrontTheme } from "@/components/stores/storefront-sections";
import { createDemoOrder } from "@/lib/services/orders";
import { formatCurrency } from "@/lib/utils";
import type { Order, Store } from "@/types";

export function DemoCheckout({
  store,
  quantity,
  onQuantityChange,
  onComplete,
}: {
  store: Store;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onComplete: (order: Order) => void;
}) {
  const theme = storefrontTheme(store);
  const [customerName, setCustomerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{
    customerName?: string;
    email?: string;
    quantity?: string;
  }>({});
  const [submitting, setSubmitting] = React.useState(false);

  const submissionLocked = React.useRef(false);
  const pendingTimer = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current); }, []);
  const total = quantity * store.price;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submissionLocked.current) return;
    submissionLocked.current = true;
    setSubmitting(true);
    // Brief delay so the simulated async step feels like a real request.
    pendingTimer.current = window.setTimeout(() => {
      const result = createDemoOrder({
        storeId: store.id,
        quantity,
        customerName,
        email,
      });
      pendingTimer.current = null;
      if (!result.ok || !result.order) {
        submissionLocked.current = false;
        setSubmitting(false);
        setErrors(result.errors ?? {});
        return;
      }
      setErrors({});
      onComplete(result.order);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DemoBadge label="Demo Mode" />
      <div
        className="rounded-lg border px-3 py-2.5"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <p className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: theme.text }}>
          <ShieldCheck className="size-3.5" style={{ color: theme.accent }} />
          Demo checkout — no payment collected
        </p>
        <p className="mt-1 text-[11px] leading-4" style={{ color: theme.muted }}>
          This form records a simulated order in the demo database. No card details
          are requested and nothing is charged.
        </p>
      </div>

      <Field
        label="Customer name"
        htmlFor="checkout-name"
        error={errors.customerName}
      >
        <Input
          id="checkout-name"
          value={customerName}
          autoComplete="name"
          placeholder="Aarav Sharma"
          invalid={Boolean(errors.customerName)}
          onChange={(event) => setCustomerName(event.target.value)}
        />
      </Field>

      <Field label="Email" htmlFor="checkout-email" error={errors.email}>
        <Input
          id="checkout-email"
          type="email"
          value={email}
          autoComplete="email"
          placeholder="aarav@example.com"
          invalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field label="Quantity" error={errors.quantity}>
        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            quantity={quantity}
            onChange={onQuantityChange}
            theme={theme}
          />
          <span className="tabular text-[13px]" style={{ color: theme.muted }}>
            {formatCurrency(store.price)} each
          </span>
        </div>
      </Field>

      <div
        className="flex items-center justify-between border-t pt-3"
        style={{ borderColor: theme.border }}
      >
        <span className="text-[13px]" style={{ color: theme.muted }}>
          Order total
        </span>
        <span className="tabular text-[18px] font-semibold" style={{ color: theme.text }}>
          {formatCurrency(total)}
        </span>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? <Loader2 className="animate-spin" /> : null}
        {submitting ? "Recording demo order…" : "Complete demo order"}
      </Button>
    </form>
  );
}

export function CheckoutSuccess({
  order,
  onReturnToStore,
  onViewAnalytics,
}: {
  order: Order;
  onReturnToStore: () => void;
  onViewAnalytics: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <DemoBadge label="Demo Mode" />
      <span className="flex size-12 items-center justify-center rounded-full border border-positive/30 bg-positive/10">
        <CheckCircle2 className="size-6 text-positive" />
      </span>
      <div>
        <h3 className="text-[17px] font-semibold text-text">Order confirmed</h3>
        <p className="mt-1.5 text-[13px] text-text-secondary">
          Demo order recorded for {order.storeName}. No payment was collected and
          nothing will be shipped.
        </p>
      </div>

      <dl className="w-full rounded-[10px] border border-border bg-elevated/50 p-3 text-left">
        {[
          { label: "Order", value: order.id.slice(-8).toUpperCase() },
          { label: "Item", value: `${order.quantity} × ${order.storeName}` },
          { label: "Total", value: formatCurrency(order.total) },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-1 text-[12px]"
          >
            <dt className="text-text-muted">{row.label}</dt>
            <dd className="tabular font-medium text-text">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex w-full flex-col gap-2">
        <Button variant="primary" onClick={onViewAnalytics} className="w-full">
          View analytics
        </Button>
        <Button variant="secondary" onClick={onReturnToStore} className="w-full">
          Return to store
        </Button>
      </div>
    </div>
  );
}
