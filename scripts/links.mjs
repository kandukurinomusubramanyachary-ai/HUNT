import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await ctx.newPage();
page.setDefaultTimeout(45000);

const routes = [
  "/dashboard",
  "/discover",
  "/opportunities",
  "/stores",
  "/stores/new",
  "/creative",
  "/analytics",
  "/wallet",
  "/settings",
  "/products/aurora-rest",
  "/store/aurora-sleep",
];

const links = new Set();
const badHrefs = [];
const buttonsWithoutLabel = [];

for (const route of routes) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const found = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      out.push({ href: href ?? "", text: (a.innerText || "").trim().slice(0, 40) });
    });
    return out;
  });
  for (const item of found) {
    if (!item.href || item.href === "#" || item.href === "") {
      badHrefs.push(`${route}: "${item.text}" -> ${item.href || "(empty)"}`);
      continue;
    }
    if (item.href.startsWith("http")) continue;
    links.add(item.href);
  }

  const unlabeled = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("button").forEach((b) => {
      const label = (b.getAttribute("aria-label") || b.innerText || "").trim();
      if (!label) out.push(b.className.slice(0, 60));
    });
    return out;
  });
  unlabeled.forEach((c) => buttonsWithoutLabel.push(`${route}: ${c}`));
}

console.log(`internal links found: ${links.size}`);
const statusResults = [];
for (const href of links) {
  const url = href.startsWith("/") ? `${BASE}${href}` : `${BASE}/${href}`;
  const res = await page.request.get(url);
  statusResults.push({ href, status: res.status() });
}
const broken = statusResults.filter((r) => r.status >= 400);
console.log("broken internal links:", broken.length ? JSON.stringify(broken) : "none");
console.log("empty/# hrefs:", badHrefs.length ? badHrefs.join(" | ") : "none");
console.log(
  "buttons without label:",
  buttonsWithoutLabel.length ? [...new Set(buttonsWithoutLabel)].join(" | ") : "none",
);

await browser.close();
