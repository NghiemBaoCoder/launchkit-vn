// Chụp màn hình mobile (390px) và kiểm tra tràn ngang.
import { chromium } from "@playwright/test";
const [email, password, ...urls] = process.argv.slice(2);
const base = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
if (email !== "-") {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}
for (const u of urls) {
  const res = await page.goto(`${base}${u}`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const name = "m" + u.replace(/[^a-z0-9]+/gi, "_").slice(0, 50);
  await page.screenshot({ path: `/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e/${name}.png`, fullPage: false });
  console.log(res?.status(), u, overflow ? "OVERFLOW-X!" : "ok", `-> ${name}.png`);
}
await browser.close();
