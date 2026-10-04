"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAction } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/data/activity";
import { slugify } from "@/lib/utils";
import { fail, ok, type ActionResult, type BusinessType, type Industry, type JsonValue, type Template } from "@/types";
import { adminActionError, linesToArray, nullable, zodFieldErrors, zodMessage } from "./admin-helpers";

const slugField = z.string().trim().max(60).regex(/^[a-z0-9-]*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang");
const optionalUuid = z.union([z.uuid(), z.literal(""), z.null()]).optional();

function revalidateCatalog(path: string) {
  revalidatePath(path);
  // Catalog hiển thị ở trang public & wizard
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Industries                                                          */
/* ------------------------------------------------------------------ */

const industrySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Tên ngành tối thiểu 2 ký tự").max(120),
  slug: slugField,
  icon: z.string().trim().max(60).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  business_type_id: optionalUuid,
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
  seo_title: z.string().trim().max(160).optional().default(""),
  seo_description: z.string().trim().max(320).optional().default(""),
});

export type IndustryInput = z.input<typeof industrySchema>;

export async function upsertIndustryAction(input: IndustryInput): Promise<ActionResult<Industry>> {
  try {
    const admin = await requireAdminAction();
    const parsed = industrySchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const v = parsed.data;
    const slug = v.slug || slugify(v.name);
    if (!slug) return fail("Không tạo được slug từ tên", "validation", { slug: ["Slug không hợp lệ"] });

    const supabase = await createClient();
    const dup = await supabase.from("industries").select("id").eq("slug", slug).neq("id", v.id ?? "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (dup.data) return fail(`Slug "${slug}" đã được dùng`, "conflict", { slug: ["Slug đã tồn tại"] });

    const seo: Record<string, string> = {};
    if (v.seo_title) seo.title = v.seo_title;
    if (v.seo_description) seo.description = v.seo_description;
    const payload = { name: v.name, slug, icon: nullable(v.icon), description: nullable(v.description), business_type_id: v.business_type_id || null, active: v.active, sort_order: v.sort_order, seo: seo as JsonValue };

    if (v.id) {
      const { data: before } = await supabase.from("industries").select("*").eq("id", v.id).maybeSingle();
      if (!before) return fail("Không tìm thấy ngành", "not_found");
      const { data, error } = await supabase.from("industries").update(payload).eq("id", v.id).select("*").single();
      if (error) return fail(error.message);
      await logAudit({ actorId: admin.id, action: "admin.industry.update", targetType: "industry", targetId: v.id, before, after: data });
      revalidateCatalog("/admin/industries");
      return ok(data, "Đã cập nhật ngành");
    }
    const { data, error } = await supabase.from("industries").insert(payload).select("*").single();
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.industry.create", targetType: "industry", targetId: data.id, after: data });
    revalidateCatalog("/admin/industries");
    return ok(data, "Đã tạo ngành mới");
  } catch (e) {
    return adminActionError(e);
  }
}

export async function toggleIndustryActiveAction(id: string, active: boolean): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { error } = await supabase.from("industries").update({ active }).eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.industry.toggle", targetType: "industry", targetId: id, after: { active } });
    revalidateCatalog("/admin/industries");
    return ok(undefined, active ? "Đã bật ngành" : "Đã tắt ngành");
  } catch (e) {
    return adminActionError(e);
  }
}

/** Xoá ngành — chỉ khi không có business nào tham chiếu. */
export async function deleteIndustryAction(id: string): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("industry_id", id);
    if ((count ?? 0) > 0) return fail(`Không thể xoá: có ${count} business đang thuộc ngành này. Hãy tắt (vô hiệu hoá) thay vì xoá.`, "conflict");
    const { data: before } = await supabase.from("industries").select("*").eq("id", id).maybeSingle();
    if (!before) return fail("Không tìm thấy ngành", "not_found");
    const { error } = await supabase.from("industries").delete().eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.industry.delete", targetType: "industry", targetId: id, before });
    revalidateCatalog("/admin/industries");
    return ok(undefined, "Đã xoá ngành");
  } catch (e) {
    return adminActionError(e);
  }
}

