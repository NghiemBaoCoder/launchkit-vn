import type { ChecklistOutput, DocumentOutput, FinanceOutput, GenerationContext } from "../types";
import { makeGen, priceFor, upperFirst } from "./helpers";

export function genFinance(ctx: GenerationContext): FinanceOutput {
  const g = makeGen(ctx, "finance");
  const { profile } = g;
  const target = ctx.answers.revenueTarget;
  const aov = priceFor(g.basePrice, 1.17);
  const customersNeeded = Math.max(1, Math.ceil(target / aov));
  const conversion = 0.2;
  const fixed = profile.monthlyExpenses.reduce((s, e) => s + e.amount, 0);
  return {
    startup_cost: { items: profile.startupCosts },
    monthly_expenses: { items: profile.monthlyExpenses },
    revenue_target: { monthly_target: target, avg_order_value: aov, customers_needed: customersNeeded, conversion_rate: conversion, leads_needed: Math.ceil(customersNeeded / conversion) },
    profit: { revenue: target, cogs_rate: profile.unit === "phần" || profile.unit === "sản phẩm" ? 0.45 : 0.15, fixed_costs: fixed, tax_rate: 0.015 },
    break_even: { fixed_costs: fixed, price_per_unit: aov, variable_cost_per_unit: Math.round(aov * (profile.unit === "phần" || profile.unit === "sản phẩm" ? 0.45 : 0.15)) },
  };
}

export function genOperations(ctx: GenerationContext): { checklists: ChecklistOutput[] } {
  const g = makeGen(ctx, "operations");
  const { profile } = g;
  const p = g.product.toLowerCase();
  return {
    checklists: [
      {
        kind: "launch",
        title: "Checklist ra mắt",
        description: "Những việc cần xong trước và trong 30 ngày đầu.",
        items: [
          { title: "Chốt tên, tagline và bảng màu thương hiệu" },
          { title: "Hoàn thiện bảng giá 3 gói & mô tả dịch vụ" },
          { title: "Tạo/tối ưu trang Facebook, Zalo OA (ảnh bìa, mô tả, nút nhắn tin)" },
          { title: "Chuẩn bị 10 nội dung đầu tiên" },
          { title: "Chuẩn bị mẫu báo giá, hợp đồng, hoá đơn" },
          { title: "Thiết lập cách nhận thanh toán (chuyển khoản, QR, Momo)" },
          { title: "Đăng ký hộ kinh doanh / mã số thuế (nếu cần)" },
          { title: "Nhắn 30 người quen tiềm năng" },
          { title: g.fill(profile.launchIdeas[0]) },
          { title: "Xin 5 feedback đầu tiên và đăng công khai" },
        ],
      },
      { kind: "daily", title: "Checklist hàng ngày", description: "Thói quen 30–60 phút mỗi ngày để business chạy đều.", items: profile.dailyTasks.map((t) => ({ title: g.fill(t) })) },
      { kind: "weekly", title: "Checklist hàng tuần", description: "Dành 2 giờ cuối tuần để nhìn lại và lên kế hoạch.", items: profile.weeklyTasks.map((t) => ({ title: g.fill(t) })) },
      {
        kind: "customer_workflow",
        title: "Quy trình khách hàng",
        description: `Từ lúc khách nhắn đến khi họ quay lại.`,
        items: [
          { title: "Tiếp nhận: trả lời trong 15 phút, hỏi 3 câu khám phá", description: "Tên, nhu cầu, thời hạn" },
          { title: "Tư vấn: gửi 2 ví dụ + đề xuất gói phù hợp" },
          { title: "Báo giá: gửi báo giá trong ngày kèm thời hạn hiệu lực 7 ngày" },
          { title: "Chốt: xác nhận đặt cọc & gửi hợp đồng/điều khoản" },
          { title: "Thực hiện: cập nhật tiến độ mỗi 2–3 ngày" },
          { title: "Bàn giao: checklist nghiệm thu + hướng dẫn" },
          { title: "Chăm sóc: nhắn hỏi thăm sau 7 ngày, xin đánh giá" },
          { title: "Tái mua/giới thiệu: gửi ưu đãi giới thiệu sau 30 ngày" },
        ],
      },
      {
        kind: "sales_workflow",
        title: "Quy trình bán hàng",
        description: "Pipeline 6 bước, mỗi bước có hành động và tiêu chí chuyển bước.",
        items: [
          { title: "Lead: có tên + kênh liên hệ", description: "Nguồn: inbox, form, giới thiệu" },
          { title: "Đủ điều kiện: có nhu cầu + ngân sách + thời hạn" },
          { title: "Tư vấn: đã trao đổi 15–30 phút" },
          { title: "Báo giá: đã gửi báo giá, đặt lịch follow-up ngày 2 & 5" },
          { title: "Thương lượng: xử lý từ chối, điều chỉnh phạm vi (không giảm giá quá 15%)" },
          { title: "Chốt: nhận cọc, tạo dự án, cập nhật doanh thu" },
          { title: "Thua: ghi lý do, nhắn lại sau 30 ngày với nội dung giá trị" },
        ],
      },
      {
        kind: "delivery_workflow",
        title: "Quy trình bàn giao",
        description: `Đảm bảo mỗi ${p} được giao đúng, đủ, đẹp.`,
        items: [
          { title: "Kick-off: xác nhận brief, mốc thời gian, người liên hệ" },
          { title: "Thực hiện giai đoạn 1 & gửi bản nháp" },
          { title: "Thu góp ý trong 48h, ghi lại thay đổi" },
          { title: "Hoàn thiện & tự kiểm tra theo checklist chất lượng" },
          { title: "Bàn giao: file/kết quả + hướng dẫn sử dụng + biên bản" },
          { title: "Thu phần còn lại & xuất hoá đơn" },
          { title: "Hỗ trợ sau bàn giao theo gói" },
        ],
      },
    ],
  };
}

