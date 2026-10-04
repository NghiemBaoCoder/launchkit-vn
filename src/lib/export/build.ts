import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DocumentRow } from "@/types";
import { contentToBlocks, money, type Block, type Outline } from "./outline";
import { formatDate } from "@/lib/utils";

type Client = SupabaseClient<Database>;

export const SECTION_TITLES: Record<string, string> = { brand: "Thương hiệu", services: "Dịch vụ", pricing: "Bảng giá", sales: "Bán hàng", marketing: "Marketing", content: "Nội dung", website: "Website", finance: "Tài chính", operations: "Vận hành", documents: "Tài liệu" };
export const EXPORTABLE_SECTIONS = ["brand", "services", "pricing", "sales", "marketing", "content", "finance", "operations", "documents"] as const;
export type ExportSection = (typeof EXPORTABLE_SECTIONS)[number];

const DOC_TYPE_LABEL: Record<string, string> = { quotation: "Báo giá", proposal: "Đề xuất", service_agreement: "Hợp đồng dịch vụ", client_brief: "Brief khách hàng", invoice: "Hoá đơn", intake_form: "Form tiếp nhận" };

/** Outline cho một mục của kit. */
export async function buildSectionOutline(client: Client, businessId: string, section: ExportSection, businessName: string): Promise<Outline> {
  const blocks: Block[] = [];
  switch (section) {
    case "services": {
      const { data } = await client.from("services").select("*").eq("business_id", businessId).order("sort_order");
      blocks.push({ type: "table", headers: ["Dịch vụ", "Giá", "Đơn vị", "Thời gian", "Trạng thái"], rows: (data ?? []).map((s) => [s.name, s.sale_price ? `${money(s.sale_price)} (gốc ${money(s.price)})` : money(s.price), s.unit ?? "", s.delivery_time ?? "", s.active ? "Đang bán" : "Tạm ẩn"]) });
      for (const s of data ?? []) {
        blocks.push({ type: "h3", text: s.name });
        if (s.description) blocks.push({ type: "p", text: s.description });
        if (s.features.length) { blocks.push({ type: "small", text: "Bao gồm" }); blocks.push({ type: "bullets", items: s.features }); }
        if (s.benefits.length) { blocks.push({ type: "small", text: "Lợi ích" }); blocks.push({ type: "bullets", items: s.benefits }); }
        if (s.upsell) blocks.push({ type: "kv", label: "Bán thêm", value: s.upsell });
      }
      break;
    }
    case "pricing": {
      const [{ data: pk }, { data: assets }] = await Promise.all([client.from("pricing_packages").select("*").eq("business_id", businessId).order("sort_order"), client.from("business_assets").select("*").eq("business_id", businessId).eq("category", "pricing")]);
      blocks.push({ type: "h2", text: "Gói giá" });
      blocks.push({ type: "table", headers: ["Gói", "Giá", "Đơn vị", "Khuyến nghị"], rows: (pk ?? []).map((p) => [p.name, money(p.price), p.billing_unit ?? "", p.recommended ? "✓" : ""]) });
      for (const p of pk ?? []) { blocks.push({ type: "h3", text: `${p.name} — ${money(p.price)}` }); if (p.description) blocks.push({ type: "p", text: p.description }); blocks.push({ type: "bullets", items: (p.features as string[]) ?? [] }); }
      for (const a of assets ?? []) { blocks.push({ type: "h2", text: a.title }); blocks.push(...contentToBlocks(a.content)); }
      break;
    }
    case "content": {
      const { data } = await client.from("content_items").select("*").eq("business_id", businessId).order("scheduled_date", { ascending: true, nullsFirst: false });
      for (const c of data ?? []) {
        blocks.push({ type: "h3", text: `${c.title}` });
        blocks.push({ type: "small", text: `${c.platform} · ${c.content_type} · ${c.scheduled_date ? formatDate(c.scheduled_date) : "chưa lên lịch"} · ${c.status}` });
        if (c.hook) blocks.push({ type: "kv", label: "Hook", value: c.hook });
        if (c.caption) blocks.push({ type: "p", text: c.caption });
        if (c.cta) blocks.push({ type: "kv", label: "CTA", value: c.cta });
        blocks.push({ type: "divider" });
      }
      break;
    }
    case "marketing": {
      const [{ data: assets }, { data: plan }] = await Promise.all([client.from("business_assets").select("*").eq("business_id", businessId).eq("category", "marketing").order("created_at"), client.from("marketing_plan_items").select("*").eq("business_id", businessId).order("day_index")]);
      for (const a of assets ?? []) { blocks.push({ type: "h2", text: a.title }); blocks.push(...contentToBlocks(a.content)); }
      blocks.push({ type: "h2", text: "Kế hoạch 30 ngày" });
      blocks.push({ type: "table", headers: ["Ngày", "Việc", "Kênh", "Loại", "Xong"], rows: (plan ?? []).map((p) => [String(p.day_index), p.title, p.channel ?? "", p.kind, p.done ? "✓" : ""]) });
      break;
    }
    case "finance": {
      const { data } = await client.from("finance_calculations").select("*").eq("business_id", businessId);
      const label: Record<string, string> = { startup_cost: "Chi phí khởi nghiệp", monthly_expenses: "Chi phí hàng tháng", revenue_target: "Mục tiêu doanh thu", profit: "Ước tính lợi nhuận", break_even: "Điểm hoà vốn" };
      for (const f of data ?? []) { blocks.push({ type: "h2", text: label[f.type] ?? f.type }); blocks.push(...contentToBlocks(f.data)); }
      blocks.push({ type: "small", text: "Các con số là ước tính tham khảo, không phải tư vấn tài chính." });
      break;
    }
    case "operations": {
      const [{ data: lists }, { data: items }] = await Promise.all([client.from("checklists").select("*").eq("business_id", businessId), client.from("checklist_items").select("*").eq("business_id", businessId).order("sort_order")]);
      for (const l of lists ?? []) { blocks.push({ type: "h2", text: l.title }); if (l.description) blocks.push({ type: "p", text: l.description }); blocks.push({ type: "bullets", items: (items ?? []).filter((i) => i.checklist_id === l.id).map((i) => `${i.done ? "[x]" : "[ ]"} ${i.title}`) }); }
      break;
    }
    case "documents": {
      const { data } = await client.from("documents").select("*").eq("business_id", businessId).order("created_at");
      for (const d of data ?? []) { const o = documentOutline(d); blocks.push({ type: "h2", text: o.title }); blocks.push(...o.blocks); blocks.push({ type: "divider" }); }
      break;
    }
    default: {
      const { data } = await client.from("business_assets").select("*").eq("business_id", businessId).eq("category", section).order("created_at");
      for (const a of data ?? []) { blocks.push({ type: "h2", text: a.title }); blocks.push(...contentToBlocks(a.content)); }
    }
  }
  return { title: `${SECTION_TITLES[section] ?? section} — ${businessName}`, blocks };
}

