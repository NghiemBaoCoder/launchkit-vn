import { chromium } from "@playwright/test";
const [email, password, url] = process.argv.slice(2);
const base = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[" + m.type() + "]", m.text().slice(0, 2500)); });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
if (email !== "-") {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}
await page.goto(`${base}${url}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await browser.close();