/* ------------------------------------------------------------------ */
/* Business types                                                      */
/* ------------------------------------------------------------------ */

const businessTypeSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Tên loại hình tối thiểu 2 ký tự").max(120),
  slug: slugField,
  description: z.string().trim().max(500).optional().default(""),
  icon: z.string().trim().max(60).optional().default(""),
  tagline: z.string().trim().max(160).optional().default(""),
  hero_title: z.string().trim().max(160).optional().default(""),
  hero_description: z.string().trim().max(600).optional().default(""),
  highlights: z.string().max(2000).optional().default(""),
  seo_title: z.string().trim().max(160).optional().default(""),
  seo_description: z.string().trim().max(320).optional().default(""),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export type BusinessTypeInput = z.input<typeof businessTypeSchema>;

export async function upsertBusinessTypeAction(input: BusinessTypeInput): Promise<ActionResult<BusinessType>> {
  try {
    const admin = await requireAdminAction();
    const parsed = businessTypeSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const v = parsed.data;
    const slug = v.slug || slugify(v.name);
    if (!slug) return fail("Không tạo được slug từ tên", "validation", { slug: ["Slug không hợp lệ"] });

    const supabase = await createClient();
    const dup = await supabase.from("business_types").select("id").eq("slug", slug).neq("id", v.id ?? "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (dup.data) return fail(`Slug "${slug}" đã được dùng`, "conflict", { slug: ["Slug đã tồn tại"] });

    const seo: Record<string, string> = {};
    if (v.seo_title) seo.title = v.seo_title;
    if (v.seo_description) seo.description = v.seo_description;
    const payload = {
      name: v.name,
      slug,
      description: nullable(v.description),
      icon: nullable(v.icon),
      tagline: nullable(v.tagline),
      hero_title: nullable(v.hero_title),
      hero_description: nullable(v.hero_description),
      highlights: linesToArray(v.highlights) as JsonValue,
      seo: seo as JsonValue,
      active: v.active,
      sort_order: v.sort_order,
    };

    if (v.id) {
      const { data: before } = await supabase.from("business_types").select("*").eq("id", v.id).maybeSingle();
      if (!before) return fail("Không tìm thấy loại hình", "not_found");
      const { data, error } = await supabase.from("business_types").update(payload).eq("id", v.id).select("*").single();
      if (error) return fail(error.message);
      await logAudit({ actorId: admin.id, action: "admin.business_type.update", targetType: "business_type", targetId: v.id, before, after: data });
      revalidateCatalog("/admin/business-types");
      return ok(data, "Đã cập nhật loại hình");
    }
    const { data, error } = await supabase.from("business_types").insert(payload).select("*").single();
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.business_type.create", targetType: "business_type", targetId: data.id, after: data });
    revalidateCatalog("/admin/business-types");
    return ok(data, "Đã tạo loại hình mới");
  } catch (e) {
    return adminActionError(e);
  }
}

export async function toggleBusinessTypeActiveAction(id: string, active: boolean): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { error } = await supabase.from("business_types").update({ active }).eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.business_type.toggle", targetType: "business_type", targetId: id, after: { active } });
    revalidateCatalog("/admin/business-types");
    return ok(undefined, active ? "Đã bật loại hình" : "Đã tắt loại hình");
  } catch (e) {
    return adminActionError(e);
  }
}

