import { chromium } from "@playwright/test";
const [email, password, url] = process.argv.slice(2);
const base = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
if (email !== "-") {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}
await page.goto(`${base}${url}`, { waitUntil: "networkidle" });
const out = await page.evaluate(() => {
  const res = [];
  for (const el of document.querySelectorAll("body, body *")) {
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "auto" && getComputedStyle(el).overflowX !== "scroll") {
      res.push(`${el.tagName.toLowerCase()} client=${el.clientWidth} scroll=${el.scrollWidth} class=${(el.className?.toString() ?? "").slice(0, 100)}`);
    }
  }
  const main = document.querySelector("main");
  res.push(`MAIN client=${main?.clientWidth} scroll=${main?.scrollWidth} rect=${Math.round(main?.getBoundingClientRect().width ?? 0)}`);
  return res.slice(0, 20);
});
for (const r of out) console.log(r);
await browser.close();
