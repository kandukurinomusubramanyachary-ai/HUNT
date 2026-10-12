import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { commerceDatabase, writeCommerce } from '../src/lib/commerce-persistence.mjs';

const external = createRequire(import.meta.url);
const ts = external('typescript');
const modules = new Map();
function load(file) {
  const path = resolve(file);
  if (modules.has(path)) return modules.get(path).exports;
  const module = { exports: {} }; modules.set(path, module);
  const source = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const require = specifier => specifier.startsWith('@/') ? load(resolve('src', specifier.slice(2) + '.ts')) : specifier.startsWith('.') ? load(resolve(dirname(path), specifier + '.ts')) : external(specifier);
  new Function('require', 'module', 'exports', source)(require, module, module.exports);
  return module.exports;
}
const { summarise, filterOrders, buildSeries } = load('src/lib/analytics.ts');
const createdAt = '2026-10-12T08:00:00.000Z';
const date = createdAt.slice(0, 10);
const store = { id: 'analytics-fixture-store', slug: 'analytics-fixture-store', name: 'Labeled analytics fixture', productId: 'fixture-product', price: 100, createdAt, status: 'live', isDemo: true };
const order = (id, status, total) => ({ id, storeId: store.id, productId: store.productId, quantity: 1, unitPrice: total, total, status, createdAt, isDemo: true });
const orders = [order('completed-a', 'completed', 100), order('completed-b', 'completed', 200), order('pending-a', 'pending', 900), order('refunded-a', 'refunded', 800)];
const traffic = (visitors, checkoutStarts) => [{ id: `traffic-${visitors}-${checkoutStarts}`, storeId: store.id, date, visitors, productViews: visitors, checkoutStarts, adSpend: 0, isDemo: true }];
const range = { start: date, end: date };
mkdirSync('test-results', { recursive: true });
const database = commerceDatabase(`test-results/analytics-consistency-${process.pid}.sqlite`);
test.after(() => database.close());

test('frontend and SQLite distinguish visitor conversion from checkout completion and count completed orders only', () => {
  const events = traffic(10, 4);
  const frontend = summarise(events, orders, () => 0);
  const persisted = writeCommerce(database, { stores: [store], orders, traffic: events, transactions: [], activities: [], creatives: [] });
  assert.equal(frontend.orders, 2); assert.equal(frontend.revenue, 300); assert.equal(frontend.averageOrderValue, 150);
  assert.equal(frontend.conversionRate, 20); assert.equal(frontend.checkoutCompletionRate, 50);
  for (const key of ['orders', 'revenue', 'visitors', 'checkoutStarts', 'conversionRate', 'checkoutCompletionRate', 'averageOrderValue']) assert.equal(frontend[key], persisted.metrics[key], key);
  assert.equal(filterOrders(orders, [store.id], range).length, 2);
  const series = buildSeries(events, orders, range, 'day');
  assert.equal(series[0].orders, 2); assert.equal(series[0].revenue, 300);
  const sql = database.prepare("SELECT COUNT(*) AS orders,SUM(total) AS revenue FROM orders WHERE status='completed'").get();
  assert.equal(sql.orders, 2); assert.equal(sql.revenue, 300);
  console.log(JSON.stringify({ fixture: 'explicit analytics consistency fixture', SQL: sql, visitors: 10, checkoutStarts: 4, frontendConversion: frontend.conversionRate, APIConversion: persisted.metrics.conversionRate, frontendCheckoutCompletion: frontend.checkoutCompletionRate, APICheckoutCompletion: persisted.metrics.checkoutCompletionRate }));
});

test('both frontend and SQLite return zero when a rate denominator is zero', () => {
  for (const [visitors, starts] of [[0, 0], [10, 0], [0, 4]]) {
    const events = traffic(visitors, starts);
    const frontend = summarise(events, orders, () => 0);
    const persisted = writeCommerce(database, { stores: [store], orders, traffic: events, transactions: [], activities: [], creatives: [] });
    assert.equal(frontend.conversionRate, visitors ? 2 / visitors * 100 : 0);
    assert.equal(frontend.checkoutCompletionRate, starts ? 2 / starts * 100 : 0);
    assert.equal(persisted.metrics.conversionRate, frontend.conversionRate);
    assert.equal(persisted.metrics.checkoutCompletionRate, frontend.checkoutCompletionRate);
  }
});
