import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { register, uniqueEmail } from "./helpers";
import { vnpBuildPaymentUrl, vnpFormatDate, vnpParamsFrom, vnpVerify } from "../../src/lib/payments/vnpay/sign";

config({ path: ".env.local" });
const SECRET = process.env.VNPAY_HASH_SECRET ?? "";
const TMN = process.env.VNPAY_TMN_CODE ?? "";

/** Dựng tham số VNPay gửi về (ReturnUrl/IPN) đã ký, mô phỏng sandbox. */
function callback(params: Record<string, string>, responseCode: string, overrides: Record<string, string> = {}) {
  const p = {
    vnp_Amount: params.vnp_Amount,
    vnp_BankCode: "NCB",
    vnp_BankTranNo: `VNP${Date.now()}`,
    vnp_CardType: "ATM",
    vnp_OrderInfo: params.vnp_OrderInfo,
    vnp_PayDate: vnpFormatDate(new Date()),
    vnp_ResponseCode: responseCode,
    vnp_TmnCode: params.vnp_TmnCode,
    vnp_TransactionNo: String(14_000_000 + Math.floor(Math.random() * 1_000_000)),
    vnp_TransactionStatus: responseCode === "00" ? "00" : "02",
    vnp_TxnRef: params.vnp_TxnRef,
    ...overrides,
  };
  return vnpBuildPaymentUrl("", p, SECRET).replace(/^\?/, "");
}

test.describe("VNPay sandbox (mô phỏng callback đã ký)", () => {
  test.skip(!SECRET || !TMN, "Cần VNPAY_TMN_CODE và VNPAY_HASH_SECRET trong .env.local");

  test("checkout VNPay → IPN xác nhận → return về trang thành công; IPN lặp lại trả 02; chữ ký sai trả 97", async ({ page, request }) => {
    await register(page, uniqueEmail("vnpay"));
    // Chặn điều hướng ra sandbox thật, chỉ bắt URL.
    await page.route("https://sandbox.vnpayment.vn/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>VNPAY SANDBOX STUB</body></html>" }));

    await page.goto("/checkout/pro-membership");
    await page.locator('input[name="payment_method"][value="vnpay"]').check();
    await page.locator("#terms").click();
    await page.getByRole("button", { name: /^Thanh toán/ }).first().click();
    await page.waitForURL(/sandbox\.vnpayment\.vn/, { timeout: 30_000 });

    const payUrl = new URL(page.url());
    const params = vnpParamsFrom(payUrl.searchParams);
    expect(params.vnp_TmnCode).toBe(TMN);
    expect(params.vnp_Command).toBe("pay");
    expect(params.vnp_TxnRef).toMatch(/^[A-Z0-9]+$/);
    expect(vnpVerify(params, SECRET)).toBe(true);
    expect(params.vnp_ReturnUrl).toMatch(/\/api\/payments\/vnpay\/return$/);

    // IPN server-to-server
    const ipn1 = await request.get(`/api/payments/webhook/vnpay?${callback(params, "00")}`);
    expect(await ipn1.json()).toEqual({ RspCode: "00", Message: "Confirm Success" });
    const ipn2 = await request.get(`/api/payments/webhook/vnpay?${callback(params, "00")}`);
    expect((await ipn2.json()).RspCode).toBe("02");
    const bad = await request.get(`/api/payments/webhook/vnpay?${callback(params, "00")}&vnp_Amount=100`);
    expect((await bad.json()).RspCode).toBe("97");

    // Trình duyệt quay về ReturnUrl
    await page.goto(`/api/payments/vnpay/return?${callback(params, "00")}`);
    await expect(page).toHaveURL(/\/payment\/success/, { timeout: 30_000 });
    await page.goto("/dashboard/purchases");
    await expect(page.getByText(/Đã thanh toán/).first()).toBeVisible();
  });

  test("người dùng huỷ tại VNPay (mã 24) → trang thất bại có lý do", async ({ page }) => {
    await register(page, uniqueEmail("vnpay-cancel"));
    await page.route("https://sandbox.vnpayment.vn/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>STUB</body></html>" }));
    await page.goto("/checkout/pro-membership");
    await page.locator('input[name="payment_method"][value="vnpay"]').check();
    await page.locator("#terms").click();
    await page.getByRole("button", { name: /^Thanh toán/ }).first().click();
    await page.waitForURL(/sandbox\.vnpayment\.vn/, { timeout: 30_000 });
    const params = vnpParamsFrom(new URL(page.url()).searchParams);

    await page.goto(`/api/payments/vnpay/return?${callback(params, "24")}`);
    await expect(page).toHaveURL(/\/payment\/failed\?.*reason=vnpay/, { timeout: 30_000 });
    await expect(page.getByText(/huỷ giao dịch/).first()).toBeVisible();
  });
});
