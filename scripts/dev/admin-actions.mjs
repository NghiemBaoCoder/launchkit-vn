// E2E các server action admin: credits, khoá/mở khoá, đổi vai trò, CRUD ngành/loại hình/template/coupon/sản phẩm,
// hết hạn/hoàn tiền đơn, cài đặt AI/site, affiliate, retry generation.
import { chromium } from "@playwright/test";
const base = "http://localhost:3000";
const OUT = "/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e";
const ids = JSON.parse(process.env.IDS);
const ADMIN = { email: "test1791132937512@example.com", password: "Password123!" };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGEERROR ${page.url()} ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE ${page.url()} ${m.text().slice(0, 200)}`); });

const results = [];
const ONLY = process.env.ONLY;
async function step(name, fn) {
  if (ONLY && !name.startsWith(ONLY)) return;
  try {
    await fn();
    results.push(`PASS ${name}`);
    console.log(`PASS ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${e.message.split("\n")[0]}`);
    console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`);
    await page.screenshot({ path: `${OUT}/fail-${name.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true }).catch(() => {});
  }
}
const toast = async (text, timeout = 20000) => page.locator("[data-sonner-toast]").filter({ hasText: text }).first().waitFor({ timeout });
const dismissToasts = async () => { await page.keyboard.press("Escape").catch(() => {}); await page.waitForTimeout(300); };

await page.goto(`${base}/login`);
await page.fill('input[name="email"]', ADMIN.email);
await page.fill('input[name="password"]', ADMIN.password);
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });

// ---------- Users ----------
await step("users: adjust credits +5", async () => {
  await page.goto(`${base}/admin/users/${ids.user}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Điều chỉnh credits" }).click();
  await page.getByLabel("Số credits").fill("5");
  await page.getByLabel("Lý do").fill("E2E cộng credits");
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await toast("Đã cộng 5 credits");
});
await step("users: adjust credits insufficient -> error", async () => {
  await page.goto(`${base}/admin/users/${ids.user}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Điều chỉnh credits" }).click();
  await page.getByLabel("Số credits").fill("-99999");
  await page.getByLabel("Lý do").fill("E2E thử trừ quá số dư");
  const btn = page.getByRole("button", { name: "Xác nhận" });
  if (!(await btn.isDisabled())) throw new Error("Nút xác nhận phải bị disable khi số dư âm");
  await page.keyboard.press("Escape");
});
await step("users: suspend then reactivate", async () => {
  await page.goto(`${base}/admin/users/${ids.user}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tạm khoá" }).click();
  await page.getByLabel("Lý do (người dùng sẽ thấy)").fill("E2E kiểm thử tạm khoá tài khoản");
  await page.getByRole("button", { name: "Xác nhận tạm khoá" }).click();
  await toast("Đã tạm khoá tài khoản");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Mở khoá" }).first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Mở khoá" }).first().click();
  await page.getByRole("button", { name: "Mở khoá", exact: true }).last().click();
  await toast("Đã mở khoá tài khoản");
});
await step("users: change role user -> admin -> user", async () => {
  await page.goto(`${base}/admin/users/${ids.user}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Đổi vai trò" }).click();
  await page.locator("#role-select").selectOption("admin");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Đổi vai trò", exact: true }).last().click();
  await toast("Đã cập nhật vai trò");
  await page.waitForTimeout(1500);
  await page.goto(`${base}/admin/users/${ids.user}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Đổi vai trò" }).click();
  await page.locator("#role-select").selectOption("user");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Đổi vai trò", exact: true }).last().click();
  await toast("Đã cập nhật vai trò");
});

// ---------- Industries ----------
await step("industries: create, toggle, delete", async () => {
  await page.goto(`${base}/admin/industries`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Thêm ngành" }).first().click();
  await page.getByLabel("Tên ngành").fill("Ngành E2E Kiểm Thử");
  const slug = await page.getByLabel("Slug").inputValue();
  if (slug !== "nganh-e2e-kiem-thu") throw new Error(`slug auto sai: ${slug}`);
  await page.getByLabel("Icon (tên lucide)").fill("FlaskConical");
  await page.getByRole("button", { name: "Tạo ngành" }).click();
  await toast("Đã tạo ngành mới");
  await page.goto(`${base}/admin/industries?q=e2e`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "Ngành E2E Kiểm Thử" });
  await row.getByRole("switch").click();
  await toast("Đã tắt ngành");
  await dismissToasts();
  await page.waitForTimeout(1000);
  await row.getByRole("button", { name: "Xoá" }).click();
  await page.getByRole("button", { name: "Xoá", exact: true }).last().click();
  await toast("Đã xoá ngành");
});
await step("industries: delete blocked when referenced", async () => {
  await page.goto(`${base}/admin/industries?q=website`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "Phát triển website" });
  const del = row.getByRole("button", { name: "Xoá" });
  if (!(await del.isDisabled())) throw new Error("Nút xoá phải disable khi có business tham chiếu");
});
await step("industries: edit existing", async () => {
  await page.goto(`${base}/admin/industries?q=website`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "Phát triển website" });
  await row.getByRole("button", { name: "Sửa" }).click();
  const desc = page.getByLabel("Mô tả");
  const old = await desc.inputValue();
  await desc.fill(old);
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await toast("Đã cập nhật ngành");
});

