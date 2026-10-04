# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-journey.spec.ts >> admin journey: dashboard, users, businesses, orders, payments, credits, coupon, product, industry, generations, analytics
- Location: tests/e2e/admin-journey.spec.ts:8:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Landing/).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/Landing/).first() with timeout 15000ms
  - waiting for getByText(/Landing/).first()

```

```yaml
- complementary:
  - link "LaunchKit Quản trị":
    - /url: /admin
  - navigation "Điều hướng quản trị":
    - text: Tổng quan
    - link "Tổng quan":
      - /url: /admin
    - link "Analytics":
      - /url: /admin/analytics
    - text: Khách hàng
    - link "Người dùng":
      - /url: /admin/users
    - link "Business":
      - /url: /admin/businesses
    - link "Generation":
      - /url: /admin/generations
    - text: Thương mại
    - link "Đơn hàng":
      - /url: /admin/orders
    - link "Thanh toán":
      - /url: /admin/payments
    - link "Sản phẩm":
      - /url: /admin/products
    - link "Mã giảm giá":
      - /url: /admin/coupons
    - link "Affiliate":
      - /url: /admin/affiliates
    - text: Danh mục
    - link "Ngành":
      - /url: /admin/industries
    - link "Loại hình":
      - /url: /admin/business-types
    - link "Template":
      - /url: /admin/templates
    - text: Cài đặt
    - link "Cài đặt AI":
      - /url: /admin/settings/ai
    - link "Cài đặt site":
      - /url: /admin/settings
  - link "Về dashboard khách hàng":
    - /url: /dashboard
- banner:
  - text: Khu vực quản trị Super admin
  - link "Về dashboard khách hàng":
    - /url: /dashboard
  - button "Đổi giao diện"
  - button "Menu tài khoản": SA
