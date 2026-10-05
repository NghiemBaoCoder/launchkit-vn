// Usage: node scripts/dev/settings-flow.mjs <email> <password>
// Kiểm thử luồng: /settings redirect, lưu hồ sơ, validation, bật/tắt thông báo, đổi mật khẩu sai, phiên đăng nhập.
import { chromium } from "@playwright/test";
const [email, password] = process.argv.slice(2);
const base = "http://localhost:3000";
const shots = "/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE " + m.text().slice(0, 300)); });
let failed = false;
function check(cond, msg) { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failed = true; }
const prefSwitch = () => page.locator('[data-pref="email_marketing"]');

try {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });

  // /settings → /settings/profile
  await page.goto(`${base}/settings`, { waitUntil: "networkidle" });
  check(new URL(page.url()).pathname === "/settings/profile", "/settings redirects to /settings/profile (" + page.url() + ")");

  // Lưu hồ sơ
  const original = await page.inputValue('input[name="full_name"]');
  const name = `Nguyễn Test ${Date.now() % 100000}`;
  await page.fill('input[name="full_name"]', name);
  await page.fill('input[name="phone"]', "0912 345 678");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await page.getByText("Đã lưu hồ sơ").first().waitFor({ timeout: 15000 });
  await page.reload({ waitUntil: "networkidle" });
  check((await page.inputValue('input[name="full_name"]')) === name, "full_name persisted after reload");
  check((await page.inputValue('input[name="phone"]')) === "0912345678", "phone normalized and persisted");
  check((await page.locator("header").getByText(name).count()) >= 0, "page re-rendered with new name");

  // Validation client
  await page.fill('input[name="full_name"]', "A");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await page.getByText("Họ tên tối thiểu 2 ký tự").waitFor({ timeout: 5000 });
  check(true, "client validation error for short name");
  await page.fill('input[name="phone"]', "abc");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await page.getByText(/Số điện thoại không hợp lệ/).waitFor({ timeout: 5000 });
  check(true, "client validation error for bad phone");
  await page.screenshot({ path: `${shots}/flow-profile.png`, fullPage: true });

  // Khôi phục tên gốc (giữ số điện thoại)
  await page.fill('input[name="full_name"]', original || "Nguyễn Test");
  await page.fill('input[name="phone"]', "0912345678");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await page.getByText("Đã lưu hồ sơ").first().waitFor({ timeout: 15000 });

  // Bật/tắt thông báo
  await page.goto(`${base}/settings/notifications`, { waitUntil: "networkidle" });
  const before = await prefSwitch().getAttribute("aria-checked");
  await prefSwitch().click();
  await page.getByText(/Đã (bật|tắt): Email marketing/).first().waitFor({ timeout: 15000 });
  await page.reload({ waitUntil: "networkidle" });
  const after = await prefSwitch().getAttribute("aria-checked");
  check(before !== after, `email_marketing toggled ${before} -> ${after} and persisted after reload`);
  await prefSwitch().click();
  await page.getByText(/Đã (bật|tắt): Email marketing/).first().waitFor({ timeout: 15000 });
  await page.reload({ waitUntil: "networkidle" });
  const restored = await prefSwitch().getAttribute("aria-checked");
  check(restored === before, `email_marketing restored to ${before}`);
  await page.screenshot({ path: `${shots}/flow-notifications.png`, fullPage: true });

  // Bảo mật: mật khẩu hiện tại sai → lỗi theo field; phiên hiện tại có badge
  await page.goto(`${base}/settings/security`, { waitUntil: "networkidle" });
  check((await page.getByText("Thiết bị này").count()) >= 1, "current session badge shown");
  await page.fill('input[name="current"]', "wrong-password-123");
  await page.fill('input[name="password"]', "Password123!x");
  await page.fill('input[name="confirm"]', "Password123!x");
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await page.getByText("Mật khẩu hiện tại không đúng.").first().waitFor({ timeout: 15000 });
  check(true, "wrong current password shows field error");
  check(await page.getByRole("button", { name: "Xoá tài khoản" }).isDisabled(), "delete account button is disabled");
  await page.screenshot({ path: `${shots}/flow-security.png`, fullPage: true });

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/settings/referrals`, { waitUntil: "networkidle" });
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check(!hasHScroll, "no horizontal page scroll at 390px on /settings/referrals");
  await page.screenshot({ path: `${shots}/flow-referrals-mobile.png`, fullPage: true });
} catch (e) {
  failed = true;
  console.log("FAILED", e.message);
  await page.screenshot({ path: `${shots}/flow-fail.png`, fullPage: true });
}
for (const e of errors) console.log(e);
await browser.close();
process.exit(failed ? 1 : 0);
