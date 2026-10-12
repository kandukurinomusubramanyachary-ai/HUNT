# HUNT hackathon submission

HUNT combines background product research with a clearly labeled simulated commerce workflow. Live research comes from public Google Trends India RSS. Demo Mode contains sample products and historical records. No real payments, fulfillment, advertising purchases or money transfers occur.

## Setup and run

Use Node 22.13+ (verification used Node 24) and npm.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000/dashboard. No credentials are required for the demo. Fixtures initialize automatically; no separate seed command is needed.

For production, stop the development server, then:

```powershell
npm run build
npm start
```

Optional configuration: copy .env.example to .env.local. HUNT_REGION, HUNT_REFRESH_MINUTES and HUNT_DB_PATH configure the existing collector and database. GEMMA_MODEL_ID, GEMMA_BASE_URL and GEMMA_API_KEY are server-side settings for an authorized provider; none were present during verification. Never put credentials in NEXT_PUBLIC variables.

## Judge walkthrough

1. Dashboard ? Opportunity Radar (/discover). Live Mode shows actual collector status and source evidence. A truthful empty catalogue is expected when no purchasable product qualifies.
2. Click Demo Mode ? Aurora Rest ? Product Details ? Launch store. The product, scores, competitors, costs and demand values here are sample fixtures.
3. Store Builder: edit description, selling price and branding/name/slug. Launch the store and show its customized storefront.
4. Add to cart ? Demo checkout ? enter a demo name/email ? Complete demo order. Confirmation is labeled Demo Mode. Repeated submissions produce one order and one order-linked credit.
5. View analytics. For the verification store, one order at INR 3333, one visitor and one checkout start produce INR 3333 revenue/AOV and 100% conversion/completion.
6. Wallet: sales reconcile with the same orders and ledger. Demonstrate reinvestment at 0%, 30% and 100%. All financial amounts are simulated.
7. Creative Studio: select Aurora Rest, generate, inspect three ad variations, hooks, captions, 15-second storyboard and Higgsfield-ready text prompt. Edit, copy and save; reload the saved creative. Provider is Template (deterministic), model template-v1. No video generation or model inference is claimed.
8. Refresh the storefront. The automated browser test also restarts the application server and removes localStorage to prove SQLite persistence.

## Architecture and actual module provenance

| Module | Implementation and execution |
|---|---|
| Existing screens and visual components | Existing user-supplied Next.js 14 / TypeScript / Tailwind frontend; design preserved |
| State | Existing Zustand store; browser localStorage is a cache |
| Product intelligence | src/lib/intelligence/engine.mjs: evidence normalization, deduplication, scoring, structured-response validation and SQLite |
| Background discovery | scripts/intelligence-worker.mjs, launched by scripts/with-worker.mjs; scheduled Google Trends collection every 30 minutes by default |
| Research API | /api/intelligence/opportunities, /api/intelligence/opportunities/[id], /api/intelligence/status |
| Commerce persistence | src/lib/commerce-persistence.mjs and existing /api/demo/state; validated additive SQLite tables, atomic writes and order/credit ID deduplication |
| Store / checkout | Existing Store Builder and order services; selected metadata and edited prices retained; payments simulated |
| Analytics / wallet | src/lib/analytics.ts, src/lib/services/dashboard.ts and wallet.ts; computed from persisted event, order and ledger records |
| Creative Studio | Existing local templates; deterministic provider/model and source product/time stored with each record |
| Gemma / Reddit | Integration code exists, but live credentials are absent; no genuine model inference or live Reddit collection verified |

The database defaults to .data/intelligence.sqlite. Commerce includes stores, orders, traffic, activities, ledger and creative records. A backup was made before adding commerce tables. Soft archives retain rows; no destructive reset is needed.

## Metric definitions

- Conversion Rate = completed orders / unique demo visitors ? 100.
- Checkout Completion Rate = completed orders / checkout starts ? 100.
- Revenue = sum of completed-order totals. AOV = revenue / completed orders.
- Both rates and AOV return 0 when the denominator is 0. Pending/refunded orders are excluded.
- A measured demo visitor is deduplicated per browser session, store and UTC day. Period visitor totals sum those daily records. Historical fixture traffic is explicitly simulated.
- Ledger net balance = sale credits ? marketing/operating expenses. Available balance excludes the net pending amount. Reinvestment uses nonnegative available balance; suggestions and allocations use integer paise and round to two decimals.
- The separate consistency fixture has 2 completed orders, 10 visitors and 4 checkout starts: 20% conversion, 50% checkout completion.

## Verification and evidence

```powershell
npm test
npm run test:commerce
npx tsc --noEmit
npm run build
```

The final unit suite contains 20 tests. Commerce tests use an isolated SQLite database and browser context; they preserve the user's database and cache. Installed Chrome/Edge is used; HUNT_BROWSER_PATH may select an executable. npm run test:ui exercises the existing intelligence UI integration.

Evidence is under test-results: final-unit-tests.log, final-typecheck.log, final-build.log, final-command-status.json and final-runtime-status.json. test-results/submission contains commerce-results.json, golden-path-journal.json, gemma-status.json and screenshots 00?09. Read current command results; older attempt logs can contain failures that were subsequently corrected.

Screenshot checklist: Dashboard; Live Radar status; labeled Demo Radar; selected Builder product/branding/price; customized storefront; labeled checkout; confirmation; record-derived analytics; reconciled wallet; Template (deterministic) Creative Studio.

## Actual model usage and current limitations

Genuine Gemma 4 inference is NOT VERIFIED. No authorized configuration was present, and no real call was attempted. Product analysis uses deterministic-v1 when inference is unavailable. Creative Studio uses template-v1. A structured-response validation test with a controlled provider response does not establish live Gemma inference.

npm run verify:gemma records redacted configuration/inference status against a clearly labeled isolated fixture. It requires GEMMA_MODEL_ID, GEMMA_BASE_URL and GEMMA_API_KEY for a genuine authorized request.

Live Google Trends evidence is available, but the observed feed currently yields no qualified purchasable products. Reddit remains unconfigured. All sales and expenses are simulated. No public deployment URL is configured or verified. Deployment requires a continuously running Node process and a persistent writable SQLite volume; the background worker is not a serverless perpetual timer.