/** Xoá loại hình — chỉ khi không có business/ngành nào tham chiếu. */
export async function deleteBusinessTypeAction(id: string): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const [{ count: bizCount }, { count: indCount }] = await Promise.all([
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("business_type_id", id),
      supabase.from("industries").select("id", { count: "exact", head: true }).eq("business_type_id", id),
    ]);
    if ((bizCount ?? 0) > 0) return fail(`Không thể xoá: có ${bizCount} business thuộc loại hình này. Hãy tắt thay vì xoá.`, "conflict");
    if ((indCount ?? 0) > 0) return fail(`Không thể xoá: có ${indCount} ngành đang gắn với loại hình này. Hãy chuyển ngành sang loại hình khác hoặc tắt loại hình.`, "conflict");
    const { data: before } = await supabase.from("business_types").select("*").eq("id", id).maybeSingle();
    if (!before) return fail("Không tìm thấy loại hình", "not_found");
    const { error } = await supabase.from("business_types").delete().eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.business_type.delete", targetType: "business_type", targetId: id, before });
    revalidateCatalog("/admin/business-types");
    return ok(undefined, "Đã xoá loại hình");
  } catch (e) {
    return adminActionError(e);
  }
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const templateSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Tên template tối thiểu 2 ký tự").max(120),
  category: z.enum(["brand", "pricing", "sales", "marketing", "content", "website", "operations", "documents"]),
  business_type_id: optionalUuid,
  industry_id: optionalUuid,
  config: z.string().max(50000, "Config quá lớn (tối đa 50KB)"),
  active: z.boolean().default(true),
});

export type TemplateInput = z.input<typeof templateSchema>;

export async function upsertTemplateAction(input: TemplateInput): Promise<ActionResult<Template>> {
  try {
    const admin = await requireAdminAction();
    const parsed = templateSchema.safeParse(input);
    if (!parsed.success) return fail(zodMessage(parsed.error), "validation", zodFieldErrors(parsed.error));
    const v = parsed.data;

    let config: unknown;
    try {
      config = v.config.trim() ? JSON.parse(v.config) : {};
    } catch (e) {
      return fail(`Config không phải JSON hợp lệ: ${e instanceof Error ? e.message : ""}`, "validation", { config: ["JSON không hợp lệ"] });
    }
    if (!config || typeof config !== "object" || Array.isArray(config)) return fail("Config phải là một JSON object", "validation", { config: ["Phải là object {...}"] });

    const supabase = await createClient();
    const payload = { name: v.name, category: v.category, business_type_id: v.business_type_id || null, industry_id: v.industry_id || null, config: config as JsonValue, active: v.active };

    if (v.id) {
      const { data: before } = await supabase.from("templates").select("*").eq("id", v.id).maybeSingle();
      if (!before) return fail("Không tìm thấy template", "not_found");
      const { data, error } = await supabase.from("templates").update({ ...payload, version: before.version + 1 }).eq("id", v.id).select("*").single();
      if (error) return fail(error.message);
      await logAudit({ actorId: admin.id, action: "admin.template.update", targetType: "template", targetId: v.id, before, after: data });
      revalidatePath("/admin/templates");
      return ok(data, `Đã lưu template (phiên bản ${data.version})`);
    }
    const { data, error } = await supabase.from("templates").insert({ ...payload, version: 1 }).select("*").single();
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.template.create", targetType: "template", targetId: data.id, after: data });
    revalidatePath("/admin/templates");
    return ok(data, "Đã tạo template");
  } catch (e) {
    return adminActionError(e);
  }
}

export async function toggleTemplateActiveAction(id: string, active: boolean): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { error } = await supabase.from("templates").update({ active }).eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.template.toggle", targetType: "template", targetId: id, after: { active } });
    revalidatePath("/admin/templates");
    return ok(undefined, active ? "Đã bật template" : "Đã tắt template");
  } catch (e) {
    return adminActionError(e);
  }
}

export async function deleteTemplateAction(id: string): Promise<ActionResult<undefined>> {
  try {
    const admin = await requireAdminAction();
    if (!z.uuid().safeParse(id).success) return fail("ID không hợp lệ", "validation");
    const supabase = await createClient();
    const { data: before } = await supabase.from("templates").select("*").eq("id", id).maybeSingle();
    if (!before) return fail("Không tìm thấy template", "not_found");
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) return fail(error.message);
    await logAudit({ actorId: admin.id, action: "admin.template.delete", targetType: "template", targetId: id, before });
    revalidatePath("/admin/templates");
    return ok(undefined, "Đã xoá template");
  } catch (e) {
    return adminActionError(e);
  }
}
