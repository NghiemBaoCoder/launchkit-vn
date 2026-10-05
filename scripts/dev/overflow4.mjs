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
  const grid = document.querySelector("main .grid");
  for (const child of grid?.children ?? []) {
    for (const el of [child, ...child.querySelectorAll("*")]) {
      const prev = el.style.width;
      el.style.width = "min-content";
      const w = el.getBoundingClientRect().width;
      el.style.width = prev;
      if (w > 358) res.push(`${el.tagName.toLowerCase()} minContent=${Math.round(w)} class=${(el.className?.toString() ?? "").slice(0, 80)} text=${(el.textContent ?? "").trim().slice(0, 30)}`);
    }
  }
  return res.slice(0, 12);
});
for (const r of out) console.log(r);
await browser.close();
