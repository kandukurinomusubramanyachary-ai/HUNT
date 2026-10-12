# HUNT — Autonomous Commerce Intelligence

**Hackathon submission | 12 October 2026**  
**Repository:** https://github.com/kandukurinomusubramanyachary-ai/HUNT  
**Commit reviewed before this documentation update:** `59eebf2`  
**Demo mode:** The commerce figures and product examples in the UI are simulated. **No real sales, payments, ad spending, or automated transfers occurred.**

> **Vision:** Discover opportunities. Launch commerce. Optimize growth.  
> HUNT is a commerce intelligence platform designed to evolve into a supervised, self-sustaining commerce operating system: one place for researching emerging demand, launching storefronts, preparing campaigns, measuring performance, and planning reinvestment.

## 1. What HUNT does

HUNT combines a **background product-research pipeline** with an interactive **product-to-store commerce demonstration**. It brings together opportunity research, explainable scoring, store creation, creative preparation, simulated sales tracking, analytics, and an auditable financial ledger.

**Core journey:** Research signals → Opportunity Radar → Product shortlist → Store Builder → Storefront → Demo Checkout → Analytics → Wallet → Creative Studio.

The current MVP demonstrates the commerce lifecycle and records genuine external research signals where available. It does **not** yet autonomously operate a real business.

## 2. Application screens — visual evidence captured from localhost

Eight screenshots of the running local website were supplied for this submission. These describe **visible UI state**, not independent proof of live external integrations. The screenshots were captured at `http://localhost:3000`; the evidence files should be attached with the submission package. They are not claimed to be hosted publicly.

| Screenshot | Page | What is visibly demonstrated |
| --- | --- | --- |
| 01 — Command Center, top | `/dashboard` | Dashboard KPI cards: 6 demo products, 2 active stores, approximately ₹5.90L simulated period revenue, 2.10% demo conversion; revenue chart and product rankings. |
| 02 — Command Center, lower | `/dashboard` | Store performance, recent activity stream, quick actions, and explicit demo-data labeling. |
| 03 — Saved Opportunities | `/opportunities` | Live/Demo selection, saved shortlist of Aurora Rest and Verdant One, opportunity scores, comparisons, Analyze and Launch actions. |
| 04 — Opportunity Radar | `/discover` | Product search and filters, six sample product cards, ranking signals and source-channel labels; the displayed signals are clearly marked as sample fixtures. |
| 05 — My Stores | `/stores` | Aurora Sleep and Nomad Coffee Co. active; Verdant Studio in draft; previews, analytics links, store management, and demo order/revenue summaries. |
| 06 — Creative Studio | `/creative` | Campaign controls, product selection, ad preview, editable headline, sample competitor references and a Generate creative control. Copy/save/generate behavior was separately verified by browser tests. |
| 07 — Performance Analytics | `/analytics` | Demo visitors, checkout starts, simulated orders, revenue, conversion, AOV, revenue chart and funnel, all labeled as simulated. |
| 08 — Commerce Wallet | `/wallet` | Simulated balance, sales, expenses, transaction ledger, and adjustable reinvestment planner. |

### Screen-specific example figures

These screenshots show *different scopes and periods* and should not be interpreted as eight independent financial statements:

- Dashboard period: **₹5.90L** simulated revenue and **2.10%** conversion.
- Store list: two active stores and one draft store; shown order/revenue histories are demo records.
- Analytics selection: **8,714** visitors, **646** checkout starts, **183** completed demo orders, **₹5.90L** simulated revenue, **2.10%** visitor conversion and **28.33%** checkout completion.
- Wallet all-record view: **₹18,48,105** simulated sales, **₹1,42,879** simulated expenses and **₹17,05,226** simulated available balance; the illustrated 52% reinvestment recommendation is approximately **₹8,86,718**.
- Saved sample opportunities: Aurora Rest **87/100** and Verdant One **71/100**; these are demonstration scores, **not validated market predictions**.

