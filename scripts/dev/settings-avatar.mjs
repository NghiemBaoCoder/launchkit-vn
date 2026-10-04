// Usage: node scripts/dev/settings-avatar.mjs <email> <password>
// Kiểm thử upload ảnh đại diện lên Storage (bucket avatars) + gỡ ảnh.
import { chromium } from "@playwright/test";
import zlib from "node:zlib";
const [email, password] = process.argv.slice(2);
const base = "http://localhost:3000";
const shots = "/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e";

// PNG 2x2 hợp lệ, tạo tại chỗ (không cần file mẫu).
function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(2, 0); ihdr.writeUInt32BE(2, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const raw = Buffer.from([0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 255, 255, 255, 0]);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE " + m.text().slice(0, 300)); });
let failed = false;
function check(cond, msg) { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failed = true; }
try {
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
  await page.goto(`${base}/settings/profile`, { waitUntil: "networkidle" });

  // Sai định dạng → lỗi client
  await page.setInputFiles('input[type="file"]', { name: "x.gif", mimeType: "image/gif", buffer: png });
  await page.getByText("Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP.").waitFor({ timeout: 5000 });
  check(true, "rejects unsupported mime type client-side");

  // Upload hợp lệ
  await page.setInputFiles('input[type="file"]', { name: "avatar.png", mimeType: "image/png", buffer: png });
  await page.getByText("Đã cập nhật ảnh đại diện").first().waitFor({ timeout: 20000 });
  await page.reload({ waitUntil: "networkidle" });
  const src = await page.locator('[data-slot="avatar-image"]').first().getAttribute("src").catch(() => null);
  check(!!src && src.includes("/storage/v1/object/public/avatars/"), "avatar url persisted and rendered: " + src);
  await page.screenshot({ path: `${shots}/flow-avatar.png` });

  // Gỡ ảnh qua ConfirmDialog
  await page.getByRole("button", { name: "Gỡ ảnh" }).click();
  await page.getByRole("alertdialog").waitFor({ timeout: 5000 });
  await page.getByRole("alertdialog").getByRole("button", { name: "Gỡ ảnh" }).click();
  await page.getByText("Đã gỡ ảnh đại diện").first().waitFor({ timeout: 15000 });
  await page.reload({ waitUntil: "networkidle" });
  check((await page.locator('[data-slot="avatar-image"]').count()) === 0, "avatar removed after confirm");
  check((await page.getByRole("button", { name: "Tải ảnh lên" }).count()) === 1, "upload button back to initial label");
} catch (e) {
  failed = true;
  console.log("FAILED", e.message);
  await page.screenshot({ path: `${shots}/flow-avatar-fail.png`, fullPage: true });
}
for (const e of errors) console.log(e);
await browser.close();
process.exit(failed ? 1 : 0);
