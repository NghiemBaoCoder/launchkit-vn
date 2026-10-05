import { describe, expect, it } from "vitest";
import { generateMockStage } from "@/lib/ai/mock/provider";
import { GENERATION_STAGES, type GenerationContext } from "@/lib/ai/types";
import { onboardingAnswersSchema } from "@/lib/onboarding/schema";

const answers = onboardingAnswersSchema.parse({
  businessTypeSlug: "freelancer", industrySlug: "website-development", businessName: "Minh Web Studio", location: "TP.HCM", experience: "some",
  targetCustomer: "Chủ spa nhỏ tại TP.HCM muốn có website nhận đặt lịch", customerSegment: "smb", products: ["Thiết kế website", "Landing page"],
  brandPersonality: ["professional", "friendly"], colorPalette: "indigo", salesChannels: ["facebook", "zalo"], revenueTarget: 30000000, primaryGoal: "first_customers",
});
const ctx = (seed = 1): GenerationContext => ({ businessId: "00000000-0000-0000-0000-000000000001", businessName: "Minh Web Studio", businessType: { slug: "freelancer", name: "Freelancer" }, industry: { slug: "website-development", name: "Phát triển website" }, answers, currency: "VND", seed, templates: {} });

describe("MockAIProvider", () => {
  it("sinh đủ 11 stage với dữ liệu đúng hình dạng", () => {
    for (const s of GENERATION_STAGES) expect(() => generateMockStage(s.key, ctx())).not.toThrow();
    expect(generateMockStage("brand", ctx()).assets.map((a) => a.key)).toEqual(expect.arrayContaining(["positioning", "tagline", "voice", "persona", "palette", "typography"]));
    expect(generateMockStage("services", ctx()).services.length).toBeGreaterThanOrEqual(3);
    expect(generateMockStage("pricing", ctx()).packages.map((p) => p.tier)).toEqual(["basic", "standard", "premium"]);
    expect(generateMockStage("content", ctx()).items).toHaveLength(30);
    expect(generateMockStage("marketing", ctx()).plan.map((p) => p.day_index)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(generateMockStage("website", ctx()).sections).toHaveLength(12);
    expect(generateMockStage("operations", ctx()).checklists).toHaveLength(6);
    expect(generateMockStage("documents", ctx()).documents.map((d) => d.type)).toEqual(["quotation", "proposal", "service_agreement", "client_brief", "invoice", "intake_form"]);
  });
  it("giá tăng dần theo gói và dùng tên sản phẩm người dùng nhập", () => {
    const { packages } = generateMockStage("pricing", ctx());
    expect(packages[0].price).toBeLessThan(packages[1].price);
    expect(packages[1].price).toBeLessThan(packages[2].price);
    const { services } = generateMockStage("services", ctx());
    expect(services[0].name).toBe("Thiết kế website");
  });
  it("ổn định theo seed và khác nhau giữa các seed", () => {
    const a = generateMockStage("sales", ctx(7));
    const b = generateMockStage("sales", ctx(7));
    const c = generateMockStage("sales", ctx(8));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
  });
  it("tài chính: số khách cần = mục tiêu / giá trung bình", () => {
    const fin = generateMockStage("finance", ctx());
    expect(fin.revenue_target.customers_needed).toBe(Math.ceil(30000000 / fin.revenue_target.avg_order_value));
  });
});