/** Outline cho toàn bộ kit. */
export async function buildKitOutline(client: Client, businessId: string, businessName: string, sections: ExportSection[] = [...EXPORTABLE_SECTIONS]): Promise<Outline> {
  const blocks: Block[] = [{ type: "p", text: `Business Kit được tạo bởi LaunchKit VN · ${formatDate(new Date())}` }];
  for (const s of sections) {
    const o = await buildSectionOutline(client, businessId, s, businessName);
    blocks.push({ type: "h1", text: SECTION_TITLES[s] ?? s }, ...o.blocks);
  }
  return { title: `Business Kit — ${businessName}`, subtitle: "Thương hiệu · Dịch vụ · Bảng giá · Bán hàng · Marketing · Nội dung · Tài chính · Vận hành · Tài liệu", blocks };
}

/** Outline cho một tài liệu (báo giá/hợp đồng/...). */
export function documentOutline(doc: Pick<DocumentRow, "type" | "title" | "content">): Outline {
  const c = doc.content as Record<string, unknown>;
  const blocks: Block[] = [];
  const party = (p: unknown, heading: string) => {
    if (!p || typeof p !== "object") return;
    const o = p as Record<string, string>;
    blocks.push({ type: "h3", text: heading });
    for (const [k, label] of [["name", "Tên"], ["company", "Công ty"], ["address", "Địa chỉ"], ["phone", "Điện thoại"], ["email", "Email"], ["tax_code", "MST"], ["representative", "Đại diện"]] as const) if (o[k]) blocks.push({ type: "kv", label, value: o[k] });
  };
  const itemsTable = () => {
    const items = (c.items as { description: string; quantity: number; unit: string; unit_price: number; total: number }[]) ?? [];
    blocks.push({ type: "table", headers: ["Hạng mục", "SL", "Đơn vị", "Đơn giá", "Thành tiền"], rows: items.map((i) => [i.description, String(i.quantity), i.unit, money(i.unit_price), money(i.total)]) });
    blocks.push({ type: "kv", label: "Tạm tính", value: money(c.subtotal) });
    if (Number(c.discount) > 0) blocks.push({ type: "kv", label: "Giảm giá", value: money(c.discount) });
    if (Number(c.vat_rate) > 0) blocks.push({ type: "kv", label: "VAT", value: `${c.vat_rate}%` });
    blocks.push({ type: "kv", label: "TỔNG CỘNG", value: money(c.total) });
  };
  switch (doc.type) {
    case "quotation":
      blocks.push({ type: "kv", label: "Số báo giá", value: String(c.number ?? "") }, { type: "kv", label: "Ngày", value: formatDate(String(c.date)) }, { type: "kv", label: "Hiệu lực đến", value: formatDate(String(c.valid_until)) });
      party(c.provider, "Bên cung cấp"); party(c.client, "Khách hàng");
      if (c.intro) blocks.push({ type: "p", text: String(c.intro) });
      itemsTable();
      if (c.payment_terms) blocks.push({ type: "kv", label: "Thanh toán", value: String(c.payment_terms) });
      if (c.delivery_time) blocks.push({ type: "kv", label: "Thời gian thực hiện", value: String(c.delivery_time) });
      if (Array.isArray(c.notes)) blocks.push({ type: "bullets", items: c.notes as string[] });
      break;
    case "invoice":
      blocks.push({ type: "kv", label: "Số hoá đơn", value: String(c.number ?? "") }, { type: "kv", label: "Ngày", value: formatDate(String(c.date)) }, { type: "kv", label: "Hạn thanh toán", value: formatDate(String(c.due_date)) });
      party(c.provider, "Bên cung cấp"); party(c.client, "Khách hàng");
      itemsTable();
      blocks.push({ type: "kv", label: "Đã thanh toán", value: money(c.paid) }, { type: "kv", label: "Còn lại", value: money(c.balance_due) });
      if (c.payment_info) { blocks.push({ type: "h3", text: "Thông tin thanh toán" }); blocks.push(...contentToBlocks(c.payment_info)); }
      if (Array.isArray(c.notes)) blocks.push({ type: "bullets", items: c.notes as string[] });
      break;
    case "service_agreement":
      blocks.push({ type: "kv", label: "Số hợp đồng", value: String(c.number ?? "") }, { type: "kv", label: "Ngày", value: formatDate(String(c.date)) });
      party(c.party_a, "Bên A (Khách hàng)"); party(c.party_b, "Bên B (Bên cung cấp)");
      for (const cl of (c.clauses as { heading: string; body: string }[]) ?? []) { blocks.push({ type: "h3", text: cl.heading }); blocks.push({ type: "p", text: cl.body }); }
      if (c.disclaimer) blocks.push({ type: "small", text: String(c.disclaimer) });
      break;
    case "proposal":
      blocks.push({ type: "kv", label: "Ngày", value: formatDate(String(c.date)) });
      party(c.provider, "Bên đề xuất"); party(c.client, "Khách hàng");
      for (const s of (c.sections as { heading: string; body: string }[]) ?? []) { blocks.push({ type: "h3", text: s.heading }); blocks.push({ type: "p", text: s.body }); }
      break;
    case "client_brief":
      if (c.intro) blocks.push({ type: "p", text: String(c.intro) });
      for (const s of (c.sections as { heading: string; fields: string[] }[]) ?? []) { blocks.push({ type: "h3", text: s.heading }); blocks.push({ type: "numbered", items: s.fields.map((f) => `${f}: ________________`) }); }
      break;
    case "intake_form":
      if (c.intro) blocks.push({ type: "p", text: String(c.intro) });
      for (const f of (c.fields as { label: string; type: string; required?: boolean; options?: string[] }[]) ?? []) { blocks.push({ type: "kv", label: `${f.label}${f.required ? " *" : ""}`, value: f.options?.length ? `(${f.options.join(" / ")})` : "________________" }); }
      if (c.thank_you) blocks.push({ type: "p", text: String(c.thank_you) });
      break;
    default:
      blocks.push(...contentToBlocks(c));
  }
  return { title: doc.title || DOC_TYPE_LABEL[doc.type] || "Tài liệu", subtitle: DOC_TYPE_LABEL[doc.type], blocks };
}

