/**
 * Logic tính giá thuần (không import server-only) — dùng được ở client lẫn server, dễ unit test.
 */

export interface CouponLike {
  type: "fixed" | "percentage";
  value: number;
  max_discount: number | null;
  min_order: number;
}

export interface CouponRules extends CouponLike {
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  applicable_product_ids: string[];
}

export interface CouponContext {
  subtotal: number;
  productId: string;
  now: Date;
  /** Số lần user hiện tại đã dùng mã này. */
  userRedemptions: number;
}

export type CouponValidation = { ok: true; discount: number } | { ok: false; reason: string };

/** Số tiền giảm (đã làm tròn, không âm, không vượt subtotal). */
export function computeDiscount(coupon: CouponLike, subtotal: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;
  if (subtotal < Number(coupon.min_order ?? 0)) return 0;
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Math.round((subtotal * Number(coupon.value)) / 100);
    if (coupon.max_discount !== null && coupon.max_discount !== undefined) discount = Math.min(discount, Number(coupon.max_discount));
  } else {
    discount = Math.min(Number(coupon.value), subtotal);
  }
  return Math.max(0, Math.min(Math.round(discount), subtotal));
}

/** Kiểm tra mã giảm giá theo mọi điều kiện; trả về lý do tiếng Việt khi không hợp lệ. */
export function validateCoupon(coupon: CouponRules, ctx: CouponContext): CouponValidation {
  if (!coupon.active) return { ok: false, reason: "Mã giảm giá không còn hiệu lực." };
  const now = ctx.now.getTime();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return { ok: false, reason: "Mã giảm giá chưa đến thời gian áp dụng." };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) return { ok: false, reason: "Mã giảm giá đã hết hạn." };
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.used_count >= coupon.usage_limit) return { ok: false, reason: "Mã giảm giá đã hết lượt sử dụng." };
  if (coupon.per_user_limit > 0 && ctx.userRedemptions >= coupon.per_user_limit) return { ok: false, reason: "Bạn đã dùng hết số lần cho phép của mã này." };
  if (coupon.applicable_product_ids.length > 0 && !coupon.applicable_product_ids.includes(ctx.productId)) return { ok: false, reason: "Mã giảm giá không áp dụng cho sản phẩm này." };
  if (ctx.subtotal < Number(coupon.min_order ?? 0)) return { ok: false, reason: `Đơn hàng cần tối thiểu ${formatVNDPlain(Number(coupon.min_order))} để dùng mã này.` };
  const discount = computeDiscount(coupon, ctx.subtotal);
  if (discount <= 0) return { ok: false, reason: "Mã giảm giá không tạo ra khoản giảm nào cho đơn này." };
  return { ok: true, discount };
}

/** Giá thực tế của sản phẩm (ưu tiên sale_price nếu có và nhỏ hơn giá gốc). */
export function effectivePrice(product: { price: number; sale_price: number | null }): number {
  const price = Number(product.price ?? 0);
  const sale = product.sale_price === null || product.sale_price === undefined ? null : Number(product.sale_price);
  if (sale !== null && Number.isFinite(sale) && sale >= 0 && sale < price) return sale;
  return Math.max(0, price);
}

/** Tổng tiền sau giảm (không âm). */
export function computeTotal(subtotal: number, discount: number): number {
  return Math.max(0, Math.round(subtotal) - Math.round(discount));
}

function formatVNDPlain(n: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(n)}đ`;
}