Figures are only representative of the captured local demo state and can change as demo records or filters change.

## 3. Implemented features

### Product intelligence and automatic research
- A Node.js background worker collects public **Google Trends India RSS** signals on a 30-minute default cadence and stores source evidence in SQLite.
- Deduplication, candidate filtering, deterministic and explainable scores, shortlist, product details and API-backed Opportunity Radar are implemented.
- Observed research: **10 real India RSS observations**, with **25 source-evidence records** reported during final inspection. The observed feed produced **zero validated purchasable products**; the live catalogue correctly remains empty rather than inventing results.
- Reddit connector is present but **not configured**. UI sample trends, Reddit references, competitor comparisons and product scores are explicitly examples, not live platform findings.

### Store generation and simulated commerce
- Selecting a Demo Mode product transfers metadata into the Store Builder.
- Brand details, descriptions and prices can be edited; a storefront can be launched and previewed.
- Shopping cart and **demo-only** checkout produce persistent order records in SQLite.
- Duplicate submissions are idempotent: one completed order yields exactly one linked ledger credit.
- Verified isolated example: a customized **₹3,333** demo order created exactly one matching credit, even after repeated saves/submits.

### Analytics and wallet
- Visitor events, checkout starts, completed orders, revenue, AOV and conversion rates are derived from recorded demo events.
- Visitor conversion and checkout completion use explicitly different denominators; frontend and API were tested for consistency.
- Wallet credits are reconciled against completed orders; simulated expenses are accounted for separately.
- Reinvestment recommendations were tested at **0%**, **30%** and **100%**. This is a planner, **not automatic spending or money movement**.
- Store/order persistence survived application-server restart and browser-cache clearing in the reported end-to-end verification.

### Creative Studio
- Product-driven creative preparation includes three copy variants, ad hooks/captions, a 15-second video storyboard and a **Higgsfield-ready text prompt**.
- Creative editing, saving, reloading and exact clipboard copy were browser-tested.
- Current generation runs through **`template-v1` (deterministic templates)**. No actual video, voiceover or externally hosted AI ad generation is claimed.

## 4. Architecture and source modules

| Responsibility | Implementation |
| --- | --- |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, reusable UI components |
| Client state | Zustand; browser localStorage supports UI caching |
| Research worker | `scripts/intelligence-worker.mjs`; `scripts/with-worker.mjs` |
| Intelligence engine | `src/lib/intelligence/engine.mjs` — normalization, evidence handling, scoring, structured response validation |
| Research APIs | `GET /api/intelligence/status`, `GET /api/intelligence/opportunities`, `GET /api/intelligence/opportunities/[id]` |
| Commerce persistence | `src/lib/commerce-persistence.mjs`; `src/lib/commerce-schema.ts`; `/api/demo/state` |
| Product and store workflows | `src/lib/services/products.ts`, `store-builder.ts`, `stores.ts`, `orders.ts` |
| Analytics | `src/lib/analytics.ts`, `src/lib/services/dashboard.ts` |
| Wallet | `src/lib/services/wallet.ts` and shared order/ledger records |
| Creative Studio | `src/lib/services/creatives.ts`, `src/components/creative/` |
| Tests | `tests/intelligence.test.mjs`, `tests/commerce.test.mjs`, `tests/analytics-consistency.test.mjs`, browser integration tests |

SQLite is used for durable research and commerce records. The running worker and writable SQLite storage require a suitable persistent Node host; serverless deployment alone is not sufficient for the current architecture.

## 5. Verified engineering results

The final local verification report recorded:

