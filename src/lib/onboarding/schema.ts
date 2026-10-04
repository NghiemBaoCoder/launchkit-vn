import { z } from "zod";

export const BRAND_PERSONALITIES = [
  { key: "professional", label: "Chuyên nghiệp", hint: "Chỉn chu, đáng tin, nói có số liệu" },
  { key: "friendly", label: "Thân thiện", hint: "Gần gũi, dễ tiếp cận, như một người bạn" },
  { key: "premium", label: "Sang trọng", hint: "Tinh tế, cao cấp, ít nhưng chất" },
  { key: "young", label: "Trẻ trung", hint: "Năng động, bắt trend, vui vẻ" },
  { key: "minimal", label: "Tối giản", hint: "Rõ ràng, gọn gàng, đi thẳng vào vấn đề" },
  { key: "creative", label: "Sáng tạo", hint: "Khác biệt, táo bạo, nhiều ý tưởng" },
  { key: "trustworthy", label: "Tin cậy", hint: "Ổn định, cam kết, nói là làm" },
  { key: "caring", label: "Tận tâm", hint: "Chăm sóc chu đáo, lắng nghe" },
] as const;

export const COLOR_PALETTES = [
  { key: "indigo", label: "Indigo hiện đại", primary: "#4F46E5", secondary: "#0EA5E9", accent: "#F59E0B", bg: "#F8FAFC" },
  { key: "emerald", label: "Xanh lá tươi mới", primary: "#059669", secondary: "#14B8A6", accent: "#F97316", bg: "#F0FDF4" },
  { key: "rose", label: "Hồng ấm áp", primary: "#E11D48", secondary: "#F472B6", accent: "#FBBF24", bg: "#FFF1F2" },
  { key: "amber", label: "Vàng năng lượng", primary: "#D97706", secondary: "#F59E0B", accent: "#1D4ED8", bg: "#FFFBEB" },
  { key: "slate", label: "Xám sang trọng", primary: "#1E293B", secondary: "#475569", accent: "#C8A24A", bg: "#F8FAFC" },
  { key: "ocean", label: "Xanh biển tin cậy", primary: "#0369A1", secondary: "#0891B2", accent: "#F43F5E", bg: "#F0F9FF" },
  { key: "violet", label: "Tím sáng tạo", primary: "#7C3AED", secondary: "#A855F7", accent: "#22C55E", bg: "#FAF5FF" },
  { key: "coffee", label: "Nâu mộc mạc", primary: "#78350F", secondary: "#B45309", accent: "#16A34A", bg: "#FEFCE8" },
] as const;

export const SALES_CHANNELS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "zalo", label: "Zalo" },
  { key: "shopee", label: "Shopee / Sàn TMĐT" },
  { key: "website", label: "Website riêng" },
  { key: "google", label: "Google / SEO" },
  { key: "offline", label: "Cửa hàng / Trực tiếp" },
  { key: "referral", label: "Giới thiệu / Truyền miệng" },
] as const;

export const CUSTOMER_SEGMENTS = [
  { key: "individual", label: "Khách cá nhân" },
  { key: "smb", label: "Doanh nghiệp nhỏ / Chủ shop" },
  { key: "both", label: "Cả hai" },
] as const;

export const REVENUE_TARGETS = [
  { value: 10000000, label: "10 triệu / tháng" },
  { value: 20000000, label: "20 triệu / tháng" },
  { value: 30000000, label: "30 triệu / tháng" },
  { value: 50000000, label: "50 triệu / tháng" },
  { value: 100000000, label: "100 triệu / tháng" },
  { value: 200000000, label: "200 triệu+ / tháng" },
] as const;

