import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { JsonValue } from "@/types";
import type { AssetPayload, StageKey, StageOutputMap } from "./types";
import { slugify, randomToken } from "@/lib/utils";

type Admin = SupabaseClient<Database>;
type AssetCategory = Database["public"]["Enums"]["asset_category"];

/** Ghi/ghi đè một asset và lưu lịch sử phiên bản. */
export async function upsertAsset(admin: Admin, businessId: string, category: AssetCategory, payload: AssetPayload, source: string, actorId: string | null) {
  const { data: existing } = await admin.from("business_assets").select("id, version").eq("business_id", businessId).eq("category", category).eq("key", payload.key).maybeSingle();
  if (existing) {
    const version = existing.version + 1;
    const { error } = await admin.from("business_assets").update({ title: payload.title, content: payload.content as JsonValue, version, is_premium: payload.is_premium ?? false }).eq("id", existing.id);
    if (error) throw error;
    await admin.from("business_asset_versions").insert({ asset_id: existing.id, business_id: businessId, version, content: payload.content as JsonValue, source, created_by: actorId });
    return existing.id;
  }
  const { data: inserted, error } = await admin
    .from("business_assets")
    .insert({ business_id: businessId, category, key: payload.key, title: payload.title, content: payload.content as JsonValue, version: 1, is_premium: payload.is_premium ?? false })
    .select("id")
    .single();
  if (error) throw error;
  await admin.from("business_asset_versions").insert({ asset_id: inserted.id, business_id: businessId, version: 1, content: payload.content as JsonValue, source, created_by: actorId });
  return inserted.id;
}

async function upsertAssets(admin: Admin, businessId: string, category: AssetCategory, assets: AssetPayload[], source: string, actorId: string | null) {
  for (const a of assets) await upsertAsset(admin, businessId, category, a, source, actorId);
}

