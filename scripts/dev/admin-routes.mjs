// Kiểm tra toàn bộ route /admin: đăng nhập super admin → mọi route 200; user thường → 403; khách → redirect login.
import { chromium } from "@playwright/test";
const base = "http://localhost:3000";
const OUT = "/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e";
const ADMIN = { email: process.env.ADMIN_EMAIL || "test1791132937512@example.com", password: "Password123!" };
const USER = { email: process.env.USER_EMAIL || "test1791132989077@example.com", password: "Password123!" };
const ids = JSON.parse(process.env.IDS || "{}");
const routes = [
  "/admin", "/admin?days=7", "/admin/analytics", "/admin/analytics?days=90",
  "/admin/users", "/admin/users?q=test&role=user&status=active", ids.user ? `/admin/users/${ids.user}` : null,
  "/admin/businesses", "/admin/businesses?status=ready", ids.business ? `/admin/businesses/${ids.business}` : null,
  "/admin/industries", "/admin/industries?q=web&active=active", "/admin/business-types", "/admin/templates", "/admin/templates?category=brand",
  "/admin/products", ids.product ? `/admin/products/${ids.product}` : null,
  "/admin/orders", "/admin/orders?status=paid&q=LK", ids.order ? `/admin/orders/${ids.order}` : null,
  "/admin/payments", ids.payment ? `/admin/payments/${ids.payment}` : null,
  "/admin/coupons", "/admin/generations", "/admin/generations?status=completed", "/admin/affiliates", "/admin/affiliates?status=approved",
  "/admin/settings/ai", "/admin/settings", "/admin/users/00000000-0000-0000-0000-000000000000", "/admin/khong-ton-tai",
].filter(Boolean);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

async function login(ctx, creds) {
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
  await page.close();
}

async function visitAll(ctx, label, shots) {
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGEERROR ${page.url()} ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE ${page.url()} ${m.text().slice(0, 200)}`); });
  for (const r of routes) {
    const res = await page.goto(`${base}${r}`, { waitUntil: "networkidle", timeout: 60000 });
    const status = res?.status();
    const finalUrl = page.url().replace(base, "");
    const title = (await page.title()).slice(0, 50);
    console.log(`${label.padEnd(6)} ${String(status).padEnd(4)} ${r.padEnd(60)} -> ${finalUrl === r ? "" : finalUrl} | ${title}`);
    if (shots) await page.screenshot({ path: `${OUT}/${label}-${r.replace(/[^a-z0-9]+/gi, "_").slice(0, 60)}.png`, fullPage: true });
  }
  await page.close();
  return errors;
}

// 1) Khách
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const res = await page.goto(`${base}/admin/users`);
  console.log(`guest  ${res.status()} /admin/users -> ${page.url().replace(base, "")}`);
  await ctx.close();
}
// 2) User thường
{
  const ctx = await browser.newContext();
  await login(ctx, USER);
  const errs = await visitAll(ctx, "user", false);
  await ctx.close();
}
// 3) Super admin
{
  const ctx = await browser.newContext();
  await login(ctx, ADMIN);
  const errs = await visitAll(ctx, "admin", true);
  // mobile viewport (context riêng, dùng lại cookie đăng nhập)
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: await ctx.storageState() });
  const m = await mctx.newPage();
  await m.goto(`${base}/admin`, { waitUntil: "networkidle" });
  await m.screenshot({ path: `${OUT}/admin-mobile.png`, fullPage: false });
  await m.getByRole("button", { name: "Mở menu" }).click();
  await m.waitForTimeout(400);
  await m.screenshot({ path: `${OUT}/admin-mobile-menu.png`, fullPage: false });
  await m.close();
  await mctx.close();
  console.log("ERRORS:", errs.length ? errs.join("\n") : "none");
  await ctx.close();
}
await browser.close();
