import { z } from 'zod';
import { database } from './intelligence/engine.mjs';

const id = z.string().min(1).max(200);
const text = z.string().max(20000);
const money = z.number().finite().nonnegative();
const record = fields => z.object({ id, isDemo: z.literal(true), ...fields }).passthrough();
const schemas = {
  stores: record({ slug: id, name: text, productId: id, price: money, createdAt: z.string().datetime(), status: z.enum(['live', 'draft', 'paused']) }),
  orders: record({ storeId: id, productId: id, quantity: z.number().int().min(1).max(99), unitPrice: money, total: money, status: z.enum(['completed', 'pending', 'refunded']), createdAt: z.string().datetime() }).refine(order => Math.abs(order.total - order.quantity * order.unitPrice) < .01, 'Order total does not match quantity and price'),
  traffic: record({ storeId: id, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), visitors: z.number().int().nonnegative(), productViews: z.number().int().nonnegative(), checkoutStarts: z.number().int().nonnegative(), adSpend: money }),
  transactions: record({ storeId: id, type: z.enum(['sale-credit', 'marketing-debit', 'operating-debit']), amount: money, status: z.enum(['settled', 'pending']), timestamp: z.string().datetime() }),
  activities: record({ eventType: text, timestamp: z.string().datetime() }),
  creatives: record({ productId: id, createdAt: z.string().datetime(), headline: text, body: text, caption: text, videoPrompt: text }),
};
export const snapshotSchema = z.object(Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [key, z.array(schema).max(20000).default([])]))).strict();

