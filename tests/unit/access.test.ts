import { describe, expect, it } from "vitest";
import { can, derivePlan, hasEntitlement, recommendedProductFor, GUEST_CONTEXT, type AccessContext } from "@/lib/access/policy";

const ctx = (over: Partial<AccessContext>): AccessContext => ({ ...GUEST_CONTEXT, userId: "u1", role: "user", ...over });

describe("access policy", () => {
  it("khách và user miễn phí không có quyền premium", () => {
    expect(can(GUEST_CONTEXT, "sales.full")).toBe(false);
    expect(can(ctx({}), "website.kit")).toBe(false);
    expect(can(ctx({}), "exports.basic")).toBe(false);
  });
  it("Business Kit mở các mục full nhưng không mở website kit", () => {
    const c = ctx({ businessEntitlements: ["brand_full", "sales_full", "exports_basic"], businessId: "b1" });
    expect(can(c, "sales.full")).toBe(true);
    expect(can(c, "exports.basic")).toBe(true);
    expect(can(c, "website.kit")).toBe(false);
    expect(can(c, "exports.premium")).toBe(false);
  });
  it("entitlement cấp tài khoản áp dụng cho mọi business", () => {
    const c = ctx({ accountEntitlements: ["multiple_businesses", "website_kit"] });
    expect(can(c, "business.multiple")).toBe(true);
    expect(can(c, "website.kit")).toBe(true);
    expect(hasEntitlement(c, "regeneration")).toBe(false);
  });
  it("admin có mọi quyền", () => {
    expect(can(ctx({ role: "admin", isAdmin: true }), "website.kit")).toBe(true);
  });
  it("derivePlan đúng thứ tự ưu tiên", () => {
    expect(derivePlan([], [], false)).toBe("free");
    expect(derivePlan([], ["brand_full"], false)).toBe("business_kit");
    expect(derivePlan([], ["brand_full", "website_kit"], false)).toBe("business_kit_pro");
    expect(derivePlan(["multiple_businesses"], [], false)).toBe("pro_member");
  });
  it("gợi ý sản phẩm phù hợp để mở khoá", () => {
    expect(recommendedProductFor("sales.full")).toBe("business-kit");
    expect(recommendedProductFor("website.kit")).toBe("business-kit-pro");
    expect(recommendedProductFor("business.multiple")).toBe("pro-membership");
  });
});