/** CSV cho dữ liệu dạng bảng của kit. */
export async function buildKitCsv(client: Client, businessId: string): Promise<string> {
  const { toCsv } = await import("@/lib/workspace/csv");
  const [{ data: services }, { data: packages }, { data: content }, { data: plan }] = await Promise.all([
    client.from("services").select("*").eq("business_id", businessId).order("sort_order"),
    client.from("pricing_packages").select("*").eq("business_id", businessId).order("sort_order"),
    client.from("content_items").select("*").eq("business_id", businessId).order("scheduled_date"),
    client.from("marketing_plan_items").select("*").eq("business_id", businessId).order("day_index"),
  ]);
  const rows: (string | number | null)[][] = [["Loại", "Tên/Tiêu đề", "Giá/Ngày", "Đơn vị/Kênh", "Trạng thái", "Mô tả", "Chi tiết"]];
  for (const s of services ?? []) rows.push(["Dịch vụ", s.name, s.sale_price ?? s.price, s.unit, s.active ? "Đang bán" : "Tạm ẩn", s.description, s.features.join(" | ")]);
  for (const p of packages ?? []) rows.push(["Gói giá", p.name, p.price, p.billing_unit, p.recommended ? "Khuyến nghị" : "", p.description, ((p.features as string[]) ?? []).join(" | ")]);
  for (const c of content ?? []) rows.push(["Nội dung", c.title, c.scheduled_date, c.platform, c.status, c.hook, c.caption]);
  for (const m of plan ?? []) rows.push(["Kế hoạch", m.title, m.scheduled_date, m.channel, m.done ? "Xong" : "", m.description, m.kind]);
  return toCsv(rows);
}
