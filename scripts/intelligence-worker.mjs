import { database, getState, setState, runDiscovery, intervalMs } from '../src/lib/intelligence/engine.mjs';
const db = database();
let stopping = false;
const heartbeat = () => setState(db, 'worker', { heartbeat: new Date().toISOString(), pid: process.pid, interval_ms: intervalMs });
heartbeat();
const pulse = setInterval(heartbeat, 20_000);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stopping = true; });
console.log('HUNT intelligence worker started; scheduled interval', intervalMs);
do {
  const last = db.prepare('SELECT finished FROM runs WHERE finished IS NOT NULL ORDER BY finished DESC LIMIT 1').get();
  if (!last || Date.now() - Date.parse(last.finished) >= intervalMs || process.argv.includes('--once')) {
    try { console.log(JSON.stringify(await runDiscovery(db))); } catch (error) { console.error('Discovery failed:', error.message); }
  }
  if (process.argv.includes('--once')) break;
  await new Promise(resolve => setTimeout(resolve, 1000));
} while (!stopping);
clearInterval(pulse); db.close();
