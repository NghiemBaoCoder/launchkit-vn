import { expect, test } from "@playwright/test";
import { completeOnboarding, login, logout, register, uniqueEmail, waitForGeneration, PASSWORD } from "./helpers";

/**
 * Hành trình khách hàng đầy đủ (mục AP trong đặc tả):
 * khách → wizard → đăng ký → tạo kit → workspace (preview khoá) → mua Business Kit (mock) → mở khoá →
 * sửa bảng giá → tạo nội dung → xuất kit → tải → đăng xuất → đăng nhập lại → dữ liệu còn nguyên.
 */
test("customer journey: guest → purchase → unlocked workspace → persisted", async ({ page, context }) => {
  const email = uniqueEmail("journey");

  // 1. Khách vào trang chủ và bấm "Tạo Business Kit"
  await page.goto("/");
  await page.getByRole("link", { name: /Tạo Business Kit/ }).first().click();
  await expect(page).toHaveURL(/\/onboarding/);

  // 2. Hoàn thành wizard với tư cách khách → được yêu cầu đăng ký
  await completeOnboarding(page);
  await page.getByRole("button", { name: /Đăng ký & tạo kit/ }).click();
  await expect(page).toHaveURL(/\/register/);
  await register(page, email, "Khách E2E", { navigate: false });

  // 3. Quay lại wizard (bản nháp còn nguyên) và tạo kit
  await expect(page).toHaveURL(/\/onboarding/);
  await expect(page.getByText("Xem lại trước khi tạo")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Minh Web Studio").first()).toBeVisible();
  await page.getByRole("button", { name: /Tạo Business Kit/ }).click();
  const businessId = await waitForGeneration(page);

  // 4. Vào workspace: thấy Brand, Services, Pricing cơ bản; premium bị khoá
  await page.goto(`/business/${businessId}/brand`);
  await expect(page.getByRole("heading", { name: "Thương hiệu" })).toBeVisible();
  await expect(page.getByText("Định vị thương hiệu")).toBeVisible();
  await page.goto(`/business/${businessId}/services`);
  await expect(page.getByText("Thiết kế website").first()).toBeVisible();
  await page.goto(`/business/${businessId}/sales`);
  await expect(page.getByText(/Bộ kịch bản bán hàng đầy đủ/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Mở khoá Business Kit/ }).first()).toBeVisible();

  // 5. Bấm mở khoá → checkout → coupon → mock payment thành công
  await page.getByRole("link", { name: /Mở khoá Business Kit/ }).first().click();
  await expect(page).toHaveURL(/\/checkout\/business-kit/);
  await page.getByPlaceholder(/DEMO50/).fill("DEMO50");
  await page.getByRole("button", { name: /Áp dụng/ }).click();
  await expect(page.getByText(/149\.500/).first()).toBeVisible({ timeout: 15_000 });
  await page.locator('input[name="payment_method"][value="mock"]').check(); // VNPay có thể là mặc định khi đã cấu hình
  await page.locator("#terms").click();
  await page.getByRole("button", { name: /^Thanh toán/ }).first().click();
  await expect(page).toHaveURL(/\/checkout\/pay\//, { timeout: 30_000 });
  await page.getByRole("button", { name: /Thanh toán thành công/ }).click();
  await expect(page).toHaveURL(/\/payment\/success/, { timeout: 30_000 });

  // 6. Workspace đã mở khoá
  await page.goto(`/business/${businessId}/sales`);
  await expect(page.getByText("Kịch bản tư vấn").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Mở khoá Business Kit/ })).toHaveCount(0);

  // 7. Sửa bảng giá (đổi tên gói)
  await page.goto(`/business/${businessId}/pricing`);
  await page.getByRole("button", { name: /Chỉnh sửa gói/ }).first().click();
  const nameInput = page.getByRole("dialog").locator("input").first();
  await nameInput.fill("Gói Khởi đầu");
  await page.getByRole("dialog").getByRole("button", { name: /^Lưu$/ }).click();
  await expect(page.getByText("Gói Khởi đầu").first()).toBeVisible({ timeout: 15_000 });

  // 8. Tạo nội dung mới
  await page.goto(`/business/${businessId}/content`);
  await page.getByRole("button", { name: /Tạo nội dung/ }).click();
  await page.getByRole("dialog").locator('input[name="title"]').fill("Bài test E2E");
  await page.getByRole("dialog").locator('textarea[name="caption"]').fill("Caption kiểm thử");
  await page.getByRole("dialog").getByRole("button", { name: /^Tạo$/ }).click();
  await page.getByRole("tab", { name: /Thư viện/ }).click();
  await expect(page.getByText("Bài test E2E").first()).toBeVisible({ timeout: 15_000 });

  // 9. Xuất kit (Markdown) và tải xuống
  await page.goto(`/business/${businessId}/downloads`);
  const [download] = await Promise.all([
    context.waitForEvent("page").then(async (p) => { await p.waitForLoadState().catch(() => {}); return p; }).catch(() => null),
    page.getByRole("button", { name: /^Markdown$/ }).click(),
  ]);
  void download;
  await expect(page.getByText(/Sẵn sàng/).first()).toBeVisible({ timeout: 60_000 });
  const downloadLink = page.getByRole("link", { name: /Tải/ }).first();
  await expect(downloadLink).toBeVisible();
  const href = await downloadLink.getAttribute("href");
  const res = await page.request.get(href!, { maxRedirects: 5 });
  expect(res.status()).toBe(200);
  expect((await res.text()).length).toBeGreaterThan(200);

  // 10. Đăng xuất → đăng nhập lại → dữ liệu còn nguyên
  await logout(page);
  await login(page, email, PASSWORD);
  await page.goto(`/business/${businessId}/pricing`);
  await expect(page.getByText("Gói Khởi đầu").first()).toBeVisible();
  await page.goto(`/dashboard/purchases`);
  await expect(page.getByText(/Business Kit/).first()).toBeVisible();
});

test("auth guard & 404/403", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=/);
  const res = await page.goto("/duong-dan-khong-ton-tai");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Không tìm thấy trang này")).toBeVisible();
});
