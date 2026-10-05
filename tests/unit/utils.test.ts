import { describe, expect, it } from "vitest";
import { formatVND, slugify, initials, truncate } from "@/lib/utils";
import { onboardingAnswersSchema } from "@/lib/onboarding/schema";
import { safeNext } from "@/lib/auth-utils";

describe("utils", () => {
  it("slugify bỏ dấu tiếng Việt", () => {
    expect(slugify("Minh Web Studio — Thiết kế & Đào tạo")).toBe("minh-web-studio-thiet-ke-dao-tao");
    expect(slugify("Đặc sản Đà Nẵng")).toBe("dac-san-da-nang");
  });
  it("formatVND", () => {
    expect(formatVND(299000)).toMatch(/299\.000/);
    expect(formatVND(null)).toBe("—");
  });
  it("initials & truncate", () => {
    expect(initials("Nguyễn Văn A")).toBe("NA");
    expect(truncate("a".repeat(200), 10)).toHaveLength(10);
  });
  it("safeNext chặn redirect ngoài", () => {
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("/business/1/overview")).toBe("/business/1/overview");
  });
  it("onboarding schema bắt buộc các trường chính", () => {
    const r = onboardingAnswersSchema.safeParse({ businessTypeSlug: "freelancer", industrySlug: "x", businessName: "A", targetCustomer: "ngắn", products: [], brandPersonality: [], colorPalette: "", salesChannels: [], revenueTarget: 10, primaryGoal: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.length).toBeGreaterThanOrEqual(5);
  });
});
