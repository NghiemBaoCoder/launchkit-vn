"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { logActivity } from "@/lib/data/activity";
import { fail, ok, type ActionResult, type BusinessAsset, type BusinessAssetVersion, type JsonValue } from "@/types";

async function getOwnedAsset(assetId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("business_assets").select("*").eq("id", assetId).maybeSingle();
  return data;
}

/** Lưu nội dung asset (tạo phiên bản mới). RLS đảm bảo quyền sở hữu. */
export async function updateAssetAction(input: { assetId: string; content: unknown; title?: string }): Promise<ActionResult<BusinessAsset>> {
  const profile = await requireProfileAction();
  const parsed = z.object({ assetId: z.string().uuid(), content: z.record(z.string(), z.unknown()), title: z.string().trim().min(1).max(120).optional() }).safeParse(input);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation");
  const asset = await getOwnedAsset(parsed.data.assetId);
  if (!asset) return fail("Không tìm thấy nội dung", "not_found");
  const supabase = await createClient();
  const version = asset.version + 1;
  const { data: updated, error } = await supabase
    .from("business_assets")
    .update({ content: parsed.data.content as JsonValue, title: parsed.data.title ?? asset.title, version })
    .eq("id", asset.id)
    .select("*")
    .single();
  if (error) return fail(error.message);
  await supabase.from("business_asset_versions").insert({ asset_id: asset.id, business_id: asset.business_id, version, content: parsed.data.content as JsonValue, source: "edit", created_by: profile.id });
  await logActivity({ userId: profile.id, businessId: asset.business_id, action: "asset.updated", entityType: "business_asset", entityId: asset.id, title: `Chỉnh sửa "${asset.title}"` });
  revalidatePath(`/business/${asset.business_id}`, "layout");
  return ok(updated, "Đã lưu");
}

export async function listAssetVersionsAction(assetId: string): Promise<ActionResult<BusinessAssetVersion[]>> {
  try {
    await requireProfileAction();
    const supabase = await createClient();
    const { data, error } = await supabase.from("business_asset_versions").select("*").eq("asset_id", assetId).order("version", { ascending: false }).limit(30);
    if (error) return fail(error.message);
    return ok(data ?? []);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Lỗi");
  }
}

/** Khôi phục phiên bản cũ: tạo phiên bản mới với nội dung cũ. */
export async function restoreAssetVersionAction(input: { assetId: string; versionId: string }): Promise<ActionResult<BusinessAsset>> {
  const profile = await requireProfileAction();
  const asset = await getOwnedAsset(input.assetId);
  if (!asset) return fail("Không tìm thấy nội dung", "not_found");
  const supabase = await createClient();
  const { data: ver } = await supabase.from("business_asset_versions").select("*").eq("id", input.versionId).eq("asset_id", asset.id).maybeSingle();
  if (!ver) return fail("Không tìm thấy phiên bản", "not_found");
  const version = asset.version + 1;
  const { data: updated, error } = await supabase.from("business_assets").update({ content: ver.content as JsonValue, version }).eq("id", asset.id).select("*").single();
  if (error) return fail(error.message);
  await supabase.from("business_asset_versions").insert({ asset_id: asset.id, business_id: asset.business_id, version, content: ver.content as JsonValue, source: "restore", created_by: profile.id });
  await logActivity({ userId: profile.id, businessId: asset.business_id, action: "asset.restored", entityType: "business_asset", entityId: asset.id, title: `Khôi phục phiên bản ${ver.version} của "${asset.title}"` });
  revalidatePath(`/business/${asset.business_id}`, "layout");
  return ok(updated, `Đã khôi phục phiên bản ${ver.version}`);
}