// ---------- Business types ----------
await step("business types: create + delete", async () => {
  await page.goto(`${base}/admin/business-types`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Thêm loại hình" }).first().click();
  await page.getByLabel("Tên loại hình").fill("Loại hình E2E");
  await page.getByLabel("Điểm nổi bật").fill("Điểm 1\nĐiểm 2");
  await page.getByRole("button", { name: "Tạo loại hình" }).click();
  await toast("Đã tạo loại hình mới");
  await page.goto(`${base}/admin/business-types?q=e2e`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "Loại hình E2E" });
  await row.getByRole("button", { name: "Xoá" }).click();
  await page.getByRole("button", { name: "Xoá", exact: true }).last().click();
  await toast("Đã xoá loại hình");
});

// ---------- Templates ----------
await step("templates: create (invalid JSON rejected) + edit bumps version + delete", async () => {
  await page.goto(`${base}/admin/templates`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tạo template" }).first().click();
  await page.getByLabel("Tên").first().fill("Template E2E");
  await page.getByLabel("Config (JSON)").fill("{ không hợp lệ");
  await page.getByRole("button", { name: "Tạo template" }).last().click();
  await page.getByText("Config phải là JSON object hợp lệ").waitFor({ timeout: 5000 });
  await page.getByLabel("Config (JSON)").fill('{"tone": "e2e", "items": 3}');
  await page.getByRole("button", { name: "Tạo template" }).last().click();
  await toast("Đã tạo template");
  await page.goto(`${base}/admin/templates?q=e2e`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "Template E2E" });
  await row.getByRole("button", { name: "Sửa" }).click();
  await page.getByRole("button", { name: "Lưu (tăng phiên bản)" }).click();
  await toast("phiên bản 2");
  await dismissToasts();
  await page.waitForTimeout(1000);
  await row.getByRole("button", { name: "Xoá" }).click();
  await page.getByRole("button", { name: "Xoá", exact: true }).last().click();
  await toast("Đã xoá template");
});