- main:
  - heading "Analytics" [level=1]
  - paragraph: Phễu chuyển đổi và chỉ số tăng trưởng trong 30 ngày qua.
  - tablist "Chọn kỳ":
    - tab "7 ngày"
    - tab "30 ngày" [selected]
    - tab "90 ngày"
  - text: Tỷ lệ chuyển đổi 35.7% người mua / người đăng ký mới Doanh thu 1.495.000 ₫ 8 đơn đã thanh toán AOV 186.875 ₫ giá trị trung bình mỗi đơn Ngành dẫn đầu Phát triển website 2 business Kit → mua 66.7% business mới có đơn đã thanh toán Khách mua lại 3 tài khoản có > 1 đơn đã thanh toán Người dùng mới 14 tổng 14 Generation 3 0 thất bại Phễu chuyển đổi Tỷ lệ bên phải là % chuyển đổi so với bước liền trước.
  - list:
    - listitem:
      - text: Xem landing 4
      - paragraph: Khách truy cập trang chủ
    - listitem:
      - text: Bắt đầu tạo 6
      - paragraph: Bấm bắt đầu onboarding
      - text: 150%
    - listitem:
      - text: Đăng ký 14
      - paragraph: Tạo tài khoản
      - text: 233%
    - listitem:
      - text: Tạo xong kit 2
      - paragraph: Hoàn tất sinh nội dung
      - text: 14%
    - listitem:
      - text: Xem workspace 2
      - paragraph: Mở workspace xem trước
      - text: 100%
    - listitem:
      - text: Checkout 6
      - paragraph: Tạo đơn hàng
      - text: 300%
    - listitem:
      - text: Mua hàng 5
      - paragraph: Đơn đã thanh toán
      - text: 83%
  - text: Nguồn truy cập Theo tham số nguồn của lượt xem landing.
  - list:
    - listitem: direct 48
  - text: Sản phẩm theo doanh thu Toàn thời gian, chỉ tính đơn đã thanh toán. Business Kit Pro 599.000 ₫ 1 đơn Pro Membership 597.000 ₫ 5 đơn Business Kit 299.000 ₫ 2 đơn
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { login, register, uniqueEmail } from "./helpers";
  3   | 
  4   | /** Hành trình admin (mục AQ). Cần tài khoản seed: pnpm seed:users. */
  5   | const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "admin@launchkit.vn", password: process.env.E2E_ADMIN_PASSWORD ?? "Admin@12345" };
  6   | const toast = (page: Page, text: string | RegExp) => expect(page.locator("[data-sonner-toast]").filter({ hasText: text }).first()).toBeVisible({ timeout: 20_000 });
  7   | 
  8   | test("admin journey: dashboard, users, businesses, orders, payments, credits, coupon, product, industry, generations, analytics", async ({ page }) => {
  9   |   await login(page, ADMIN.email, ADMIN.password);
  10  |   const stamp = Date.now().toString().slice(-6);
  11  | 
  12  |   // Dashboard
  13  |   await page.goto("/admin");
  14  |   await expect(page.getByText(/Doanh thu/).first()).toBeVisible();
  15  | 
  16  |   // Find & open a user
  17  |   await page.goto("/admin/users");
  18  |   const userLink = page.locator('a[href^="/admin/users/"]').first();
  19  |   await expect(userLink).toBeVisible();
  20  |   await userLink.click();
  21  |   await expect(page).toHaveURL(/\/admin\/users\/[0-9a-f-]{36}/);
  22  |   await expect(page.getByRole("button", { name: "Điều chỉnh credits" })).toBeVisible();
  23  | 
  24  |   // Adjust credits
  25  |   await page.getByRole("button", { name: "Điều chỉnh credits" }).click();
  26  |   await page.getByLabel("Số credits").fill("3");
  27  |   await page.getByLabel("Lý do").fill(`E2E admin ${stamp}`);
  28  |   await page.getByRole("button", { name: "Xác nhận" }).click();
  29  |   await toast(page, /Đã cộng 3 credits/);
  30  | 
  31  |   // View user's business → open business detail
  32  |   await page.goto("/admin/businesses");
  33  |   const bizLink = page.locator('a[href^="/admin/businesses/"]').first();
  34  |   if (await bizLink.count()) {
  35  |     await bizLink.click();
  36  |     await expect(page).toHaveURL(/\/admin\/businesses\/[0-9a-f-]{36}/);
  37  |     await expect(page.getByText(/Chủ sở hữu|Owner|Người dùng/).first()).toBeVisible();
  38  |   }
  39  | 
  40  |   // Orders & payments
  41  |   await page.goto("/admin/orders");
  42  |   const orderLink = page.locator('a[href^="/admin/orders/"]').first();
  43  |   if (await orderLink.count()) {
  44  |     await orderLink.click();
  45  |     await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-f-]{36}/);
  46  |     await expect(page.getByText(/LK\d{6}-\d{5}/).first()).toBeVisible();
  47  |   }
  48  |   await page.goto("/admin/payments");
  49  |   const payLink = page.locator('a[href^="/admin/payments/"]').first();
  50  |   if (await payLink.count()) {
  51  |     await payLink.click();
  52  |     await expect(page).toHaveURL(/\/admin\/payments\/[0-9a-f-]{36}/);
  53  |     await expect(page.getByText(/mock/i).first()).toBeVisible();
  54  |   }
  55  | 
  56  |   // Create coupon
  57  |   await page.goto("/admin/coupons");
  58  |   await page.getByRole("button", { name: "Tạo mã" }).first().click();
  59  |   await page.getByLabel("Mã", { exact: true }).fill(`e2e${stamp}`);
  60  |   await page.getByLabel("Phần trăm giảm").fill("15");
  61  |   await page.getByRole("button", { name: "Tạo mã" }).last().click();
  62  |   await toast(page, new RegExp(`E2E${stamp}`));
  63  | 
  64  |   // Edit product pricing (sale price of Business Kit) and restore
  65  |   await page.goto("/admin/products");
  66  |   await page.locator('a[href^="/admin/products/"]').filter({ hasText: /Business Kit/ }).first().click();
  67  |   await expect(page).toHaveURL(/\/admin\/products\/[0-9a-f-]{36}/);
  68  |   const saleInput = page.getByLabel(/Giá khuyến mãi|Giá sale/);
  69  |   const original = await saleInput.inputValue();
  70  |   await saleInput.fill(original ? String(Number(original) + 1000) : "289000");
  71  |   await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  72  |   await toast(page, /Đã cập nhật sản phẩm/);
  73  |   await saleInput.fill(original);
  74  |   await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  75  |   await toast(page, /Đã cập nhật sản phẩm/);
  76  | 
  77  |   // Create industry
  78  |   await page.goto("/admin/industries");
  79  |   await page.getByRole("button", { name: "Thêm ngành" }).first().click();
  80  |   await page.getByLabel("Tên ngành").fill(`Ngành E2E ${stamp}`);
  81  |   await page.getByRole("button", { name: "Tạo ngành" }).click();
  82  |   await toast(page, /Đã tạo ngành mới/);
  83  | 
  84  |   // Generation jobs & analytics
  85  |   await page.goto("/admin/generations");
  86  |   await expect(page.getByText(/Generation|Tạo nội dung/).first()).toBeVisible();
  87  |   await page.goto("/admin/analytics");
> 88  |   await expect(page.getByText(/Landing/).first()).toBeVisible();
      |                                                   ^ Error: expect(locator).toBeVisible() failed
  89  |   await page.goto("/admin/settings/ai");
  90  |   await expect(page.getByRole("button", { name: "Lưu cài đặt AI" })).toBeVisible();
  91  | });
  92  | 
  93  | test("normal user cannot access admin", async ({ page }) => {
  94  |   const email = uniqueEmail("user");
  95  |   await register(page, email);
  96  |   const res = await page.goto("/admin");
  97  |   expect(res?.status()).toBe(403);
  98  |   await expect(page.getByText("Bạn không có quyền truy cập")).toBeVisible();
  99  |   const api = await page.request.get("/admin/users");
  100 |   expect(api.status()).toBe(403);
  101 | });
  102 | 
```