export function genDocuments(ctx: GenerationContext): { documents: DocumentOutput[] } {
  const g = makeGen(ctx, "documents");
  const { profile } = g;
  const base = g.basePrice;
  const p = g.product;
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 7);
  const items = g.products.slice(0, 3).map((name, i) => ({ description: upperFirst(name), quantity: 1, unit: profile.unit, unit_price: priceFor(base, 1 + i * 0.3), total: priceFor(base, 1 + i * 0.3) }));
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const provider = { name: g.name, address: g.location, phone: "", email: "", tax_code: "", bank: "" };

  return {
    documents: [
      {
        type: "quotation",
        title: `Báo giá ${p}`,
        content: {
          number: `BG-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}-001`,
          date: today.toISOString().slice(0, 10),
          valid_until: validUntil.toISOString().slice(0, 10),
          provider,
          client: { name: "[Tên khách hàng]", company: "", address: "", phone: "", email: "" },
          intro: `Cảm ơn anh/chị đã quan tâm đến dịch vụ của ${g.name}. Dưới đây là báo giá chi tiết cho ${p.toLowerCase()}.`,
          items,
          subtotal,
          discount: 0,
          vat_rate: 0,
          total: subtotal,
          payment_terms: "Đặt cọc 50% khi xác nhận, 50% còn lại khi nghiệm thu.",
          delivery_time: profile.serviceArchetypes[1]?.deliveryTime ?? "7–14 ngày",
          notes: ["Báo giá có hiệu lực 7 ngày.", "Chưa bao gồm các hạng mục phát sinh ngoài phạm vi.", "Giá đã bao gồm 2 vòng chỉnh sửa."],
        },
      },
      {
        type: "proposal",
        title: `Đề xuất hợp tác — ${p}`,
        content: {
          date: today.toISOString().slice(0, 10),
          provider,
          client: { name: "[Tên khách hàng]" },
          sections: [
            { heading: "1. Bối cảnh & mục tiêu", body: `Khách hàng đang ${profile.painPoints[0]}. Mục tiêu của dự án là ${profile.outcomes[0]} trong vòng [thời gian].` },
            { heading: "2. Giải pháp đề xuất", body: `${g.name} đề xuất ${p.toLowerCase()} theo gói Tiêu chuẩn với phạm vi: ${g.products.join(", ")}. ${upperFirst(profile.differentiators[0])}.` },
            { heading: "3. Phạm vi công việc", body: profile.serviceArchetypes[1]?.features.map((f) => `• ${g.fill(f)}`).join("\n") ?? "" },
            { heading: "4. Lộ trình", body: "Tuần 1: Khảo sát & brief\nTuần 2–3: Thực hiện & bản nháp\nTuần 4: Chỉnh sửa & bàn giao" },
            { heading: "5. Chi phí", body: `Tổng chi phí: ${subtotal.toLocaleString("vi-VN")} ₫ (chi tiết theo báo giá đính kèm). Thanh toán 50/50.` },
            { heading: "6. Vì sao chọn chúng tôi", body: profile.proofPoints.map((x) => `• ${x}`).join("\n") },
            { heading: "7. Bước tiếp theo", body: "Xác nhận đề xuất → ký hợp đồng → đặt cọc → kick-off trong 3 ngày làm việc." },
          ],
        },
      },
      {
        type: "service_agreement",
        title: "Hợp đồng dịch vụ (mẫu)",
        content: {
          number: `HĐ-${today.getFullYear()}-001`,
          date: today.toISOString().slice(0, 10),
          party_a: { label: "Bên A (Khách hàng)", name: "[Tên khách hàng]", address: "", phone: "", representative: "" },
          party_b: { label: "Bên B (Bên cung cấp)", ...provider },
          clauses: [
            { heading: "Điều 1. Nội dung dịch vụ", body: `Bên B cung cấp dịch vụ ${p.toLowerCase()} cho Bên A theo phạm vi tại Phụ lục 1 (báo giá đính kèm).` },
            { heading: "Điều 2. Thời gian thực hiện", body: `Thời gian thực hiện: ${profile.serviceArchetypes[1]?.deliveryTime ?? "14 ngày"} kể từ ngày Bên A đặt cọc và cung cấp đủ thông tin.` },
            { heading: "Điều 3. Giá trị hợp đồng & thanh toán", body: `Tổng giá trị: ${subtotal.toLocaleString("vi-VN")} ₫. Đợt 1: 50% khi ký. Đợt 2: 50% khi nghiệm thu. Hình thức: chuyển khoản.` },
            { heading: "Điều 4. Quyền và nghĩa vụ Bên A", body: "Cung cấp thông tin, phản hồi trong 48 giờ; thanh toán đúng hạn; không sử dụng sản phẩm trước khi thanh toán đủ." },
            { heading: "Điều 5. Quyền và nghĩa vụ Bên B", body: `Thực hiện đúng phạm vi, chất lượng, thời hạn; bảo mật thông tin; ${profile.differentiators.find((d) => d.includes("bảo hành")) ?? "hỗ trợ sau bàn giao theo gói"}.` },
            { heading: "Điều 6. Chỉnh sửa & phát sinh", body: "Bao gồm 2 vòng chỉnh sửa trong phạm vi. Hạng mục ngoài phạm vi được báo giá riêng và chỉ thực hiện khi Bên A đồng ý bằng văn bản." },
            { heading: "Điều 7. Sở hữu trí tuệ", body: "Sau khi thanh toán đủ, Bên A sở hữu kết quả bàn giao. Bên B được quyền dùng làm portfolio trừ khi Bên A yêu cầu khác." },
            { heading: "Điều 8. Chấm dứt hợp đồng", body: "Bên nào đơn phương chấm dứt phải báo trước 7 ngày; chi phí phần việc đã thực hiện không hoàn lại." },
            { heading: "Điều 9. Điều khoản chung", body: "Hai bên cam kết thực hiện đúng hợp đồng. Tranh chấp giải quyết bằng thương lượng, nếu không được sẽ đưa ra toà án có thẩm quyền." },
          ],
          disclaimer: "Mẫu tham khảo, không thay thế tư vấn pháp lý.",
        },
      },
      {
        type: "client_brief",
        title: "Brief khách hàng",
        content: {
          intro: `Vui lòng điền thông tin để ${g.name} hiểu đúng nhu cầu trước khi bắt đầu ${p.toLowerCase()}.`,
          sections: [
            { heading: "Thông tin chung", fields: ["Tên / Doanh nghiệp", "Người liên hệ & số điện thoại", "Lĩnh vực hoạt động", "Website / mạng xã hội hiện có"] },
            { heading: "Mục tiêu", fields: ["Bạn muốn đạt được gì sau dự án?", "Kết quả cụ thể đo bằng gì?", "Thời hạn mong muốn"] },
            { heading: "Khách hàng của bạn", fields: ["Khách hàng mục tiêu là ai?", "Họ thường gặp vấn đề gì?", "Vì sao họ chọn bạn?"] },
            { heading: "Phong cách & tham khảo", fields: ["3 ví dụ bạn thích (link)", "3 điều bạn không muốn", "Màu sắc / giọng điệu mong muốn"] },
            { heading: "Phạm vi & ngân sách", fields: ["Hạng mục bắt buộc", "Hạng mục có thể bỏ", "Ngân sách dự kiến"] },
            { heading: "Tài liệu đính kèm", fields: ["Logo, hình ảnh, nội dung hiện có", "Tài khoản/quyền truy cập cần thiết"] },
          ],
        },
      },
      {
        type: "invoice",
        title: "Hoá đơn (mẫu)",
        content: {
          number: `HD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}-001`,
          date: today.toISOString().slice(0, 10),
          due_date: validUntil.toISOString().slice(0, 10),
          provider,
          client: { name: "[Tên khách hàng]", address: "", phone: "", email: "" },
          items,
          subtotal,
          discount: 0,
          vat_rate: 0,
          total: subtotal,
          paid: Math.round(subtotal / 2),
          balance_due: subtotal - Math.round(subtotal / 2),
          payment_info: { bank: "[Ngân hàng]", account_number: "[Số tài khoản]", account_name: g.name, note: "Nội dung CK: [Mã hoá đơn] [Tên khách]" },
          notes: ["Hoá đơn có giá trị thanh toán trong 7 ngày.", "Đây là chứng từ thanh toán nội bộ, không phải hoá đơn VAT."],
        },
      },
      {
        type: "intake_form",
        title: "Form tiếp nhận khách hàng",
        content: {
          intro: `Form nhanh 2 phút để ${g.name} tư vấn đúng gói cho bạn.`,
          fields: [
            { label: "Họ tên", type: "text", required: true },
            { label: "Số điện thoại / Zalo", type: "tel", required: true },
            { label: "Email", type: "email", required: false },
            { label: "Bạn quan tâm dịch vụ nào?", type: "select", options: g.products.map((x) => upperFirst(x)), required: true },
            { label: "Mô tả ngắn nhu cầu", type: "textarea", required: true },
            { label: "Ngân sách dự kiến", type: "select", options: ["Dưới " + priceFor(base, 0.65).toLocaleString("vi-VN") + " ₫", priceFor(base, 0.65).toLocaleString("vi-VN") + " – " + priceFor(base, 2).toLocaleString("vi-VN") + " ₫", "Trên " + priceFor(base, 2).toLocaleString("vi-VN") + " ₫", "Chưa rõ"], required: false },
            { label: "Thời hạn mong muốn", type: "select", options: ["Càng sớm càng tốt", "Trong 2 tuần", "Trong 1 tháng", "Chưa gấp"], required: false },
            { label: "Bạn biết đến chúng tôi qua đâu?", type: "select", options: ["Facebook", "TikTok", "Google", "Bạn bè giới thiệu", "Khác"], required: false },
          ],
          thank_you: `Cảm ơn bạn! ${g.name} sẽ phản hồi trong 24 giờ làm việc.`,
        },
      },
    ],
  };
}
