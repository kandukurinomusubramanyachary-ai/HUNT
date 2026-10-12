import { useHuntStore } from "@/store/hunt-store";
import { relativeTime } from "@/lib/utils";
import type { ActivityEventType } from "@/types";

/**
 * Activity feed — merges stored events with order records so the dashboard
 * always reflects what actually happened in the frontend state.
 */

export interface ActivityItem {
  id: string;
  eventType: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  isDemo: boolean;
  storeId?: string;
  href?: string;
}

export function getRecentActivity(limit = 8): ActivityItem[] {
  const state = useHuntStore.getState();

  const stored: ActivityItem[] = state.activities.map((event) => ({
    id: event.id,
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp,
    isDemo: event.isDemo,
    storeId: event.storeId,
    href: event.storeId ? `/stores?store=${event.storeId}` : undefined,
  }));

  const orderEvents: ActivityItem[] = [...state.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 14)
    .map((order) => ({
      id: `order-${order.id}`,
      eventType: "order-completed" as ActivityEventType,
      title: `Demo order recorded · ${order.storeName}`,
      description: `${order.productId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")} × ${order.quantity}`,
      timestamp: order.createdAt,
      isDemo: true,
      storeId: order.storeId,
      href: `/stores?store=${order.storeId}`,
    }));

  return [...stored, ...orderEvents]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export function pushActivity(event: {
  storeId?: string;
  eventType: ActivityEventType;
  title: string;
  description: string;
  isDemo: boolean;
}): void {
  useHuntStore.getState().pushActivity(event);
}

export function formatActivityTime(timestamp: string, now: number): string {
  return relativeTime(timestamp, now);
}
