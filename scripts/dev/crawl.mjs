// Quét toàn bộ link nội bộ bắt đầu từ các URL cho trước; báo cáo link lỗi (>=400) và console error.
// Usage: node scripts/dev/crawl.mjs <email|-> <password|-> <startUrl...>
import { chromium } from "@playwright/test";
const [email, password, ...starts] = process.argv.slice(2);
const base = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = new Map();
page.on("console", (m) => { if (m.type() === "error") { const u = page.url(); consoleErrors.set(u, [...(consoleErrors.get(u) ?? []), m.text().slice(0, 160)]); } });
if (email !== "-") {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}
const seen = new Set();
const queue = [...starts];
const results = [];
const skip = /^(\/api\/|\/auth\/|mailto:|tel:|#)|\/logout|\/site\/|\/share\//;
while (queue.length && seen.size < 150) {
  const path = queue.shift();
  if (seen.has(path) || skip.test(path)) continue;
  seen.add(path);
  let status = 0;
  try {
    const res = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    status = res?.status() ?? 0;
    await page.waitForTimeout(400);
  } catch (e) { status = -1; }
  const finalPath = new URL(page.url()).pathname;
  results.push({ path, status, finalPath });
  if (status >= 400 || status <= 0) continue;
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const h of hrefs) {
    if (!h || !h.startsWith("/")) continue;
    const clean = h.split("#")[0];
    if (clean && !seen.has(clean) && !skip.test(clean)) queue.push(clean);
  }
}
const bad = results.filter((r) => r.status >= 400 || r.status <= 0);
console.log(`Crawled ${results.length} pages. Bad: ${bad.length}`);
for (const b of bad) console.log("BAD", b.status, b.path, "->", b.finalPath);
for (const [u, errs] of consoleErrors) console.log("CONSOLE", u, errs.slice(0, 2).join(" | "));
await browser.close();
