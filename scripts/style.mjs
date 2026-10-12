import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--no-sandbox"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 960 } })).newPage();
p.setDefaultTimeout(40000);
await p.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(4000);
const info = await p.evaluate(() => {
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const h2 = cs(document.querySelector("h2"));
  const kpi = cs(document.querySelector('[class*="text-kpi"]'));
  const btn = [...document.querySelectorAll("a,button")].find((x) =>
    (x.textContent || "").includes("Discover products"),
  );
  const section = cs(document.querySelector("h3"));
  return {
    bodyBg: cs(document.body).backgroundColor,
    bodyFont: cs(document.body).fontFamily.split(",")[0],
    h2: [h2.fontSize, h2.lineHeight, h2.fontWeight],
    kpi: [kpi.fontSize, kpi.lineHeight, kpi.fontWeight, kpi.fontVariantNumeric, kpi.fontFamily.split(",")[0]],
    section: [section.fontSize, section.lineHeight, section.fontWeight],
    btn: [cs(btn).fontSize, cs(btn).fontWeight, cs(btn).height, cs(btn).borderRadius, cs(btn).backgroundColor],
  };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