/** Lưu kết quả của một stage vào DB. `replace` = true khi tạo lại (xoá dữ liệu cũ do máy sinh). */
export async function persistStage<K extends StageKey>(admin: Admin, params: { stage: K; output: StageOutputMap[K]; businessId: string; actorId: string | null; source: "generate" | "regenerate" }) {
  const { stage, businessId, actorId, source } = params;
  const output = params.output as StageOutputMap[StageKey];

  switch (stage) {
    case "analyzing": {
      await upsertAssets(admin, businessId, "brand", (output as StageOutputMap["analyzing"]).assets, source, actorId);
      return;
    }
    case "brand": {
      await upsertAssets(admin, businessId, "brand", (output as StageOutputMap["brand"]).assets, source, actorId);
      return;
    }
    case "services": {
      const { services } = output as StageOutputMap["services"];
      if (source === "regenerate") await admin.from("services").delete().eq("business_id", businessId);
      const { error } = await admin.from("services").insert(services.map((s, i) => ({ business_id: businessId, ...s, sort_order: i })));
      if (error) throw error;
      return;
    }
    case "pricing": {
      const { packages, assets } = output as StageOutputMap["pricing"];
      await admin.from("pricing_packages").delete().eq("business_id", businessId).in("tier", ["basic", "standard", "premium"]);
      const { error } = await admin.from("pricing_packages").insert(packages.map((p, i) => ({ business_id: businessId, tier: p.tier, name: p.name, description: p.description, price: p.price, billing_unit: p.billing_unit, features: p.features as JsonValue, recommended: p.recommended, sort_order: i })));
      if (error) throw error;
      await upsertAssets(admin, businessId, "pricing", assets, source, actorId);
      return;
    }
    case "sales": {
      await upsertAssets(admin, businessId, "sales", (output as StageOutputMap["sales"]).assets, source, actorId);
      return;
    }
    case "marketing": {
      const { assets, plan } = output as StageOutputMap["marketing"];
      await upsertAssets(admin, businessId, "marketing", assets, source, actorId);
      await admin.from("marketing_plan_items").delete().eq("business_id", businessId);
      const start = new Date();
      const { error } = await admin.from("marketing_plan_items").insert(
        plan.map((p) => {
          const d = new Date(start);
          d.setDate(d.getDate() + p.day_index - 1);
          return { business_id: businessId, day_index: p.day_index, scheduled_date: d.toISOString().slice(0, 10), title: p.title, description: p.description, channel: p.channel, kind: p.kind };
        }),
      );
      if (error) throw error;
      return;
    }
    case "content": {
      const { items } = output as StageOutputMap["content"];
      if (source === "regenerate") await admin.from("content_items").delete().eq("business_id", businessId).neq("status", "published");
      const start = new Date();
      const { error } = await admin.from("content_items").insert(
        items.map((it, i) => {
          const d = new Date(start);
          d.setDate(d.getDate() + it.day_offset);
          return { business_id: businessId, title: it.title, hook: it.hook, caption: it.caption, cta: it.cta, platform: it.platform, content_type: it.content_type, status: "idea" as const, scheduled_date: d.toISOString().slice(0, 10), sort_order: i };
        }),
      );
      if (error) throw error;
      return;
    }
    case "website": {
      const site = output as StageOutputMap["website"];
      const { data: business } = await admin.from("businesses").select("name, slug, contact").eq("id", businessId).single();
      const { data: existing } = await admin.from("website_sites").select("business_id, contact, slug").eq("business_id", businessId).maybeSingle();
      const contactFromBusiness = (business?.contact as Record<string, string>) ?? {};
      const contact = { ...site.contact, ...(existing?.contact as Record<string, string> | undefined), email: contactFromBusiness.email ?? site.contact.email, phone: contactFromBusiness.phone ?? site.contact.phone };
      const slug = existing?.slug ?? (await uniqueSiteSlug(admin, business?.slug ?? slugify(business?.name ?? "site")));
      const { error } = await admin.from("website_sites").upsert({ business_id: businessId, slug, sections: site.sections as unknown as JsonValue, theme: site.theme as unknown as JsonValue, contact: contact as JsonValue }, { onConflict: "business_id" });
      if (error) throw error;
      return;
    }
    case "finance": {
      const fin = output as StageOutputMap["finance"];
      const rows = (Object.keys(fin) as (keyof typeof fin)[]).map((type) => ({ business_id: businessId, type, data: fin[type] as unknown as JsonValue }));
      const { error } = await admin.from("finance_calculations").upsert(rows, { onConflict: "business_id,type" });
      if (error) throw error;
      return;
    }
    case "operations": {
      const { checklists } = output as StageOutputMap["operations"];
      for (const cl of checklists) {
        const { data: existing } = await admin.from("checklists").select("id").eq("business_id", businessId).eq("kind", cl.kind).maybeSingle();
        let checklistId = existing?.id;
        if (checklistId) {
          await admin.from("checklists").update({ title: cl.title, description: cl.description }).eq("id", checklistId);
          await admin.from("checklist_items").delete().eq("checklist_id", checklistId);
        } else {
          const { data: created, error } = await admin.from("checklists").insert({ business_id: businessId, kind: cl.kind, title: cl.title, description: cl.description }).select("id").single();
          if (error) throw error;
          checklistId = created.id;
        }
        const { error } = await admin.from("checklist_items").insert(cl.items.map((it, i) => ({ checklist_id: checklistId!, business_id: businessId, title: it.title, description: it.description ?? null, sort_order: i })));
        if (error) throw error;
      }
      return;
    }
    case "documents": {
      const { documents } = output as StageOutputMap["documents"];
      for (const doc of documents) {
        const { data: existing } = await admin.from("documents").select("id, version").eq("business_id", businessId).eq("type", doc.type).order("created_at", { ascending: true }).limit(1).maybeSingle();
        if (existing && source === "regenerate") {
          await admin.from("documents").update({ title: doc.title, content: doc.content as JsonValue, version: existing.version + 1 }).eq("id", existing.id);
        } else if (!existing) {
          const { error } = await admin.from("documents").insert({ business_id: businessId, type: doc.type, title: doc.title, content: doc.content as JsonValue });
          if (error) throw error;
        }
      }
      return;
    }
  }
}

async function uniqueSiteSlug(admin: Admin, base: string) {
  let slug = base || `site-${randomToken(6).toLowerCase()}`;
  for (let i = 0; i < 5; i++) {
    const { data } = await admin.from("website_sites").select("business_id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${randomToken(4).toLowerCase()}`;
  }
  return `${base}-${randomToken(8).toLowerCase()}`;
}