| Check | Result |
| --- | --- |
| Automated tests | **20 passed, 0 failed, 0 skipped** |
| TypeScript check | **PASS** |
| Production build | **PASS** |
| Full browser journey | **16 HTTP-200 steps** |
| Store and order persistence | **PASS**, including server restart / cleared browser cache |
| Duplicate checkout protections | **PASS**, exactly one order and one linked credit |
| Analytics consistency | **PASS**, visitor and checkout denominators tested |
| Wallet | **PASS**, reconciliation and 0% / 30% / 100% planner |
| Creative Studio | **PASS**, generate / edit / save / reload / exact copy |
| Genuine Gemma 4 inference | **NOT VERIFIED**; no authorized provider configured |
| Public production deployment | **NOT VERIFIED** |

One nonfatal resource 404 was observed in the reported browser testing; there were no reported fatal page errors or HTTP 500s. Verification artifacts and screenshots are included in the locally prepared HUNT submission archive, if supplied to judges.

**Metrics:** Visitor conversion = completed orders ÷ unique visitors. Checkout completion = completed orders ÷ checkout starts. Revenue is the sum of completed-order totals; average order value = revenue ÷ orders. Missing denominators return zero. Ledger net balance = sale credits − expenses; available balance further excludes net pending amounts.

## 6. Model provenance and limitations

**Do not present HUNT as having already completed live Gemma 4 inference.** At final verification, `GEMMA_MODEL_ID`, `GEMMA_BASE_URL` and `GEMMA_API_KEY` were absent. No real Gemma 4 response was generated; structured-response tests do not count as genuine live inference. Product-analysis fallback is labeled `deterministic-v1`, and creative output is labeled `template-v1`.

The frontend was initially produced using LM Arena tooling, then integrated and tested using coding tools. Open-weight-only development eligibility must be assessed from actual model usage and the organizer's rules, not inferred from installing a coding agent.

Real ecommerce checkout, fulfilment, customer acquisition, autonomous campaign publishing and financial transfers remain out of scope. HUNT is a **working, transparently simulated hackathon MVP**, not a verified revenue-producing autonomous business.

## 7. Future roadmap — not implemented in this submission

1. **Expanded social and market intelligence:** Authorized integrations for Reddit, marketplaces, competitor ads and other social platforms, with sustained-trend validation.
2. **Gemma-powered intelligence:** Real authorized Gemma inference for product classification, opportunity reasoning, store copy and campaign proposals.
3. **AI video and creative generation:** Product ads and video variants through approved video-generation providers, including Higgsfield where supported.
4. **ElevenLabs voice:** Multilingual product voiceovers, narrated campaigns, localized promotional audio and optional voice shopping assistance.
5. **Autonomous store operations:** Product listing, inventory, fulfillment and pricing integrations with operator approval.
6. **Supervised growth optimization:** Attribute conversion results, recommend budget allocations and improve campaigns using real data.
7. **Self-sustaining commerce:** Long-term, human-supervised operation across discovery, store generation, marketing and reinvestment, with safeguards before any real financial action.

## 8. Run the demo

**Requirements:** Node.js 22.13+ and npm.

```powershell
npm ci
npm run build
npm start
```

Open **http://localhost:3000/dashboard**.

**Judge walkthrough:** Dashboard → Discover → **Demo Mode** → **Aurora Rest** → Analyze → Launch Store → edit price/branding → launch storefront → Add to Cart → Demo Checkout → Analytics → Wallet → Creative Studio. Data fixtures initialize without API credentials or a separate seed command.

For development, run `npm run dev`. An approved Gemma provider, if configured later, should use server-side environment variables only; do not place keys in public frontend variables.

## 9. Submission links and evidence

- **GitHub source:** https://github.com/kandukurinomusubramanyachary-ai/HUNT
- **Local screenshot set:** eight attached page captures described in Section 2 (dashboard top/bottom, opportunities, discover, stores, creative, analytics, wallet).
- **Automated verification:** `test-results/` evidence packaged with the local `HUNT-submission-final.zip`, as described in the repository README.
- **Public deployment:** Not configured or verified at the time of submission. Do **not** use a localhost address as a public link.

**Submission guidance:** Supply this repository URL, the prepared ZIP and screenshots through the hackathon portal. A successful Git push is not itself a hackathon submission.
