import { describe, expect, it } from "vitest";
import { computeDiscount, computeTotal, effectivePrice, validateCoupon, type CouponRules } from "@/lib/payments/pricing";

const base: CouponRules = { type: "percentage", value: 50, max_discount: 300000, min_order: 0, active: true, starts_at: null, expires_at: null, usage_limit: 1000, used_count: 0, per_user_limit: 1, applicable_product_ids: [] };
const ctx = { subtotal: 299000, productId: "p1", now: new Date("2026-10-04T00:00:00Z"), userRedemptions: 0 };

describe("computeDiscount", () => {
  it("giảm theo % và giới hạn max_discount", () => {
    expect(computeDiscount(base, 299000)).toBe(149500);
    expect(computeDiscount({ ...base, max_discount: 100000 }, 299000)).toBe(100000);
  });
  it("giảm cố định không vượt subtotal", () => {
    expect(computeDiscount({ type: "fixed", value: 100000, max_discount: null, min_order: 0 }, 299000)).toBe(100000);
    expect(computeDiscount({ type: "fixed", value: 500000, max_discount: null, min_order: 0 }, 299000)).toBe(299000);
  });
  it("trả 0 khi dưới min_order hoặc subtotal không hợp lệ", () => {
    expect(computeDiscount({ ...base, min_order: 500000 }, 299000)).toBe(0);
    expect(computeDiscount(base, 0)).toBe(0);
  });
});

describe("validateCoupon", () => {
  it("hợp lệ với mã demo", () => {
    expect(validateCoupon(base, ctx)).toEqual({ ok: true, discount: 149500 });
  });
  it("từ chối khi không active / hết hạn / chưa bắt đầu", () => {
    expect(validateCoupon({ ...base, active: false }, ctx).ok).toBe(false);
    expect(validateCoupon({ ...base, expires_at: "2026-01-01T00:00:00Z" }, ctx).ok).toBe(false);
    expect(validateCoupon({ ...base, starts_at: "2027-01-01T00:00:00Z" }, ctx).ok).toBe(false);
  });
  it("từ chối khi hết lượt, vượt giới hạn/user, sai sản phẩm, dưới min_order", () => {
    expect(validateCoupon({ ...base, usage_limit: 10, used_count: 10 }, ctx).ok).toBe(false);
    expect(validateCoupon(base, { ...ctx, userRedemptions: 1 }).ok).toBe(false);
    expect(validateCoupon({ ...base, applicable_product_ids: ["other"] }, ctx).ok).toBe(false);
    expect(validateCoupon({ ...base, min_order: 500000 }, ctx).ok).toBe(false);
  });
  it("mã 100% cho tổng 0đ", () => {
    const r = validateCoupon({ ...base, value: 100, max_discount: null }, ctx);
    expect(r).toEqual({ ok: true, discount: 299000 });
    expect(computeTotal(299000, 299000)).toBe(0);
  });
});

describe("effectivePrice", () => {
  it("ưu tiên sale_price khi nhỏ hơn giá gốc", () => {
    expect(effectivePrice({ price: 499000, sale_price: 299000 })).toBe(299000);
    expect(effectivePrice({ price: 499000, sale_price: null })).toBe(499000);
    expect(effectivePrice({ price: 499000, sale_price: 600000 })).toBe(499000);
  });
});
