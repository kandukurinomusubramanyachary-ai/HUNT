# Milestone 1 implementation

Run on Node 22.13+ (Node 24 used for verification). `npm run dev` and `npm start` launch Next.js and the dedicated discovery worker together. `npm run worker` runs the worker separately. Use a persistent writable volume for `.data/intelligence.sqlite`; this process-based deployment is not a serverless perpetual timer.

Copy `.env.example` to `.env.local` to configure region, interval, approved Reddit OAuth access, and a permitted OpenAI-compatible Gemma 4 provider. No credentials are bundled. Reddit stays unconfigured without OAuth. Gemma falls back to explicit deterministic analysis when unavailable; attempts and outcomes are recorded in SQLite. An OAuth token must be refreshed externally.

Endpoints: `GET /api/intelligence/opportunities`, `GET /api/intelligence/opportunities/[id]`, `GET /api/intelligence/status`. Radar loads and polls automatically; Refresh results only rereads the database. Demo Mode retains existing sample fixtures. Unknown price, margin, competition and sustained growth are not displayed as measured facts. Store Builder accepts the selected candidate and requires a user-entered price.

Verification: `npm test`, `npm run test:ui`, `npm run test:worker`, `npm run build`. Browser verification uses installed Chrome/Edge or Playwright Chromium (`HUNT_BROWSER_PATH` overrides). UI and worker tests use isolated databases under `test-results`. `HUNT_INCLUDE_FIXTURES=true` is only for explicit fixture verification; fixtures are otherwise excluded and prominently labeled when shown. Live RSS may contain no purchasable products; a truthful empty list is expected.

Created: intelligence engine, worker/launcher, three API routes, live views, client service/adapter/types, placeholder, tests, configuration examples. Modified: Radar/shortlist/detail routing, product service/type, filters, Store Builder handoff/copy, package scripts, Next configuration. No payments, Ad Studio, or next milestone work.
