// Usage: node scripts/dev/shot.mjs <email> <password> <url1> [url2...]
import { chromium } from "@playwright/test";
const [email, password, ...urls] = process.argv.slice(2);
const base = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE " + m.text().slice(0, 300)); });
if (email && email !== "-") {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}
for (const u of urls) {
  const res = await page.goto(`${base}${u}`, { waitUntil: "networkidle" });
  // Cuộn qua toàn trang để các hiệu ứng hiện-khi-cuộn chạy trước khi chụp.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 900));
  });
  const name = u.replace(/[^a-z0-9]+/gi, "_").slice(0, 60);
  await page.screenshot({ path: `/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e/${name}.png`, fullPage: true });
  console.log(res?.status(), page.url(), `-> ${name}.png`);
}
for (const e of errors) console.log(e);
await browser.close();
