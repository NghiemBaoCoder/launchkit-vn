import type { GenerationContext, WebsiteOutput, WebsiteSection } from "../types";
import { FONT_PAIRS } from "./library";
import { makeGen, priceFor, upperFirst } from "./helpers";

export function genWebsite(ctx: GenerationContext): WebsiteOutput {
  const g = makeGen(ctx, "website");
  const { profile } = g;
  const p = g.product.toLowerCase();
  const customer = g.fill("{customer}");
  const fonts = FONT_PAIRS[g.personality] ?? FONT_PAIRS.professional;
  const base = g.basePrice;

  const sections: WebsiteSection[] = [
    { id: "hero", type: "hero", enabled: true, data: { eyebrow: g.ctx.industry.name, title: `${upperFirst(profile.outcomes[0])} với ${p}`, subtitle: `${g.name} giúp ${customer} ${profile.outcomes[1] ?? profile.outcomes[0]}. ${upperFirst(profile.differentiators[0])}.`, cta_label: "Nhận tư vấn miễn phí", cta_href: "#contact", secondary_label: "Xem bảng giá", secondary_href: "#pricing", badge: profile.proofPoints[0] } },
    { id: "about", type: "about", enabled: true, data: { title: `Về ${g.name}`, body: `${g.name} là ${profile.noun} ${g.ctx.industry.name.toLowerCase()} tại ${g.location}. Chúng tôi làm việc với ${customer} và tin rằng ${profile.outcomes[0]} không phải điều xa xỉ.`, stats: profile.proofPoints.slice(0, 3).map((s) => ({ label: s })) } },
    { id: "problem", type: "problem", enabled: true, data: { title: "Bạn có đang gặp những điều này?", items: profile.painPoints.slice(0, 4).map((x) => upperFirst(x)) } },
    { id: "solution", type: "solution", enabled: true, data: { title: `Cách ${g.name} giải quyết`, items: profile.differentiators.slice(0, 4).map((d, i) => ({ title: upperFirst(d), description: profile.outcomes[i % profile.outcomes.length] })) } },
    { id: "services", type: "services", enabled: true, data: { title: "Dịch vụ", subtitle: `Những gì ${g.name} làm cho bạn`, items: g.products.slice(0, 4).map((name, i) => ({ name: upperFirst(name), description: g.fill(profile.serviceArchetypes[1]?.description ?? "", { product: name.toLowerCase() }), price_from: priceFor(base, 0.65 + i * 0.1) })) } },
    { id: "benefits", type: "benefits", enabled: true, data: { title: "Bạn nhận được gì", items: [...profile.outcomes.slice(0, 3), ...profile.differentiators.slice(0, 1)].map((x) => upperFirst(x)) } },
    { id: "pricing", type: "pricing", enabled: true, data: { title: "Bảng giá", subtitle: "Chọn gói phù hợp, nâng cấp bất cứ lúc nào", tiers: [{ name: "Cơ bản", price: priceFor(base, 0.65), unit: profile.unit, features: ["Phiên bản tiêu chuẩn", "1 vòng chỉnh sửa", "Hỗ trợ 7 ngày"], highlight: false }, { name: "Tiêu chuẩn", price: priceFor(base, 1.17), unit: profile.unit, features: ["Đầy đủ hạng mục", "3 vòng chỉnh sửa", "Hỗ trợ 30 ngày", upperFirst(profile.differentiators[0])], highlight: true }, { name: "Cao cấp", price: priceFor(base, 2.08), unit: profile.unit, features: ["Mọi thứ trong Tiêu chuẩn", "Hạng mục mở rộng", "Hỗ trợ ưu tiên 90 ngày"], highlight: false }] } },
    { id: "social_proof", type: "social_proof", enabled: true, data: { title: "Khách hàng nói gì", items: [{ name: "Chị Hạnh", role: upperFirst(customer), quote: `${upperFirst(profile.outcomes[0])}. Làm việc rõ ràng, đúng hẹn.` }, { name: "Anh Tuấn", role: "Chủ shop", quote: `Trước đây mình ${profile.painPoints[0]}, giờ thì yên tâm giao cho ${g.name}.` }, { name: "Bạn Linh", role: "Khách hàng", quote: `${upperFirst(profile.differentiators[0])} — điều mình cần nhất.` }] } },
    { id: "faq", type: "faq", enabled: true, data: { title: "Câu hỏi thường gặp", items: profile.faq.map((f) => ({ q: g.fill(f.q), a: g.fill(f.a) })) } },
    { id: "cta", type: "cta", enabled: true, data: { title: `Sẵn sàng ${profile.outcomes[0]}?`, subtitle: "Tư vấn miễn phí 15 phút. Báo giá trong ngày.", cta_label: "Nhắn ngay", cta_href: "#contact" } },
    { id: "contact", type: "contact", enabled: true, data: { title: "Liên hệ", subtitle: `Nhắn ${g.name} qua kênh bạn tiện nhất.`, show_form: true } },
    { id: "footer", type: "footer", enabled: true, data: { text: `© ${new Date().getFullYear()} ${g.name}. ${g.ctx.industry.name} tại ${g.location}.`, links: [{ label: "Dịch vụ", href: "#services" }, { label: "Bảng giá", href: "#pricing" }, { label: "Liên hệ", href: "#contact" }] } },
  ];

  return {
    sections,
    theme: { primary: g.palette.primary, secondary: g.palette.secondary, accent: g.palette.accent, bg: g.palette.bg, font: fonts.heading, radius: g.personality === "premium" ? "0.25rem" : g.personality === "young" || g.personality === "friendly" ? "1rem" : "0.75rem" },
    contact: { email: "", phone: "", address: g.location, facebook: "", zalo: "" },
  };
}
