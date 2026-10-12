# HUNT ? submission summary

1. **What HUNT does:** combines evidence-based product opportunity research with a labeled, simulated product-to-store commerce demonstration.
2. **Architecture:** Next.js 14, TypeScript and Tailwind screens use existing Zustand state. SQLite persists evidence, stores, orders, traffic, ledger and creative records. Existing intelligence APIs serve research; /api/demo/state synchronizes commerce. No new packages or duplicate APIs were added.
3. **Background discovery:** the existing worker collects public Google Trends India RSS automatically every 30 minutes by default. The latest inspected live run collected 10 observations; 25 evidence records were persisted. The observed feed produced zero qualified purchasable products. Sources and demo fixtures are distinguished.
4. **Commerce lifecycle:** select Aurora Rest in Demo Mode ? edit metadata/price/branding in Store Builder ? launch storefront ? cart ? simulated checkout ? analytics ? wallet. One order has one matching credit; repeated submits and saved-state replay do not duplicate it. The browser cache can be removed and the application restarted while SQLite retains the store and order.
5. **Verified demonstrations:** the browser journey recorded 16 HTTP-200 steps. Its new store retained a single INR 3333 order/credit. Creative Studio generated three variations, hooks/caption, a 15-second storyboard and a Higgsfield-ready text prompt; editing, exact clipboard copying, saving and reload persistence passed. Reinvestment at 0%, 30% and 100% passed. No real money moved and no video was generated.
6. **Tests:** npm test passed 20, failed 0, skipped 0. npm run test:commerce exited 0. TypeScript exited 0. Production build status is recorded in test-results/final-command-status.json and final-build.log. A separate explicit fixture confirmed 2 completed orders / 10 visitors = 20% conversion; 2 / 4 checkout starts = 50% checkout completion. Zero denominators produce zero; monetary calculations use paise.
7. **Actual open-weight model usage:** NOT VERIFIED. Gemma 4 configuration/credentials are absent; no genuine call was attempted and no model response or latency is claimed. Product analysis falls back to deterministic-v1. Creative records show Template (deterministic) / template-v1 with source product and creation time.
8. **Limitations:** all product fixtures, historical commerce and finances are simulated. Live Reddit is unconfigured; the current live feed has no qualified product. No public deployment URL is configured/verified; production requires a running Node process and persistent writable SQLite storage. One nonfatal browser resource 404 is unattributed; no fatal console/page errors or HTTP 500s occurred in the browser check.

## Exact submission steps

1. Upload the prepared HUNT source archive to the hackathon submission portal; use this summary as the project description.
2. Include the current screenshots 00?09 and golden-path-journal.json / commerce-results.json from test-results/submission, plus the final test/build logs.
3. For the local demo: run npm ci, npm run build, then npm start on Node 22.13+; open http://localhost:3000/dashboard. Stop any existing server on port 3000 before starting production.
4. Navigate to /discover ? Demo Mode ? Aurora Rest and follow the README walkthrough. No secret credentials or separate seed command are required.
5. Supply a public URL only after deploying to a configured persistent Node host and testing it; no public URL is claimed here.

## Evidence

- test-results/final-unit-tests.log and final-typecheck.log
- test-results/final-build.log and final-command-status.json
- test-results/final-browser.log and final-browser-status.json
- test-results/submission/commerce-results.json and golden-path-journal.json
- test-results/submission/gemma-status.json
- test-results/final-runtime-status.json and final-security-deployment.json

No API keys are included in the source archive. A bounded pattern scan found no embedded credential patterns in 151 source/build files. The workspace has no Git repository, so no commit or deployment was created.
