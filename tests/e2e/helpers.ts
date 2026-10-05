import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Password123!";

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
}

export async function register(page: Page, email: string, fullName = "Khách E2E", opts: { navigate?: boolean } = {}) {
  if (opts.navigate !== false) await page.goto("/register");
  await page.fill('input[name="fullName"]', fullName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.check('input[type="checkbox"]');
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/register"), { timeout: 30_000 });
}

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Menu tài khoản" }).click();
  await page.getByRole("menuitem", { name: /Đăng xuất/ }).click();
  await page.waitForURL(/\/login/, { timeout: 30_000 });
}

/** Hoàn thành wizard onboarding Freelancer / Phát triển website. */
export async function completeOnboarding(page: Page, name = "Minh Web Studio") {
  const next = () => page.getByRole("button", { name: /Tiếp tục/ }).click();
  await page.goto("/onboarding");
  await page.getByRole("button", { name: /^Bắt đầu$/ }).last().click();
  await page.getByRole("button", { name: /Freelancer/ }).first().click();
  await next();
  await page.getByRole("button", { name: /Phát triển website/ }).first().click();
  await next();
  await page.fill("#businessName", name);
  await page.fill("#location", "TP.HCM");
  await next();
  await page.fill("#targetCustomer", "Chủ spa nhỏ tại TP.HCM muốn có website nhận đặt lịch");
  await next();
  const productInput = page.getByPlaceholder("Ví dụ: Thiết kế website");
  await productInput.fill("Thiết kế website");
  await page.getByRole("button", { name: /^Thêm$/ }).click();
  await productInput.fill("Landing page");
  await page.getByRole("button", { name: /^Thêm$/ }).click();
  await next();
  await page.getByRole("button", { name: /Chuyên nghiệp/ }).first().click();
  await page.getByRole("button", { name: /Thân thiện/ }).first().click();
  await next();
  await page.getByRole("button", { name: /Indigo/ }).first().click();
  await next();
  await page.getByRole("button", { name: /^Facebook$/ }).first().click();
  await page.getByRole("button", { name: /^Zalo$/ }).first().click();
  await next();
  await page.getByRole("button", { name: /30 triệu/ }).first().click();
  await next();
  await page.getByRole("button", { name: /khách hàng đầu tiên/ }).first().click();
  await next();
  await expect(page.getByText("Xem lại trước khi tạo")).toBeVisible();
}

export async function waitForGeneration(page: Page) {
  await page.waitForURL(/\/generate\//, { timeout: 30_000 });
  await expect(page.getByRole("link", { name: /Mở workspace/ })).toBeVisible({ timeout: 120_000 });
  const url = page.url();
  return url.split("/generate/")[1].split("?")[0];
}
