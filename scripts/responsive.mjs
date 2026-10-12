import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const ROUTES = [
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
const WIDTHS = [390, 768, 1024, 1440];

const browser = await chromium.launch({ args: ["--no-sandbox"] });

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  const issues = [];
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1600);
    const info = await page.evaluate((vw) => {
      const overflow =
        document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const offenders = [];
      if (overflow > 1) {
        document.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 2 && r.width > 40) {
            offenders.push(`${el.tagName}.${(el.className || "").toString().split(" ")[0]}`);
          }
        });
      }
      const sidebar = document.querySelector("aside");
      return {
        overflow,
        offenders: offenders.slice(0, 4),
        sidebarWidth: sidebar ? Math.round(sidebar.getBoundingClientRect().width) : 0,
        sidebarVisible: sidebar
          ? getComputedStyle(sidebar).display !== "none" &&
            sidebar.getBoundingClientRect().width > 0
          : false,
      };
    }, width);
    if (info.overflow > 1 || !info.sidebarVisible) {
      issues.push(`${route} overflow=${info.overflow} ${info.offenders.join(",")}`);
    }
    if (width >= 768 && !info.sidebarVisible) {
      issues.push(`${route} sidebar missing at ${width}`);
    }
  }
  console.log(`width ${width}: ${issues.length ? issues.join(" || ") : "ok"}`);
  await ctx.close();
}

await browser.close();
