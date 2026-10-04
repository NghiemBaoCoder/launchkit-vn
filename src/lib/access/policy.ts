/**
 * Ma trận phân quyền tập trung.
 * - Entitlement: quyền được cấp bởi mua hàng / gói / admin (lưu trong DB).
 * - Feature: tính năng mà UI/server hỏi "có được dùng không".
 * Không rải rác kiểm tra plan ở khắp nơi — mọi nơi đều gọi `can(ctx, feature)`.
 */

export const ENTITLEMENT_KEYS = [
  "brand_full",
  "services_full",
  "pricing_full",
  "sales_full",
  "marketing_full",
  "content_30",
  "website_kit",
  "operations_full",
  "documents_full",
  "exports_basic",
  "premium_exports",
  "regeneration",
  "multiple_businesses",
  "premium_templates",
  "advanced_generators",
] as const;

export type EntitlementKey = (typeof ENTITLEMENT_KEYS)[number];

export const ENTITLEMENT_LABELS: Record<EntitlementKey, string> = {
  brand_full: "Thương hiệu đầy đủ",
  services_full: "Dịch vụ đầy đủ",
  pricing_full: "Bảng giá & máy tính đầy đủ",
  sales_full: "Kịch bản bán hàng đầy đủ",
  marketing_full: "Kế hoạch marketing đầy đủ",
  content_30: "30 nội dung đa nền tảng",
  website_kit: "Website Kit",
  operations_full: "Vận hành & quy trình đầy đủ",
  documents_full: "Bộ tài liệu đầy đủ",
  exports_basic: "Xuất PDF/CSV/Markdown",
  premium_exports: "Xuất bản cao cấp (ZIP trọn bộ)",
  regeneration: "Tạo lại nội dung không tốn credits",
  multiple_businesses: "Nhiều business",
  premium_templates: "Template cao cấp",
  advanced_generators: "Generator nâng cao",
};

export type Feature =
  | "brand.full"
  | "services.full"
  | "pricing.full"
  | "pricing.calculators"
  | "sales.full"
  | "marketing.full"
  | "content.full"
  | "website.kit"
  | "finance.advanced"
  | "operations.full"
  | "documents.full"
  | "exports.basic"
  | "exports.premium"
  | "generation.regenerate_free"
  | "business.multiple"
  | "templates.premium"
  | "generators.advanced";

/** Feature cần ÍT NHẤT MỘT trong các entitlement này. */
export const FEATURE_REQUIREMENTS: Record<Feature, EntitlementKey[]> = {
  "brand.full": ["brand_full"],
  "services.full": ["services_full"],
  "pricing.full": ["pricing_full"],
  "pricing.calculators": ["pricing_full"],
  "sales.full": ["sales_full"],
  "marketing.full": ["marketing_full"],
  "content.full": ["content_30"],
  "website.kit": ["website_kit"],
  "finance.advanced": ["pricing_full", "advanced_generators"],
  "operations.full": ["operations_full"],
  "documents.full": ["documents_full"],
  "exports.basic": ["exports_basic"],
  "exports.premium": ["premium_exports"],
  "generation.regenerate_free": ["regeneration"],
  "business.multiple": ["multiple_businesses"],
  "templates.premium": ["premium_templates"],
  "generators.advanced": ["advanced_generators"],
};

export type PlanKey = "free" | "business_kit" | "business_kit_pro" | "pro_member";

export const PLAN_LABELS: Record<PlanKey, string> = {
  free: "Miễn phí",
  business_kit: "Business Kit",
  business_kit_pro: "Business Kit Pro",
  pro_member: "Pro Membership",
};

/** Giới hạn cho user miễn phí (phần xem trước). */
export const FREE_PREVIEW = {
  maxBusinesses: 1,
  contentItemsVisible: 5,
  marketingDaysVisible: 7,
  objectionsVisible: 2,
  documentsVisible: ["quotation"] as const,
  checklistsVisible: ["launch"] as const,
};

export interface AccessContext {
  userId: string | null;
  role: "user" | "admin" | "super_admin" | "guest";
  isAdmin: boolean;
  plan: PlanKey;
  credits: number;
  /** Entitlement cấp tài khoản (membership / admin). */
  accountEntitlements: EntitlementKey[];
  /** Entitlement cấp cho business đang xem. */
  businessEntitlements: EntitlementKey[];
  businessId: string | null;
}

export function hasEntitlement(ctx: AccessContext, key: EntitlementKey): boolean {
  if (ctx.isAdmin) return true;
  return ctx.accountEntitlements.includes(key) || ctx.businessEntitlements.includes(key);
}

export function can(ctx: AccessContext, feature: Feature): boolean {
  if (ctx.isAdmin) return true;
  const required = FEATURE_REQUIREMENTS[feature];
  return required.some((k) => hasEntitlement(ctx, k));
}

export function derivePlan(account: EntitlementKey[], business: EntitlementKey[], isAdmin: boolean): PlanKey {
  if (isAdmin) return "pro_member";
  if (account.includes("multiple_businesses")) return "pro_member";
  if (business.includes("website_kit")) return "business_kit_pro";
  if (business.includes("brand_full")) return "business_kit";
  return "free";
}

/** Sản phẩm nên gợi ý mua để mở khoá feature. */
export function recommendedProductFor(feature: Feature): "business-kit" | "business-kit-pro" | "pro-membership" {
  switch (feature) {
    case "website.kit":
    case "exports.premium":
    case "generation.regenerate_free":
      return "business-kit-pro";
    case "business.multiple":
    case "templates.premium":
    case "generators.advanced":
      return "pro-membership";
    default:
      return "business-kit";
  }
}

export const GUEST_CONTEXT: AccessContext = {
  userId: null,
  role: "guest",
  isAdmin: false,
  plan: "free",
  credits: 0,
  accountEntitlements: [],
  businessEntitlements: [],
  businessId: null,
};
