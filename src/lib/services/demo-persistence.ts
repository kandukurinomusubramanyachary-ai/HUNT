import { useHuntStore } from '@/store/hunt-store';
import { commerceSnapshotSchema } from '@/lib/commerce-schema';
let initialization: Promise<void> | null = null;
let saves = Promise.resolve();
function snapshot() {
  const { stores, orders, traffic, transactions, activities, creatives } = useHuntStore.getState();
  return { stores, orders, traffic, transactions, activities, creatives };
}
export function flushDemoPersistence() { return saves; }
export function connectDemoPersistence(): Promise<void> {
  if (initialization) return initialization;
  initialization = (async () => {
    const response = await fetch('/api/demo/state', { cache:'no-store', signal:AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Demo database HTTP ${response.status}`);
    const body: unknown = await response.json();
    const parsed = commerceSnapshotSchema.parse(body);
    if (parsed.initialized) { const { initialized, ...records } = parsed; useHuntStore.setState(records); }
    let last = JSON.stringify(snapshot());
    async function save(payload: string) {
      const result = await fetch('/api/demo/state', { method:'POST', headers:{'Content-Type':'application/json'}, body:payload });
      if (!result.ok) throw new Error(`Demo save HTTP ${result.status}`);
    }
    await save(last);
    useHuntStore.subscribe(() => {
      const payload = JSON.stringify(snapshot()); if(payload === last) return; last = payload;
      saves = saves.catch(() => {}).then(() => save(payload));
    });
  })();
  return initialization;
}
