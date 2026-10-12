import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await ctx.newPage();
page.setDefaultTimeout(45000);

const problems = [];
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 200)}`);
});
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));

async function check(path, expectations, wait = 1800) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(wait);
  const bodyText = await page.evaluate(() => document.body.innerText);
  const badTokens = ["NaN", "undefined", "Infinity", "[object Object]", "₹NaN"];
  const found = badTokens.filter((token) => bodyText.includes(token));
  const results = [];
  for (const expectation of expectations) {
    const count = await page.locator(`text=${expectation}`).count();
    results.push(`${expectation}:${count > 0 ? "ok" : "MISSING"}`);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log(
    `${path}\n  ${results.join("  ")}\n  badTokens:${
      found.length ? found.join(",") : "none"
    }  hOverflow:${overflow}px  chars:${bodyText.length}`,
  );
  return bodyText;
}

await check("/dashboard", [
  "Command Center",
  "Products discovered",
  "Active stores",
  "Simulated revenue",
  "Demo conversion rate",
  "Revenue overview",
  "Opportunity radar",
  "Store performance",
  "Recent activity",
  "Hunt products",
]);

await check("/discover", [
  "Opportunity Radar",
  "Google Trends",
  "Reddit",
  "Social signals",
  "Competitor research",
  "Aurora Rest",
  "Drift Lite",
  "Analyze product",
]);

await check("/products/aurora-rest", [
  "Aurora Rest",
  "Demand intelligence",
  "Social sentiment",
  "Competitive landscape",
  "HUNT assessment",
  "Recommendation",
  "Build store",
]);

await check("/opportunities", ["Saved opportunities", "Ranking board", "Aurora Rest"]);

await check("/stores", ["My Stores", "Aurora Sleep", "Nomad Coffee Co.", "Demo orders"]);

await check("/stores/new?product=nomad-pour", ["AI store builder", "Live preview", "Nomad Pour", "Store name", "Visual style"]);

await check("/creative", ["Creative Studio", "Creative preview", "Video concept", "Competitor research", "Higgsfield-ready prompt"]);

await check("/analytics", ["Performance Analytics", "Conversion funnel", "Store comparison", "Profit estimate", "Average order value"]);

await check("/wallet", ["Commerce Wallet", "Reinvestment planner", "Transaction history", "Recommended allocation", "Balance remaining"]);

await check("/settings", ["Settings", "Demo data", "Reset demo data", "Reinvestment default"]);

const storefrontText = await check("/store/aurora-sleep", [
  "Aurora Sleep",
  "Add to cart",
  "Specifications",
  "Frequently asked questions",
], 2500);
console.log("storefront sample:", storefrontText.slice(0, 260).replace(/\n/g, " | "));

await browser.close();

console.log("\n--- errors ---");
console.log(problems.length ? [...new Set(problems)].join("\n") : "none");
