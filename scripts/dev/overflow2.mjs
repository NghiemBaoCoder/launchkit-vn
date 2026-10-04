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
  const limit = 360;
  const res = [];
  for (const el of document.querySelectorAll("main *")) {
    const r = el.getBoundingClientRect();
    if (r.width <= limit) continue;
    const kids = [...el.children];
    const widest = Math.max(0, ...kids.map((k) => k.getBoundingClientRect().width));
    if (widest > limit) continue; // not a leaf culprit
    const cs = getComputedStyle(el);
    res.push(`${el.tagName.toLowerCase()} w=${Math.round(r.width)} minw=${cs.minWidth} ws=${cs.whiteSpace} class=${(el.className?.toString() ?? "").slice(0, 90)} text=${(el.textContent ?? "").trim().slice(0, 30)}`);
  }
  return res.slice(0, 15);
});
for (const r of out) console.log(r);
await browser.close();
