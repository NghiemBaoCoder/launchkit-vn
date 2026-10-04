"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { getAccessContext } from "@/lib/access/server";
import { can } from "@/lib/access/policy";
import { logActivity } from "@/lib/data/activity";
import { slugify } from "@/lib/utils";
import { fail, ok, type ActionResult, type JsonValue, type WebsiteSite } from "@/types";

const sectionSchema = z.object({ id: z.string().min(1), type: z.enum(["hero", "about", "problem", "solution", "services", "benefits", "pricing", "social_proof", "faq", "cta", "contact", "footer"]), enabled: z.boolean(), data: z.record(z.string(), z.unknown()) });
const themeSchema = z.object({ primary: z.string().max(20), secondary: z.string().max(20), accent: z.string().max(20), bg: z.string().max(20), font: z.string().max(60), radius: z.string().max(20) });
const contactSchema = z.object({ email: z.string().max(120).optional(), phone: z.string().max(30).optional(), address: z.string().max(200).optional(), facebook: z.string().max(200).optional(), zalo: z.string().max(60).optional(), instagram: z.string().max(200).optional(), tiktok: z.string().max(200).optional(), website: z.string().max(200).optional() });
const saveSchema = z.object({ sections: z.array(sectionSchema).max(20), theme: themeSchema, contact: contactSchema, slug: z.string().min(3, "Slug tối thiểu 3 ký tự").max(60) });

async function assertWebsiteAccess(businessId: string) {
  await requireProfileAction();
  const ctx = await getAccessContext(businessId);
  if (!can(ctx, "website.kit")) throw new Error("Website Kit thuộc gói Business Kit Pro. Hãy nâng cấp để chỉnh sửa và xuất bản.");
}

export async function saveWebsiteAction(businessId: string, input: unknown): Promise<ActionResult<WebsiteSite>> {
  try {
    await assertWebsiteAccess(businessId);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Không có quyền", "forbidden");
  }
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return fail("Dữ liệu website không hợp lệ", "validation", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const supabase = await createClient();
  const slug = slugify(parsed.data.slug);
  const { data: clash } = await supabase.from("website_sites").select("business_id").eq("slug", slug).neq("business_id", businessId).maybeSingle();
  if (clash) return fail("Slug này đã được dùng. Hãy chọn slug khác.", "validation", { slug: ["Đã tồn tại"] });
  const { data, error } = await supabase
    .from("website_sites")
    .upsert({ business_id: businessId, slug, sections: parsed.data.sections as unknown as JsonValue, theme: parsed.data.theme as unknown as JsonValue, contact: parsed.data.contact as unknown as JsonValue }, { onConflict: "business_id" })
    .select("*")
    .single();
  if (error) return fail(error.message);
  const profile = await requireProfileAction();
  await logActivity({ userId: profile.id, businessId, action: "website.saved", entityType: "website_site", entityId: businessId, title: "Cập nhật Website Kit" });
  revalidatePath(`/business/${businessId}/website`);
  revalidatePath(`/site/${slug}`);
  return ok(data, "Đã lưu website");
}

export async function publishWebsiteAction(businessId: string, published: boolean): Promise<ActionResult<WebsiteSite>> {
  try {
    await assertWebsiteAccess(businessId);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Không có quyền", "forbidden");
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("website_sites").update({ is_published: published, published_at: published ? new Date().toISOString() : null }).eq("business_id", businessId).select("*").single();
  if (error) return fail(error.message);
  const profile = await requireProfileAction();
  await logActivity({ userId: profile.id, businessId, action: published ? "website.published" : "website.unpublished", entityType: "website_site", entityId: businessId, title: published ? "Xuất bản website" : "Gỡ website" });
  revalidatePath(`/business/${businessId}/website`);
  revalidatePath(`/site/${data.slug}`);
  return ok(data, published ? "Website đã được xuất bản" : "Đã gỡ website khỏi public");
}
