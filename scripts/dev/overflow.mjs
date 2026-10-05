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
  const w = document.documentElement.clientWidth;
  const res = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.right > w + 1 && r.width > 0) res.push(`${el.tagName.toLowerCase()}.${(el.className?.toString() ?? "").slice(0, 80)} right=${Math.round(r.right)} w=${Math.round(r.width)} text=${(el.textContent ?? "").trim().slice(0, 40)}`);
    if (res.length > 60) break;
  }
  return { w, sw: document.documentElement.scrollWidth, res };
});
console.log(out.w, out.sw);
for (const r of out.res) console.log(r);
await browser.close();