// ---------- Coupons ----------
await step("coupons: create + toggle off", async () => {
  await page.goto(`${base}/admin/coupons`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tạo mã" }).first().click();
  await page.getByLabel("Mã", { exact: true }).fill("e2e-test");
  await page.getByLabel("Phần trăm giảm").fill("15");
  await page.getByLabel("Giảm tối đa (VND)").fill("50000");
  await page.getByRole("button", { name: "Tạo mã" }).last().click();
  await toast("Đã tạo mã E2E-TEST");
  await page.goto(`${base}/admin/coupons?q=e2e`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "E2E-TEST" });
  await row.getByRole("switch").click();
  await toast("Đã vô hiệu hoá mã");
});
await step("coupons: duplicate code rejected", async () => {
  await page.goto(`${base}/admin/coupons`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tạo mã" }).first().click();
  await page.getByLabel("Mã", { exact: true }).fill("E2E-TEST");
  await page.getByLabel("Phần trăm giảm").fill("10");
  await page.getByRole("button", { name: "Tạo mã" }).last().click();
  await toast("đã tồn tại");
  await page.keyboard.press("Escape");
});

// ---------- Products ----------
let productId = null;
await step("products: create via dialog -> edit page -> save", async () => {
  await page.goto(`${base}/admin/products`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tạo sản phẩm" }).first().click();
  await page.getByLabel("Tên").first().fill("Sản phẩm E2E");
  await page.getByLabel("Giá (VND)").fill("123000");
  await page.getByRole("button", { name: "Tạo & chỉnh sửa" }).click();
  await page.waitForURL(/\/admin\/products\/[0-9a-f-]{36}/, { timeout: 20000 });
  productId = page.url().split("/").pop();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Mô tả").fill("Mô tả E2E");
  await page.getByText("Template cao cấp").click();
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await toast("Đã cập nhật sản phẩm");
});
await step("products: toggle active in list", async () => {
  await page.goto(`${base}/admin/products?q=e2e`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: "Sản phẩm E2E" });
  await row.getByRole("switch").click();
  await toast("Đã bật sản phẩm");
});

// ---------- Orders ----------
await step("orders: expire pending order", async () => {
  await page.goto(`${base}/admin/orders/${ids.pending}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Đánh dấu hết hạn" }).click();
  await page.getByRole("button", { name: "Đánh dấu hết hạn", exact: true }).last().click();
  await toast("hết hạn");
});
await step("orders: refund paid order (type-to-confirm)", async () => {
  await page.goto(`${base}/admin/orders/${ids.paid}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Đánh dấu hoàn tiền" }).click();
  const confirm = page.getByRole("button", { name: "Xác nhận hoàn tiền" });
  if (!(await confirm.isDisabled())) throw new Error("Nút xác nhận phải disable khi chưa gõ mã đơn");
  await page.getByPlaceholder(ids.paidNo).fill(ids.paidNo);
  await confirm.click();
  await toast("Đã đánh dấu hoàn tiền");
  await page.waitForTimeout(1500);
  await page.goto(`${base}/admin/orders/${ids.paid}`, { waitUntil: "networkidle" });
  await page.getByText("Đã hoàn tiền").first().waitFor();
});

// ---------- Settings ----------
await step("settings ai: save stage_delay then revert", async () => {
  await page.goto(`${base}/admin/settings/ai`, { waitUntil: "networkidle" });
  const f = page.getByLabel("Độ trễ mock mỗi stage (ms)");
  const old = await f.inputValue();
  await f.fill(String(Number(old) + 1));
  await page.getByRole("button", { name: "Lưu cài đặt AI" }).click();
  await toast("Đã lưu cài đặt AI");
  await dismissToasts();
  await page.waitForTimeout(800);
  await f.fill(old);
  await page.getByRole("button", { name: "Lưu cài đặt AI" }).click();
  await toast("Đã lưu cài đặt AI");
});
await step("settings site: save (super admin)", async () => {
  await page.goto(`${base}/admin/settings`, { waitUntil: "networkidle" });
  const f = page.getByLabel("Tên site");
  const old = await f.inputValue();
  await f.fill(old + " ");
  await page.getByRole("button", { name: "Lưu cài đặt site" }).click();
  await toast("Đã lưu cài đặt site");
});

// ---------- Affiliates ----------
await step("affiliates: update notes/status", async () => {
  await page.goto(`${base}/admin/affiliates`, { waitUntil: "networkidle" });
  const row = page.getByRole("row").filter({ hasText: ADMIN.email });
  await row.getByRole("button", { name: "Trạng thái" }).click();
  await page.locator(`textarea[id^="aff-notes-"]`).fill("Ghi chú E2E");
  await page.getByRole("button", { name: "Lưu" }).click();
  await toast("Đã cập nhật trạng thái");
  await dismissToasts();
  await row.getByRole("button", { name: /Hoa hồng/ }).click();
  await page.getByText("Thanh toán hoa hồng được thực hiện thủ công").waitFor();
  await page.keyboard.press("Escape");
});

// ---------- Generations ----------
await step("generations: retry failed job -> completed", async () => {
  await page.goto(`${base}/admin/generations?q=${ids.job}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Chi tiết" }).first().click();
  await page.getByText("E2E injected failure").first().waitFor();
  await page.getByRole("button", { name: "Thử lại job" }).click();
  await page.getByRole("button", { name: "Chạy lại" }).click();
  await toast("Đã tạo lại thành công", 60000);
});

// ---------- Not-found inside shell ----------
await step("not-found: unknown admin route renders admin not-found", async () => {
  await page.goto(`${base}/admin/duong-dan-khong-ton-tai`, { waitUntil: "networkidle" });
  await page.getByText("Không tìm thấy dữ liệu").waitFor();
  await page.getByText("Khu vực quản trị").waitFor();
});

// ---------- Mobile shell ----------
await step("mobile: sheet nav opens", async () => {
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: await ctx.storageState() });
  const m = await mctx.newPage();
  await m.goto(`${base}/admin`, { waitUntil: "networkidle" });
  await m.screenshot({ path: `${OUT}/admin-mobile.png` });
  await m.getByRole("button", { name: "Mở menu" }).click();
  await m.getByRole("link", { name: "Người dùng" }).waitFor();
  await m.screenshot({ path: `${OUT}/admin-mobile-menu.png` });
  await m.getByRole("link", { name: "Người dùng" }).click();
  await m.waitForURL(/\/admin\/users/);
  await m.waitForLoadState("networkidle");
  await m.screenshot({ path: `${OUT}/admin-mobile-users.png` });
  await mctx.close();
});

console.log("\nSUMMARY");
for (const r of results) console.log(r);
console.log("CLIENT ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