export const PRIMARY_GOALS = [
  { key: "first_customers", label: "Có những khách hàng đầu tiên", hint: "Mới bắt đầu, cần chứng minh năng lực" },
  { key: "more_leads", label: "Có thêm khách đều đặn", hint: "Đã có khách nhưng chưa ổn định" },
  { key: "raise_prices", label: "Tăng giá & tăng lợi nhuận", hint: "Đang làm nhiều nhưng lời ít" },
  { key: "systemize", label: "Hệ thống hoá để bớt việc tay chân", hint: "Muốn quy trình rõ ràng" },
  { key: "launch_new", label: "Ra mắt sản phẩm / dịch vụ mới", hint: "Cần kế hoạch launch" },
  { key: "grow_brand", label: "Xây thương hiệu lâu dài", hint: "Muốn được nhớ đến" },
] as const;

export const EXPERIENCE_LEVELS = [
  { key: "new", label: "Mới bắt đầu (0–6 tháng)" },
  { key: "some", label: "Đã có kinh nghiệm (6 tháng – 2 năm)" },
  { key: "experienced", label: "Nhiều kinh nghiệm (2 năm+)" },
] as const;

export const onboardingAnswersSchema = z.object({
  businessTypeSlug: z.string().min(1, "Chọn loại hình kinh doanh"),
  industrySlug: z.string().min(1, "Chọn ngành"),
  industryCustom: z.string().max(80).optional().default(""),
  businessName: z.string().trim().min(2, "Tên business tối thiểu 2 ký tự").max(80, "Tối đa 80 ký tự"),
  ownerName: z.string().trim().max(80).optional().default(""),
  location: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  experience: z.enum(["new", "some", "experienced"]).default("new"),
  targetCustomer: z.string().trim().min(5, "Mô tả khách hàng mục tiêu (ít nhất 5 ký tự)").max(500),
  customerSegment: z.enum(["individual", "smb", "both"]).default("individual"),
  customerPainPoints: z.string().trim().max(500).optional().default(""),
  products: z.array(z.string().trim().min(1).max(80)).min(1, "Thêm ít nhất 1 sản phẩm / dịch vụ").max(8),
  brandPersonality: z.array(z.string()).min(1, "Chọn ít nhất 1 tính cách").max(4, "Tối đa 4 tính cách"),
  colorPalette: z.string().min(1, "Chọn một bảng màu"),
  salesChannels: z.array(z.string()).min(1, "Chọn ít nhất 1 kênh bán hàng"),
  revenueTarget: z.number().int().min(1000000, "Mục tiêu doanh thu tối thiểu 1 triệu"),
  primaryGoal: z.string().min(1, "Chọn mục tiêu chính"),
});

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;
export type OnboardingDraft = Partial<OnboardingAnswers> & { step?: number; updatedAt?: string };

export const ONBOARDING_STEPS = [
  { key: "welcome", label: "Bắt đầu" },
  { key: "business_type", label: "Loại hình" },
  { key: "industry", label: "Ngành" },
  { key: "info", label: "Thông tin" },
  { key: "customer", label: "Khách hàng" },
  { key: "products", label: "Sản phẩm" },
  { key: "personality", label: "Tính cách" },
  { key: "color", label: "Màu sắc" },
  { key: "channels", label: "Kênh bán" },
  { key: "revenue", label: "Doanh thu" },
  { key: "goal", label: "Mục tiêu" },
  { key: "review", label: "Xem lại" },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];

/** Các trường cần hợp lệ ở từng bước (dùng để validate từng bước). */
export const STEP_FIELDS: Record<OnboardingStepKey, (keyof OnboardingAnswers)[]> = {
  welcome: [],
  business_type: ["businessTypeSlug"],
  industry: ["industrySlug"],
  info: ["businessName"],
  customer: ["targetCustomer"],
  products: ["products"],
  personality: ["brandPersonality"],
  color: ["colorPalette"],
  channels: ["salesChannels"],
  revenue: ["revenueTarget"],
  goal: ["primaryGoal"],
  review: [],
};

export const DEFAULT_DRAFT: OnboardingDraft = {
  step: 0,
  products: [],
  brandPersonality: [],
  salesChannels: [],
  experience: "new",
  customerSegment: "individual",
};

export function paletteByKey(key: string | undefined) {
  return COLOR_PALETTES.find((p) => p.key === key) ?? COLOR_PALETTES[0];
}
