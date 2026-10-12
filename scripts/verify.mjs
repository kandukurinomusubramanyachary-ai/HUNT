import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/tmp/qa";
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const consoleErrors = [];

function attach(page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[console] ${msg.text()}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err.message}`));
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const SETTINGS = { timeout: 60000 };

async function shot(page, name) {
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    fullPage: true,
    animations: "disabled",
    timeout: 30000,
  });
}

async function newPage(width = 1440, height = 960) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  attach(page);
  return { context, page };
}

// ---------- 1. Static page sweep (desktop) ----------
{
  const { context, page } = await newPage();
  const pages = [
    ["dashboard", "/dashboard"],
    ["discover", "/discover"],
    ["opportunities", "/opportunities"],
    ["stores", "/stores"],
    ["builder", "/stores/new?product=aurora-rest"],
    ["creative", "/creative"],
    ["analytics", "/analytics"],
    ["wallet", "/wallet"],
    ["settings", "/settings"],
    ["product-detail", "/products/aurora-rest"],
    ["storefront", "/store/aurora-sleep"],
  ];
  for (const [name, path] of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(900);
    await shot(page, name);
  }
  await context.close();
}

// ---------- 2. Journey: product -> store -> order -> analytics -> wallet ----------
{
  const { context, page } = await newPage();
  await page.goto(`${BASE}/discover`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(500);

  // search filter
  await page.fill('input[aria-label="Search products"]', "planter");
  await page.waitForTimeout(400);
  const cardsAfterSearch = await page.locator("h3", { hasText: "Verdant One" }).count();
  console.log("search filter shows Verdant One:", cardsAfterSearch > 0);
  await shot(page, "discover-filtered");
  await page.fill('input[aria-label="Search products"]', "");

  // go to product detail
  await page.click("text=Analyze product >> nth=0");
  await page.waitForURL("**/products/**", { timeout: 30000 });
  await page.waitForTimeout(900);
  console.log("product url:", page.url());

  // launch store
  await page.click("text=Launch store >> nth=0");
  await page.waitForURL("**/stores/new**", { timeout: 30000 });
  await page.waitForTimeout(1200);
  console.log("builder url:", page.url());
  await shot(page, "builder-prefilled");

  // step 2: rename store
  await page.click("text=Branding >> nth=0");
  await page.fill("#store-name", "Aurora Test Lab");
  await page.fill("#store-slug", "aurora-test-lab");
  await page.waitForTimeout(400);
  await shot(page, "builder-branding");

  // step 3: content + generate
  await page.click("text=Content >> nth=0");
  await page.waitForTimeout(300);
  await page.click("text=Generate >> nth=0");
  await page.waitForTimeout(600);
  await shot(page, "builder-content");

  // step 4 launch
  await page.click("text=Preview >> nth=0");
  await page.waitForTimeout(400);
  await shot(page, "builder-preview");
  await page.click("button:has-text('Launch store')");
  await page.waitForURL("**/store/**", { timeout: 45000 });
  await page.waitForTimeout(1500);
  console.log("storefront url:", page.url());
  await shot(page, "storefront-new");

  // add to cart
  await page.click("button:has-text('Add to cart')");
  await page.waitForTimeout(900);
  await shot(page, "cart-drawer");

  await page.click("button:has-text('Proceed to checkout')");
  await page.waitForTimeout(700);
  await page.fill("#checkout-name", "Aarav Sharma");
  await page.fill("#checkout-email", "aarav@example.com");
  await shot(page, "checkout-form");
  await page.click("button:has-text('Complete demo order')");
  await page.waitForTimeout(1500);
  const successVisible = await page.locator("text=Order confirmed").count();
  console.log("checkout success visible:", successVisible > 0);
  await shot(page, "checkout-success");

  // analytics
  await page.click("button:has-text('View analytics')");
  await page.waitForURL("**/analytics**", { timeout: 45000 });
  await page.waitForTimeout(1500);
  await shot(page, "analytics-after-order");

  // wallet
  await page.goto(`${BASE}/wallet`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);
  await shot(page, "wallet-after-order");

  // persistence check
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);
  const persisted = await page.locator("text=Aurora Test Lab").count();
  console.log("store persisted after reload:", persisted > 0);

  await context.close();
}

// ---------- 3. Mobile sweep ----------
{
  const { context, page } = await newPage(390, 844);
  const pages = [
    ["m-dashboard", "/dashboard"],
    ["m-discover", "/discover"],
    ["m-stores", "/stores"],
    ["m-storefront", "/store/aurora-sleep"],
    ["m-analytics", "/analytics"],
    ["m-wallet", "/wallet"],
  ];
  for (const [name, path] of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    await shot(page, name);
  }
  // horizontal overflow check
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log("mobile horizontal overflow px:", overflow);
  await context.close();
}

await browser.close();

console.log("\n--- console errors ---");
console.log(consoleErrors.length === 0 ? "none" : [...new Set(consoleErrors)].join("\n"));
