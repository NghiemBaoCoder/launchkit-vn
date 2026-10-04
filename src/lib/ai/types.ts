import type { OnboardingAnswers } from "@/lib/onboarding/schema";

export const GENERATION_STAGES = [
  { key: "analyzing", label: "Phân tích business", description: "Đọc câu trả lời, xác định góc định vị" },
  { key: "brand", label: "Thương hiệu", description: "Định vị, tagline, giọng nói, chân dung khách hàng" },
  { key: "services", label: "Dịch vụ", description: "Đóng gói sản phẩm / dịch vụ" },
  { key: "pricing", label: "Bảng giá", description: "3 gói giá & khuyến nghị" },
  { key: "sales", label: "Bán hàng", description: "Kịch bản tư vấn, xử lý từ chối, chốt" },
  { key: "marketing", label: "Marketing", description: "Kênh, chiến lược launch, kế hoạch 30 ngày" },
  { key: "content", label: "Nội dung", description: "30 bài đa nền tảng" },
  { key: "website", label: "Website", description: "Landing page 12 section" },
  { key: "finance", label: "Tài chính", description: "Chi phí, doanh thu, hoà vốn" },
  { key: "operations", label: "Vận hành", description: "Checklist & quy trình" },
  { key: "documents", label: "Tài liệu", description: "Báo giá, hợp đồng, hoá đơn…" },
] as const;

export type StageKey = (typeof GENERATION_STAGES)[number]["key"];
export type StageStatus = "pending" | "processing" | "completed" | "failed";

export interface StageState {
  key: StageKey;
  status: StageStatus;
  started_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
}

export interface GenerationContext {
  businessId: string;
  businessName: string;
  businessType: { slug: string; name: string };
  industry: { slug: string; name: string };
  answers: OnboardingAnswers;
  currency: string;
  /** Seed để nội dung mock ổn định theo business nhưng khác nhau giữa các lần tạo lại. */
  seed: number;
  /** Cấu hình template (từ bảng templates) theo category, nếu có. */
  templates: Partial<Record<string, Record<string, unknown>>>;
}

/* ---------- Kết quả từng stage ---------- */

export interface AssetPayload {
  key: string;
  title: string;
  content: Record<string, unknown>;
  is_premium?: boolean;
}

export interface BrandOutput {
  assets: AssetPayload[];
}

export interface ServiceOutput {
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  unit: string;
  delivery_time: string;
  features: string[];
  benefits: string[];
  target_customer: string;
  upsell: string;
}

export interface PricingPackageOutput {
  tier: "basic" | "standard" | "premium";
  name: string;
  description: string;
  price: number;
  billing_unit: string;
  features: string[];
  recommended: boolean;
}

export interface PricingOutput {
  packages: PricingPackageOutput[];
  assets: AssetPayload[];
}

export interface MarketingPlanItemOutput {
  day_index: number;
  title: string;
  description: string;
  channel: string;
  kind: "task" | "campaign" | "promotion" | "content";
}

export interface MarketingOutput {
  assets: AssetPayload[];
  plan: MarketingPlanItemOutput[];
}

export interface ContentItemOutput {
  title: string;
  hook: string;
  caption: string;
  cta: string;
  platform: "facebook" | "tiktok" | "instagram" | "threads";
  content_type: string;
  day_offset: number;
}

export interface WebsiteSection {
  id: string;
  type: "hero" | "about" | "problem" | "solution" | "services" | "benefits" | "pricing" | "social_proof" | "faq" | "cta" | "contact" | "footer";
  enabled: boolean;
  data: Record<string, unknown>;
}

export interface WebsiteOutput {
  sections: WebsiteSection[];
  theme: { primary: string; secondary: string; accent: string; bg: string; font: string; radius: string };
  contact: { email: string; phone: string; address: string; facebook: string; zalo: string };
}

export interface FinanceOutput {
  startup_cost: { items: { name: string; amount: number; note?: string }[] };
  monthly_expenses: { items: { name: string; amount: number; category: string }[] };
  revenue_target: { monthly_target: number; avg_order_value: number; customers_needed: number; conversion_rate: number; leads_needed: number };
  profit: { revenue: number; cogs_rate: number; fixed_costs: number; tax_rate: number };
  break_even: { fixed_costs: number; price_per_unit: number; variable_cost_per_unit: number };
}

export interface ChecklistOutput {
  kind: "launch" | "daily" | "weekly" | "customer_workflow" | "sales_workflow" | "delivery_workflow";
  title: string;
  description: string;
  items: { title: string; description?: string }[];
}

export interface DocumentOutput {
  type: "quotation" | "proposal" | "service_agreement" | "client_brief" | "invoice" | "intake_form";
  title: string;
  content: Record<string, unknown>;
}

export interface StageOutputMap {
  analyzing: { assets: AssetPayload[] };
  brand: BrandOutput;
  services: { services: ServiceOutput[] };
  pricing: PricingOutput;
  sales: { assets: AssetPayload[] };
  marketing: MarketingOutput;
  content: { items: ContentItemOutput[] };
  website: WebsiteOutput;
  finance: FinanceOutput;
  operations: { checklists: ChecklistOutput[] };
  documents: { documents: DocumentOutput[] };
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generateStage<K extends StageKey>(stage: K, ctx: GenerationContext): Promise<StageOutputMap[K]>;
}
