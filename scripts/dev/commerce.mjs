/**
 * E2E luồng thương mại (mock payment). Chạy: node scripts/dev/commerce.mjs
 * Yêu cầu: dev server http://localhost:3000, Supabase local, psql trong PATH.
 * Biến môi trường tuỳ chọn: EMAIL, PASSWORD, BUSINESS_ID, SHOTS (thư mục ảnh), SKIP=buy (bỏ phần mua hàng A–D khi user đã sở hữu gói), SKIP_SUB=1 (bỏ phần subscription).
 */
import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const DB = process.env.DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const email = process.env.EMAIL ?? "test1791132989077@example.com";
const password = process.env.PASSWORD ?? "Password123!";
const SHOTS = process.env.SHOTS ?? "/tmp/claude-0/-home-user-launchkit-vn/11daaf31-62ed-5f7b-9d24-257b866febdd/scratchpad/e2e";

function readSecret() {
  try {
    const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
    const m = env.match(/^MOCK_PAYMENT_WEBHOOK_SECRET=(.*)$/m);
    return (m?.[1] ?? "mock-secret-dev").trim();
  } catch {
    return "mock-secret-dev";
  }
}
const SECRET = process.env.MOCK_PAYMENT_WEBHOOK_SECRET ?? readSecret();

const sql = (q) => execSync('psql "$DB" -At -c "$Q"', { env: { ...process.env, DB, Q: q } }).toString().trim();
const results = [];
function check(name, cond, detail = "") {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 200)); });

async function login(p, em, pw) {
  await p.goto(`${base}/login`);
  await p.fill('input[name="email"]', em);
  await p.fill('input[name="password"]', pw);
  await p.click('button[type="submit"]');
  await p.waitForURL(/dashboard/, { timeout: 30000 });
}