export function commerceDatabase(path) {
  const db = database(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores(id TEXT PRIMARY KEY, slug TEXT NOT NULL, product_id TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, store_id TEXT NOT NULL, total REAL NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, store_id TEXT, event_type TEXT NOT NULL, session_id TEXT, created_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS traffic(id TEXT PRIMARY KEY, store_id TEXT NOT NULL, date TEXT NOT NULL, visitors INTEGER NOT NULL, product_views INTEGER NOT NULL, checkout_starts INTEGER NOT NULL, ad_spend REAL NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY, store_id TEXT NOT NULL, order_id TEXT, category TEXT NOT NULL, type TEXT NOT NULL, amount REAL NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS ledger_order_credit ON ledger(order_id) WHERE order_id IS NOT NULL;
    CREATE TABLE IF NOT EXISTS creatives(id TEXT PRIMARY KEY, provider TEXT NOT NULL, model TEXT NOT NULL, created_at TEXT NOT NULL, source_product_id TEXT NOT NULL, payload TEXT NOT NULL);
  `);
  return db;
}

export function readCommerce(db) {
  const activeRow = db.prepare("SELECT payload FROM state WHERE key='commerce-active-ids'").get();
  const active = activeRow ? JSON.parse(activeRow.payload) : null;
  const ids = key => JSON.stringify(active?.[key] || []);
  const read = (table, key = table) => db.prepare(`SELECT payload FROM ${table} WHERE id IN (SELECT value FROM json_each(?)) ORDER BY rowid DESC`).all(ids(key)).map(row => JSON.parse(row.payload));
  const orderTotals = db.prepare("SELECT COUNT(*) AS orders, COALESCE(SUM(CAST(ROUND(total*100) AS INTEGER)),0)/100.0 AS revenue FROM orders WHERE status='completed' AND id IN (SELECT value FROM json_each(?))").get(ids('orders'));
  const trafficTotals = db.prepare('SELECT COALESCE(SUM(visitors),0) AS visitors, COALESCE(SUM(product_views),0) AS productViews, COALESCE(SUM(checkout_starts),0) AS checkoutStarts FROM traffic WHERE id IN (SELECT value FROM json_each(?))').get(ids('traffic'));
  const ledgerTotals = db.prepare("SELECT COALESCE(SUM(CASE WHEN type='sale-credit' THEN CAST(ROUND(amount*100) AS INTEGER) ELSE 0 END),0)/100.0 AS credits, COALESCE(SUM(CASE WHEN type!='sale-credit' THEN CAST(ROUND(amount*100) AS INTEGER) ELSE 0 END),0)/100.0 AS expenses, COALESCE(SUM(CASE WHEN status='pending' THEN CASE WHEN type='sale-credit' THEN CAST(ROUND(amount*100) AS INTEGER) ELSE -CAST(ROUND(amount*100) AS INTEGER) END ELSE 0 END),0)/100.0 AS pendingAmount FROM ledger WHERE id IN (SELECT value FROM json_each(?))").get(ids('transactions'));
  const roundMoney = value => Math.round(value * 100) / 100;
  const balance = roundMoney(ledgerTotals.credits - ledgerTotals.expenses);
  return {
    stores: read('stores'), orders: read('orders'), traffic: read('traffic'), transactions: read('ledger', 'transactions'), activities: read('events', 'activities'), creatives: read('creatives'),
    persisted: true, initialized: Boolean(active),
    metrics: { ...orderTotals, ...trafficTotals, uniqueVisitors: trafficTotals.visitors, averageOrderValue: orderTotals.orders ? roundMoney(orderTotals.revenue / orderTotals.orders) : 0, conversionRate: trafficTotals.visitors ? orderTotals.orders / trafficTotals.visitors * 100 : 0, checkoutCompletionRate: trafficTotals.checkoutStarts ? orderTotals.orders / trafficTotals.checkoutStarts * 100 : 0, ...ledgerTotals, balance, availableBalance: roundMoney(balance - ledgerTotals.pendingAmount), settledAmount: roundMoney(balance - ledgerTotals.pendingAmount) },
  };
}

export function writeCommerce(db, input) {
  const snapshot = snapshotSchema.parse(input);
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const store of snapshot.stores) db.prepare('INSERT INTO stores VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,payload=excluded.payload').run(store.id, store.slug, store.productId, store.createdAt, JSON.stringify(store));
    const storeExists = value => Boolean(db.prepare('SELECT id FROM stores WHERE id=?').get(value));
    for (const order of snapshot.orders) {
      if (!storeExists(order.storeId)) throw new Error('Order references an unknown store');
      db.prepare('INSERT INTO orders VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').run(order.id, order.storeId, order.total, order.status, order.createdAt, JSON.stringify(order));
    }
    for (const item of snapshot.traffic) {
      if (!storeExists(item.storeId)) throw new Error('Traffic references an unknown store');
      db.prepare('INSERT INTO traffic VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET visitors=excluded.visitors,product_views=excluded.product_views,checkout_starts=excluded.checkout_starts,ad_spend=excluded.ad_spend,payload=excluded.payload').run(item.id, item.storeId, item.date, item.visitors, item.productViews, item.checkoutStarts, item.adSpend, JSON.stringify(item));
      const event = { ...item, persistenceTraffic: true };
      db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').run(`traffic:${item.id}`, item.storeId, item.checkoutStarts ? 'checkout-start' : 'store-visit', item.id, `${item.date}T00:00:00.000Z`, JSON.stringify(event));
    }
    for (const item of snapshot.transactions) {
      if (!storeExists(item.storeId)) throw new Error('Ledger references an unknown store');
      const orderId = item.type === 'sale-credit' ? item.id.replace(/-txn$/, '') : null;
      const category = item.type === 'sale-credit' ? 'revenue' : item.type === 'marketing-debit' ? 'marketing' : 'operating';
      if (orderId) {
        if (item.id !== `${orderId}-txn`) throw new Error('Sale credit must use its order transaction ID');
        const order = db.prepare('SELECT total,store_id FROM orders WHERE id=?').get(orderId);
        if (!order || order.store_id !== item.storeId || Math.abs(order.total - item.amount) >= .01) throw new Error('Sale credit must match its order');
      }
      const payload = { ...item, orderId, category };
      db.prepare('INSERT INTO ledger VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').run(item.id, item.storeId, orderId, category, item.type, item.amount, item.status, item.timestamp, JSON.stringify(payload));
    }
    for (const item of snapshot.activities) db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').run(item.id, item.storeId || null, item.eventType, null, item.timestamp, JSON.stringify(item));
    for (const item of snapshot.creatives) {
      const payload = { ...item, provider: 'Template (deterministic)', model: 'template-v1', sourceProductId: item.productId, source_product_id: item.productId, created_at: item.createdAt };
      db.prepare('INSERT INTO creatives VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').run(item.id, payload.provider, payload.model, item.createdAt, item.productId, JSON.stringify(payload));
    }
    const activeIds = Object.fromEntries(Object.entries(snapshot).map(([key, rows]) => [key, rows.map(row => row.id)]));
    db.prepare("INSERT INTO state(key,payload) VALUES ('commerce-active-ids',?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload").run(JSON.stringify(activeIds));
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  return readCommerce(db);
}
