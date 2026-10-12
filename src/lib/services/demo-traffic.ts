import { useHuntStore } from '@/store/hunt-store';
import { uid } from '@/lib/utils';
import type { TrafficRecord } from '@/types';

export function recordDemoTraffic(storeId: string, kind: 'visit' | 'checkout', eventId: string): void {
  const event: TrafficRecord = { id: eventId, storeId, date: new Date().toISOString().slice(0,10),
    visitors: kind === 'visit' ? 1 : 0, productViews: kind === 'visit' ? 1 : 0,
    checkoutStarts: kind === 'checkout' ? 1 : 0, adSpend: 0, isDemo: true };
  useHuntStore.setState(state => {
    if (!state.stores.some(store => store.id === storeId) || state.traffic.some(record => record.id === eventId)) return state;
    return { traffic: [...state.traffic, event] };
  });
}
const fallbackVisits = new Map<string,string>();
/** One measured demo visitor per browser session, store and UTC day. No generated traffic. */
export function recordDemoVisit(storeId: string): void {
  const key = `hunt-demo-visit:${storeId}:${new Date().toISOString().slice(0,10)}`;
  let id: string;
  try {
    id = sessionStorage.getItem(key) || uid('demo-visit');
    sessionStorage.setItem(key,id);
  } catch {
    id = fallbackVisits.get(key) || uid('demo-visit'); fallbackVisits.set(key,id);
  }
  recordDemoTraffic(storeId,'visit',id);
}
