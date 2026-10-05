/** Nhãn tiếng Việt cho các khoá trong nội dung jsonb của asset. */
export const FIELD_LABELS: Record<string, string> = {
  statement: "Tuyên bố định vị", for_whom: "Dành cho", what: "Cung cấp", unlike: "Khác với", because: "Bởi vì", category: "Ngành",
  headline: "Tiêu đề", subheadline: "Mô tả", pillars: "Trụ cột giá trị", title: "Tiêu đề", description: "Mô tả",
  options: "Các phương án", selected: "Đã chọn", short: "Ngắn", long: "Đầy đủ", elevator: "Giới thiệu 30 giây",
  tone: "Giọng điệu", do: "Nên", dont: "Không nên", words: "Từ khoá thương hiệu", sample_sentences: "Câu mẫu",
  name: "Tên", age_range: "Độ tuổi", occupation: "Nghề nghiệp", goals: "Mục tiêu", pains: "Nỗi đau", channels: "Kênh", quote: "Câu nói tiêu biểu", buying_triggers: "Lý do mua",
  messages: "Thông điệp", message: "Thông điệp", proof: "Bằng chứng",
  key: "Mã", label: "Tên", primary: "Màu chính", secondary: "Màu phụ", accent: "Màu nhấn", bg: "Nền", text: "Chữ", muted: "Chữ phụ", usage: "Cách dùng",
  heading: "Font tiêu đề", body: "Font nội dung", scale: "Thang cỡ chữ", notes: "Ghi chú",
  summary: "Tóm tắt", strengths: "Điểm mạnh", opportunities: "Cơ hội", risks: "Rủi ro", positioning_angle: "Góc định vị", recommended_focus: "Nên tập trung", units_needed_per_month: "Số đơn/tháng cần có", avg_price: "Giá trung bình",
  duration: "Thời lượng", variants: "Biến thể", channel_notes: "Ghi chú theo kênh", zalo: "Zalo", facebook: "Facebook", email: "Email",
  steps: "Các bước", phase: "Giai đoạn", script: "Lời thoại", tips: "Mẹo", questions: "Câu hỏi", question: "Câu hỏi", why: "Vì sao hỏi",
  items: "Danh sách", objection: "Từ chối", response: "Cách trả lời", sequence: "Chuỗi", day: "Ngày", channel: "Kênh", rules: "Nguyên tắc", situation: "Tình huống",
  strategy: "Chiến lược", anchor: "Giá neo", target_margin: "Biên lợi nhuận mục tiêu", units_needed: "Số đơn cần", revenue_target: "Mục tiêu doanh thu", psychology: "Tâm lý giá",
  cost_items: "Khoản chi phí", amount: "Số tiền", hours_per_unit: "Giờ/đơn vị", hourly_rate_target: "Giá theo giờ mục tiêu",
  kpis: "KPI", target: "Mục tiêu", budget_monthly: "Ngân sách/tháng", budget_split: "Phân bổ ngân sách", pct: "%", segments: "Phân khúc", where: "Ở đâu", size: "Tỷ trọng",
  role: "Vai trò", tactics: "Chiến thuật", budget_pct: "% ngân sách", priority: "Ưu tiên", phases: "Giai đoạn", actions: "Hành động",
  goal: "Mục tiêu", mechanics: "Cách thực hiện", offer: "Ưu đãi", condition: "Điều kiện", when: "Thời điểm", format: "Định dạng", hook: "Câu mồi", delivery: "Cách gửi",
  intro: "Mở đầu", number: "Số", date: "Ngày", valid_until: "Hiệu lực đến", due_date: "Hạn thanh toán", provider: "Bên cung cấp", client: "Khách hàng", company: "Công ty", address: "Địa chỉ", phone: "Điện thoại", tax_code: "Mã số thuế", bank: "Ngân hàng",
  quantity: "Số lượng", unit: "Đơn vị", unit_price: "Đơn giá", total: "Thành tiền", subtotal: "Tạm tính", discount: "Giảm giá", vat_rate: "VAT (%)", payment_terms: "Điều khoản thanh toán", delivery_time: "Thời gian thực hiện",
  sections: "Các phần", clauses: "Điều khoản", party_a: "Bên A", party_b: "Bên B", representative: "Người đại diện", disclaimer: "Lưu ý", fields: "Trường", thank_you: "Lời cảm ơn", paid: "Đã thanh toán", balance_due: "Còn lại", payment_info: "Thông tin thanh toán", account_number: "Số tài khoản", account_name: "Chủ tài khoản", note: "Ghi chú",
  required: "Bắt buộc", type: "Loại",
};

export const HIDDEN_KEYS = new Set(["__score"]);

export function labelFor(key: string): string {
  if (FIELD_LABELS[key] !== undefined) return FIELD_LABELS[key];
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** Chuyển nội dung jsonb thành văn bản thuần để sao chép / xuất TXT. */
export function contentToText(value: unknown, depth = 0): string {
  const pad = "  ".repeat(depth);
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v, i) => {
        if (typeof v === "object" && v !== null) return `${pad}${i + 1}.\n${contentToText(v, depth + 1)}`;
        return `${pad}• ${contentToText(v, depth)}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([k]) => !HIDDEN_KEYS.has(k))
      .map(([k, v]) => {
        const label = labelFor(k);
        if (typeof v === "object" && v !== null) return `${pad}${label}:\n${contentToText(v, depth + 1)}`;
        return `${pad}${label}: ${contentToText(v, depth)}`;
      })
      .join("\n");
  }
  return String(value);
}

/** Chuyển nội dung jsonb thành Markdown. */
export function contentToMarkdown(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v, i) => {
        if (typeof v === "object" && v !== null) return `${i + 1}. ${contentToMarkdown(v, depth + 1).replace(/\n/g, "\n   ")}`;
        return `- ${contentToMarkdown(v, depth)}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([k]) => !HIDDEN_KEYS.has(k))
      .map(([k, v]) => {
        const label = labelFor(k);
        if (typeof v === "object" && v !== null) return `${"#".repeat(Math.min(6, depth + 3))} ${label}\n\n${contentToMarkdown(v, depth + 1)}`;
        return `**${label}:** ${contentToMarkdown(v, depth)}`;
      })
      .join("\n\n");
  }
  return String(value);
}
