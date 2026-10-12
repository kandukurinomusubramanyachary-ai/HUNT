import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await ctx.newPage();
page.setDefaultTimeout(45000);
const errs = [];
page.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 160)));
page.on("pageerror", (e) => errs.push(e.message.slice(0, 160)));

const text = async (sel) => (await page.locator(sel).first().innerText()).replace(/\n/g, " ");

// 1. Dashboard KPI values
await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2200);
const kpis = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".tabular.text-kpi")).map((el) => el.textContent),
);
console.log("dashboard KPIs:", kpis.join(" | "));
const storeRows = await page.evaluate(
  () => document.querySelectorAll("table tbody tr").length,
);
console.log("dashboard store rows:", storeRows);

// 2. Sidebar collapse
const beforePad = await page.evaluate(() => {
  const el = document.querySelector("main")?.parentElement;
  return getComputedStyle(el).paddingLeft;
});
await page.click("button[aria-label='Collapse sidebar']");
await page.waitForTimeout(600);
const afterPad = await page.evaluate(() => {
  const el = document.querySelector("main")?.parentElement;
  return getComputedStyle(el).paddingLeft;
});
console.log("sidebar collapse padding:", beforePad, "->", afterPad);
await page.click("button[aria-label='Expand sidebar']");
await page.waitForTimeout(500);

// 3. Global search (Cmd+K)
await page.keyboard.press("Control+k");
await page.waitForTimeout(700);
const searchOpen = await page.locator("input[placeholder='Search products, stores and pages…']").count();
console.log("global search opens:", searchOpen > 0);
await page.fill("input[placeholder='Search products, stores and pages…']", "wallet");
await page.waitForTimeout(500);
await page.keyboard.press("Enter");
await page.waitForTimeout(1500);
console.log("after search nav:", page.url());

// 4. Wallet numbers + slider interaction
await page.goto(`${BASE}/wallet`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2200);
const walletKpis = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".tabular.text-kpi")).map((el) => el.textContent),
);
console.log("wallet KPIs:", walletKpis.join(" | "));

const beforePlan = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll("dd, span")).map((n) => n.textContent);
  return nodes.filter((n) => n && n.startsWith("₹")).slice(0, 6);
});
console.log("wallet amounts before:", beforePlan.join(" | "));

// move slider with keyboard
const slider = page.locator("[role='slider']").first();
await slider.focus();
for (let i = 0; i < 20; i += 1) await page.keyboard.press("ArrowRight");
await page.waitForTimeout(600);
const pct = await slider.getAttribute("aria-valuenow");
const planPct = await page.locator("text=Suggested reinvestment").first().isVisible();
const amountsAfter = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll("dd, span")).map((n) => n.textContent);
  return nodes.filter((n) => n && n.startsWith("₹")).slice(0, 6);
});
console.log("slider pct:", pct, "plan visible:", planPct);
console.log("wallet amounts after:", amountsAfter.join(" | "));

// 5. Analytics numbers
await page.goto(`${BASE}/analytics`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2200);
const analyticsKpis = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".tabular.text-kpi")).map((el) => el.textContent),
);
console.log("analytics KPIs:", analyticsKpis.join(" | "));
const profit = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll("dl div"));
  return rows.map((r) => r.innerText.replace(/\n/g, "=")).slice(0, 8);
});
console.log("profit rows:", profit.join(" | "));

// change range
await page.click("button[role='tab']:has-text('Last 7 days')");
await page.waitForTimeout(1200);
const analyticsKpis7 = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".tabular.text-kpi")).map((el) => el.textContent),
);
console.log("analytics KPIs (7d):", analyticsKpis7.join(" | "));

// 6. Save opportunity toggle
await page.goto(`${BASE}/discover`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const saveBtn = page.locator("button:has-text('Save opportunity')").first();
await saveBtn.click();
await page.waitForTimeout(800);
const savedNow = await page.locator("button:has-text('Saved')").count();
console.log("save toggle -> saved buttons:", savedNow);
await page.goto(`${BASE}/opportunities`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const shortlistRows = await page.locator("table tbody tr").count();
console.log("shortlist rows:", shortlistRows);

// 7. Delete store flow (duplicate -> delete)
await page.goto(`${BASE}/stores`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
const storesBefore = await page.locator("text=Manage this store").count();
const countBefore = await page.evaluate(() => document.body.innerText.match(/Showing|stores/g)?.length ?? 0);
await page.click("button[aria-label^='More actions']");
await page.waitForTimeout(500);
await page.click("text=Duplicate store");
await page.waitForTimeout(1200);
const storesAfterDup = await page.evaluate(
  () => Array.from(document.querySelectorAll("h3, p")).filter((n) => n.textContent.includes("copy")).length,
);
console.log("duplicated store entries:", storesAfterDup);
await page.click("button[aria-label^='More actions']");
await page.waitForTimeout(400);
await page.click("text=Delete store");
await page.waitForTimeout(600);
const dialogVisible = await page.locator("text=Delete Aurora Sleep?").count();
console.log("delete confirmation shown:", dialogVisible > 0);
await page.click("button:has-text('Delete store') >> nth=-1");
await page.waitForTimeout(1200);
const bodyText = await page.evaluate(() => document.body.innerText);
console.log("store removed:", !bodyText.includes("Aurora Sleep"));

await browser.close();
console.log("\n--- errors ---");
console.log(errs.length ? [...new Set(errs)].join("\n") : "none");
