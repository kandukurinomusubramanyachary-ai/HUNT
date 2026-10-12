import { useHuntStore } from "@/store/hunt-store";
import type { Order } from "@/types";

/**
 * Order service — the single source of truth for simulated order records.
 * Demo checkouts write here, and analytics / wallet read from the same records.
 */

export function getOrders(): Order[] {
  return useHuntStore.getState().orders;
}

export function getOrdersForStore(storeId: string): Order[] {
  return getOrders().filter((order) => order.storeId === storeId);
}

export function getRecentOrders(limit = 8): Order[] {
  return [...getOrders()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export interface CheckoutInput {
  storeId: string;
  quantity: number;
  customerName: string;
  email: string;
}

export interface CheckoutResult {
  ok: boolean;
  order?: Order;
  errors?: { customerName?: string; email?: string; quantity?: string };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function createDemoOrder(input: CheckoutInput): CheckoutResult {
  const errors: CheckoutResult["errors"] = {};

  if (!input.customerName.trim()) {
    errors.customerName = "Customer name is required.";
  }
  if (!input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!Number.isFinite(input.quantity) || input.quantity < 1) {
    errors.quantity = "Quantity must be at least 1.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const order = useHuntStore.getState().createDemoOrder({
    storeId: input.storeId,
    quantity: input.quantity,
    customerName: input.customerName,
  });

  return order ? { ok: true, order } : { ok: false };
}

export function orderCountForStore(storeId: string): number {
  return getOrdersForStore(storeId).filter(
    (order) => order.status !== "refunded",
  ).length;
}
