import type { Database } from "./database";

export type { Database };
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

export type Profile = Tables<"profiles">;
export type Business = Tables<"businesses">;
export type BusinessType = Tables<"business_types">;
export type Industry = Tables<"industries">;
export type BusinessAsset = Tables<"business_assets">;
export type BusinessAssetVersion = Tables<"business_asset_versions">;
export type Service = Tables<"services">;
export type PricingPackage = Tables<"pricing_packages">;
export type ContentItem = Tables<"content_items">;
export type MarketingPlanItem = Tables<"marketing_plan_items">;
export type WebsiteSite = Tables<"website_sites">;
export type FinanceCalculation = Tables<"finance_calculations">;
export type Checklist = Tables<"checklists">;
export type ChecklistItem = Tables<"checklist_items">;
export type DocumentRow = Tables<"documents">;
export type ExportRow = Tables<"exports">;
export type Share = Tables<"shares">;
export type GenerationJob = Tables<"generation_jobs">;
export type Notification = Tables<"notifications">;
export type Product = Tables<"products">;
export type Coupon = Tables<"coupons">;
export type Order = Tables<"orders">;
export type Payment = Tables<"payments">;
export type Entitlement = Tables<"entitlements">;
export type Subscription = Tables<"subscriptions">;
export type CreditTransaction = Tables<"credit_transactions">;
export type Affiliate = Tables<"affiliates">;
export type Commission = Tables<"commissions">;
export type Template = Tables<"templates">;
export type AppSetting = Tables<"app_settings">;
export type AuditLog = Tables<"audit_logs">;
export type ActivityLog = Tables<"activity_logs">;

export type UserRole = Enums<"user_role">;
export type BusinessStatus = Enums<"business_status">;
export type AssetCategory = Enums<"asset_category">;
export type ContentPlatform = Enums<"content_platform">;
export type ContentStatus = Enums<"content_status">;
export type ChecklistKind = Enums<"checklist_kind">;
export type DocumentType = Enums<"document_type">;
export type ExportFormat = Enums<"export_format">;
export type JobStatus = Enums<"job_status">;
export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;

/** Kết quả chuẩn cho server actions. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; code?: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}
export function fail(error: string, code?: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { ok: false, error, code, fieldErrors };
}

/** Giá trị jsonb không null (các cột `not null default '{}'`). */
export type JsonValue = NonNullable<import("./database").Json>;
