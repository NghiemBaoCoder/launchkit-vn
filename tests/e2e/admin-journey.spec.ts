import { expect, test, type Page } from "@playwright/test";
import { login, register, uniqueEmail } from "./helpers";

/** Hành trình admin (mục AQ). Cần tài khoản seed: pnpm seed:users. */
const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "admin@launchkit.vn", password: process.env.E2E_ADMIN_PASSWORD ?? "Admin@12345" };
const toast = (page: Page, text: string | RegExp) => expect(page.locator("[data-sonner-toast]").filter({ hasText: text }).first()).toBeVisible({ timeout: 20_000 });

test("admin journey: dashboard, users, businesses, orders, payments, credits, coupon, product, industry, generations, analytics", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  const stamp = Date.now().toString().slice(-6);

  // Dashboard
  await page.goto("/admin");
  await expect(page.getByText(/Doanh thu/).first()).toBeVisible();

  // Find & open a user
  await page.goto("/admin/users");
  const userLink = page.locator('a[href^="/admin/users/"]').first();
  await expect(userLink).toBeVisible();
  await userLink.click();
  await expect(page).toHaveURL(/\/admin\/users\/[0-9a-f-]{36}/);
  await expect(page.getByRole("button", { name: "Điều chỉnh credits" })).toBeVisible();

  // Adjust credits
  await page.getByRole("button", { name: "Điều chỉnh credits" }).click();
  await page.getByLabel("Số credits").fill("3");
  await page.getByLabel("Lý do").fill(`E2E admin ${stamp}`);
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await toast(page, /Đã cộng 3 credits/);

  // View user's business → open business detail
  await page.goto("/admin/businesses");
  const bizLink = page.locator('a[href^="/admin/businesses/"]').first();
  if (await bizLink.count()) {
    await bizLink.click();
    await expect(page).toHaveURL(/\/admin\/businesses\/[0-9a-f-]{36}/);
    await expect(page.getByText(/Chủ sở hữu|Owner|Người dùng/).first()).toBeVisible();
  }

  // Orders & payments
  await page.goto("/admin/orders");
  const orderLink = page.locator('a[href^="/admin/orders/"]').first();
  if (await orderLink.count()) {
    await orderLink.click();
    await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-f-]{36}/);
    await expect(page.getByText(/LK\d{6}-\d{5}/).first()).toBeVisible();
  }
  await page.goto("/admin/payments");
  const payLink = page.locator('a[href^="/admin/payments/"]').first();
  if (await payLink.count()) {
    await payLink.click();
    await expect(page).toHaveURL(/\/admin\/payments\/[0-9a-f-]{36}/);
    await expect(page.getByText(/mock/i).first()).toBeVisible();
  }

  // Create coupon
  await page.goto("/admin/coupons");
  await page.getByRole("button", { name: "Tạo mã" }).first().click();
  await page.getByLabel("Mã", { exact: true }).fill(`e2e${stamp}`);
  await page.getByLabel("Phần trăm giảm").fill("15");
  await page.getByRole("button", { name: "Tạo mã" }).last().click();
  await toast(page, new RegExp(`E2E${stamp}`));

  // Edit product pricing (sale price of Business Kit) and restore
  await page.goto("/admin/products");
  await page.locator('a[href^="/admin/products/"]').filter({ hasText: /Business Kit/ }).first().click();
  await expect(page).toHaveURL(/\/admin\/products\/[0-9a-f-]{36}/);
  const saleInput = page.getByLabel(/Giá khuyến mãi|Giá sale/);
  const original = await saleInput.inputValue();
  await saleInput.fill(original ? String(Number(original) + 1000) : "289000");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await toast(page, /Đã cập nhật sản phẩm/);
  await saleInput.fill(original);
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await toast(page, /Đã cập nhật sản phẩm/);

  // Create industry
  await page.goto("/admin/industries");
  await page.getByRole("button", { name: "Thêm ngành" }).first().click();
  await page.getByLabel("Tên ngành").fill(`Ngành E2E ${stamp}`);
  await page.getByRole("button", { name: "Tạo ngành" }).click();
  await toast(page, /Đã tạo ngành mới/);

  // Generation jobs & analytics
  await page.goto("/admin/generations");
  await expect(page.getByText(/Generation|Tạo nội dung/).first()).toBeVisible();
  await page.goto("/admin/analytics");
  await expect(page.getByText(/Xem landing/).first()).toBeVisible();
  await page.goto("/admin/settings/ai");
  await expect(page.getByRole("button", { name: "Lưu cài đặt AI" })).toBeVisible();
});

test("normal user cannot access admin", async ({ page }) => {
  const email = uniqueEmail("user");
  await register(page, email);
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(403);
  await expect(page.getByText("Bạn không có quyền truy cập")).toBeVisible();
  const api = await page.request.get("/admin/users");
  expect(api.status()).toBe(403);
});