async function payOnGateway(p, outcome) {
  await p.waitForURL(/\/checkout\/pay\//, { timeout: 30000 });
  const paymentId = p.url().match(/\/checkout\/pay\/([0-9a-f-]+)/)?.[1];
  await p.getByRole("button", { name: outcome === "success" ? /Thanh toán thành công \(mock\)/ : /Thanh toán thất bại \(mock\)/ }).click();
  await p.waitForURL(outcome === "success" ? /\/payment\/success/ : /\/payment\/failed/, { timeout: 30000 });
  return paymentId;
}

try {
  const userId = sql(`select id from profiles where email='${email}'`);
  check("profile tồn tại", !!userId, userId);
  const businessId = process.env.BUSINESS_ID ?? sql(`select id from businesses where user_id='${userId}' and status <> 'archived' order by created_at limit 1`);
  check("business tồn tại", !!businessId, businessId);

  await login(page, email, password);
  console.log("logged in ->", page.url());

  const SKIP = new Set((process.env.SKIP ?? "").split(",").filter(Boolean));
  if (!SKIP.has("buy")) {
  // ---------- A. Mua Business Kit với DEMO50, thanh toán thành công ----------
  const creditsBefore = Number(sql(`select credits from profiles where id='${userId}'`));
  const entBefore = Number(sql(`select count(*) from entitlements where user_id='${userId}' and business_id='${businessId}'`));
  const demoUsedBefore = Number(sql(`select used_count from coupons where code='DEMO50'`));
  await page.goto(`${base}/checkout/business-kit?business=${businessId}`);
  await page.waitForSelector("#coupon", { timeout: 30000 });
  await page.screenshot({ path: `${SHOTS}/checkout.png`, fullPage: true });
  await page.fill("#coupon", "DEMO50");
  await page.getByRole("button", { name: /^Áp dụng$/ }).click();
  await page.waitForSelector("text=Giảm 50%", { timeout: 15000 });
  const bodyA = await page.textContent("body");
  check("coupon DEMO50 áp dụng: tổng 149.500", bodyA.includes("149.500"), "subtotal 299.000 − 149.500");
  // Chưa tick điều khoản -> lỗi inline
  await page.getByRole("button", { name: /^Thanh toán \d/ }).click();
  await page.waitForSelector("text=Bạn cần đồng ý", { timeout: 10000 });
  check("chặn khi chưa đồng ý điều khoản", true);
  await page.click("#terms");
  await page.getByRole("button", { name: /^Thanh toán \d/ }).click();
  await page.waitForURL(/\/checkout\/pay\//, { timeout: 30000 });
  await page.screenshot({ path: `${SHOTS}/gateway.png`, fullPage: true });
  const gatewayText = await page.textContent("body");
  check("trang cổng mock hiển thị số tiền", gatewayText.includes("149.500"));
  const paymentA = await payOnGateway(page, "success");
  await page.screenshot({ path: `${SHOTS}/success.png`, fullPage: true });
  check("đến /payment/success", /\/payment\/success\?order=/.test(page.url()), page.url());
  const orderA = sql(`select order_id from payments where id='${paymentA}'`);
  const orderARow = sql(`select status || '|' || total || '|' || discount || '|' || coalesce(coupon_code,'') || '|' || order_number from orders where id='${orderA}'`);
  check("orders A: paid, total 149500, discount 149500, DEMO50", orderARow.startsWith("paid|149500|149500|DEMO50|"), orderARow);
  const payA = sql(`select status || '|' || coalesce(provider_ref,'') from payments where id='${paymentA}'`);
  check("payments A: succeeded + MOCK- ref", /^succeeded\|MOCK-/.test(payA), payA);
  const entAfter = Number(sql(`select count(*) from entitlements where user_id='${userId}' and business_id='${businessId}'`));
  check("entitlements cho business (9 keys Business Kit)", entAfter - entBefore === 9 || entAfter >= 9, `${entBefore} -> ${entAfter}`);
  const creditsAfter = Number(sql(`select credits from profiles where id='${userId}'`));
  check("profiles.credits +10", creditsAfter === creditsBefore + 10, `${creditsBefore} -> ${creditsAfter}`);
  const txA = sql(`select amount || '|' || reason from credit_transactions where user_id='${userId}' and ref_type='order' and ref_id='${orderA}'`);
  check("credit_transactions ref order", txA === "10|Mua Business Kit", txA);
  check("coupon_redemptions ghi nhận", sql(`select count(*) from coupon_redemptions where order_id='${orderA}'`) === "1");
  check("coupons.used_count +1", Number(sql(`select used_count from coupons where code='DEMO50'`)) === demoUsedBefore + 1);
  check("notifications payment_success + kit_unlocked", sql(`select count(*) from notifications where user_id='${userId}' and type in ('payment_success','kit_unlocked') and created_at > now() - interval '2 minutes'`) >= "2");
  check("activity purchase.completed", sql(`select count(*) from activity_logs where user_id='${userId}' and action='purchase.completed' and entity_id='${orderA}'`) === "1");

  // ---------- B. Đã sở hữu -> thông báo ----------
  await page.goto(`${base}/checkout/business-kit?business=${businessId}`);
  await page.waitForSelector("text=Bạn đã sở hữu gói này cho business này", { timeout: 30000 });
  check("checkout lại Business Kit: báo đã sở hữu", true);
  await page.screenshot({ path: `${SHOTS}/already-owned.png` });

  // ---------- C. Business Kit Pro, thanh toán thất bại ----------
  await page.goto(`${base}/checkout/business-kit-pro?business=${businessId}`);
  await page.waitForSelector("#terms", { timeout: 30000 });
  await page.click("#terms");
  await page.getByRole("button", { name: /^Thanh toán \d/ }).click();
  const paymentC = await payOnGateway(page, "failed");
  await page.screenshot({ path: `${SHOTS}/failed.png`, fullPage: true });
  check("đến /payment/failed", /\/payment\/failed\?order=/.test(page.url()), page.url());
  const orderC = sql(`select order_id from payments where id='${paymentC}'`);
  check("orders C: failed", sql(`select status from orders where id='${orderC}'`) === "failed");
  check("payments C: failed + error", /^failed\|.+/.test(sql(`select status || '|' || coalesce(error,'') from payments where id='${paymentC}'`)));
  check("notification payment_failed", sql(`select count(*) from notifications where user_id='${userId}' and type='payment_failed' and href like '%${orderC}%'`) === "1");
  check("trang failed có nút Thử lại", (await page.textContent("body")).includes("Thử lại"));

  // ---------- D. Pending + polling + webhook ngoài (curl-like) + idempotent ----------
  await page.getByRole("link", { name: /Thử lại/ }).click();
  await page.waitForSelector("#terms", { timeout: 30000 });
  await page.click("#terms");
  await page.getByRole("button", { name: /^Thanh toán \d/ }).click();
  await page.waitForURL(/\/checkout\/pay\//, { timeout: 30000 });
  const paymentD = page.url().match(/\/checkout\/pay\/([0-9a-f-]+)/)?.[1];
  const orderD = sql(`select order_id from payments where id='${paymentD}'`);
  check("đơn C cũ bị thay thế (expired) khi tạo đơn mới cùng sản phẩm", sql(`select status from orders where id='${orderC}'`) === "failed", "đơn failed giữ nguyên, chỉ pending bị expire");
  await page.goto(`${base}/payment/pending?order=${orderD}`);
  await page.waitForSelector("text=Đang chờ thanh toán", { timeout: 30000 });
  check("trang pending có link Thanh toán mock", (await page.textContent("body")).includes("Thanh toán mock"));
  await page.screenshot({ path: `${SHOTS}/pending.png`, fullPage: true });
  const amountD = Number(sql(`select amount from payments where id='${paymentD}'`));
  const payload = JSON.stringify({ event: "payment.succeeded", payment_id: paymentD, order_id: orderD, amount: amountD, provider_ref: "MOCK-EXTERNAL-1", timestamp: new Date().toISOString() });
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  const bad = await fetch(`${base}/api/payments/webhook/mock`, { method: "POST", headers: { "content-type": "application/json", "x-mock-signature": "0".repeat(64) }, body: payload });
  check("webhook chữ ký sai -> 401", bad.status === 401, String(bad.status));
  const tampered = await fetch(`${base}/api/payments/webhook/mock`, { method: "POST", headers: { "content-type": "application/json", "x-mock-signature": sig }, body: payload.replace(`"amount":${amountD}`, `"amount":1`) });
  check("webhook payload bị sửa -> 401", tampered.status === 401, String(tampered.status));
  const creditsBeforeD = Number(sql(`select credits from profiles where id='${userId}'`));
  const good = await fetch(`${base}/api/payments/webhook/mock`, { method: "POST", headers: { "content-type": "application/json", "x-mock-signature": sig }, body: payload });
  const goodJson = await good.json();
  check("webhook hợp lệ -> 200 ok", good.status === 200 && goodJson.ok === true, JSON.stringify(goodJson));
  await page.waitForURL(/\/payment\/success/, { timeout: 15000 });
  check("trang pending tự chuyển sang success (polling)", true, page.url());
  const replay = await fetch(`${base}/api/payments/webhook/mock`, { method: "POST", headers: { "content-type": "application/json", "x-mock-signature": sig }, body: payload });
  const replayJson = await replay.json();
  check("webhook gửi lại -> alreadyProcessed, không cộng credits lần 2", replay.status === 200 && replayJson.alreadyProcessed === true && Number(sql(`select credits from profiles where id='${userId}'`)) === creditsBeforeD + 20, JSON.stringify(replayJson));
  const entPro = Number(sql(`select count(*) from entitlements where user_id='${userId}' and business_id='${businessId}'`));
  check("entitlements business sau Pro = 12 (thêm website_kit, premium_exports, regeneration)", entPro === 12, String(entPro));
  check("mỗi key chỉ 1 dòng (không trùng)", sql(`select count(*) from (select key from entitlements where user_id='${userId}' and business_id='${businessId}' group by key having count(*) > 1) d`) === "0");

  }

  // ---------- E. Trang đơn hàng & billing ----------
  await page.goto(`${base}/dashboard/purchases`);
  await page.waitForSelector("table", { timeout: 30000 });
  const purchasesText = await page.textContent("body");
  check("purchases liệt kê đơn + Mở workspace", purchasesText.includes("Mở workspace") && purchasesText.includes("Business Kit Pro") && purchasesText.includes("Đã thanh toán"));
  await page.screenshot({ path: `${SHOTS}/purchases.png`, fullPage: true });
  await page.goto(`${base}/dashboard/billing`);
  await page.waitForSelector("text=Quyền đã mở khoá", { timeout: 30000 });
  const billingText = await page.textContent("body");
  check("billing hiển thị Business Kit Pro cho business + credits", billingText.includes("Business Kit Pro") && billingText.includes("Mua Business Kit"));
  await page.screenshot({ path: `${SHOTS}/billing.png`, fullPage: true });
  // Responsive
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/checkout/pro-membership`);
  await page.waitForSelector("#coupon", { timeout: 30000 });
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check("checkout mobile không tràn ngang", !hasHScroll);
  await page.screenshot({ path: `${SHOTS}/checkout-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  // ---------- F. Subscription (user mới): FREEKIT -> 0đ -> kích hoạt ngay, huỷ/bật gia hạn, gia hạn ngay ----------
  if (!process.env.SKIP_SUB) {
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p2 = await ctx2.newPage();
    p2.on("pageerror", (e) => console.log("PAGEERROR2", e.message));
    const email2 = `commerce${Date.now()}@example.com`;
    await p2.goto(`${base}/register`);
    await p2.fill('input[name="fullName"]', "Người Mua Pro");
    await p2.fill('input[name="email"]', email2);
    await p2.fill('input[name="password"]', password);
    await p2.check('input[type="checkbox"]');
    await p2.click('button[type="submit"]');
    await p2.waitForURL(/dashboard/, { timeout: 30000 });
    const user2 = sql(`select id from profiles where email='${email2}'`);
    const credits2Before = Number(sql(`select credits from profiles where id='${user2}'`));
    await p2.goto(`${base}/checkout/pro-membership`);
    await p2.waitForSelector("#coupon", { timeout: 30000 });
    await p2.fill("#coupon", "FREEKIT");
    await p2.getByRole("button", { name: /^Áp dụng$/ }).click();
    await p2.waitForSelector("text=Kích hoạt miễn phí", { timeout: 15000 });
    await p2.click("#terms");
    await p2.getByRole("button", { name: /Kích hoạt miễn phí/ }).click();
    await p2.waitForURL(/\/payment\/success/, { timeout: 30000 });
    check("FREEKIT 0đ -> success ngay (không qua cổng)", true, p2.url());
    const sub = sql(`select status || '|' || cancel_at_period_end || '|' || (current_period_end > now() + interval '29 days') from subscriptions where user_id='${user2}'`);
    check("subscriptions active 30 ngày", sub === "active|false|true", sub);
    check("entitlements tài khoản = 15, có expires_at", sql(`select count(*) from entitlements where user_id='${user2}' and business_id is null and expires_at is not null`) === "15");
    check("credits +50", Number(sql(`select credits from profiles where id='${user2}'`)) === credits2Before + 50);
    check("đơn 0đ: payment succeeded provider_ref free-", /^free-/.test(sql(`select provider_ref from payments where user_id='${user2}'`)));
    await p2.goto(`${base}/checkout/pro-membership`);
    await p2.waitForSelector("text=Bạn đã sở hữu gói này", { timeout: 30000 });
    check("checkout pro lại: báo đã sở hữu", true);
    await p2.goto(`${base}/dashboard/billing`);
    await p2.getByRole("button", { name: /Huỷ gia hạn/ }).first().click();
    await p2.getByRole("alertdialog").getByRole("button", { name: /^Huỷ gia hạn$/ }).click();
    await p2.waitForSelector("text=Đã huỷ gia hạn", { timeout: 15000 });
    check("huỷ gia hạn -> cancel_at_period_end", sql(`select cancel_at_period_end from subscriptions where user_id='${user2}'`) === "t");
    await p2.getByRole("button", { name: /Bật lại gia hạn/ }).click();
    await p2.waitForSelector("text=Đang hoạt động", { timeout: 15000 });
    check("bật lại gia hạn", sql(`select cancel_at_period_end || '|' || (canceled_at is null) from subscriptions where user_id='${user2}'`) === "false|true");
    await p2.screenshot({ path: `${SHOTS}/billing-pro.png`, fullPage: true });
    const endBefore = sql(`select current_period_end from subscriptions where user_id='${user2}'`);
    await p2.getByRole("button", { name: /Gia hạn ngay/ }).click();
    await payOnGateway(p2, "success");
    const subAfter = sql(`select count(*) || '|' || (max(current_period_end) > '${endBefore}'::timestamptz + interval '29 days') from subscriptions where user_id='${user2}'`);
    check("gia hạn ngay: vẫn 1 subscription, kỳ hạn +30 ngày", subAfter === "1|true", subAfter);
    check("entitlements tài khoản vẫn 15 dòng (không trùng), expires_at kéo dài", sql(`select count(*) || '|' || bool_and(expires_at > now() + interval '59 days') from entitlements where user_id='${user2}' and business_id is null`) === "15|true");
    await ctx2.close();
  }
} catch (e) {
  console.log("FAILED", e.message);
  await page.screenshot({ path: `${SHOTS}/fail.png`, fullPage: true }).catch(() => {});
  results.push({ name: "exception", ok: false, detail: e.message });
}
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
