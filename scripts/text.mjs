import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--no-sandbox"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
p.setDefaultTimeout(45000);
for (const route of ["/dashboard", "/discover", "/products/aurora-rest", "/stores", "/creative", "/analytics", "/wallet", "/settings"]) {
  await p.goto("http://localhost:3000" + route, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  const t = await p.evaluate(() => document.body.innerText.replace(/\n{2,}/g, "\n"));
  console.log(`\n===== ${route} =====\n${t.slice(0, 2600)}`);
}
await b.close();
