/**
 * Kiểm thử Row Level Security với Supabase local.
 * Chạy: pnpm test:rls (cần `supabase start` và biến môi trường trong .env.local).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import { config } from "dotenv";
import type { Database } from "@/types/database";

config({ path: ".env.local" });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient<Database>(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

async function userClient(email: string): Promise<{ client: SupabaseClient<Database>; id: string }> {
  const password = "Password123!";
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: email.split("@")[0] } });
  if (error && !error.message.includes("already")) throw error;
  const client = createClient<Database>(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error: signErr } = await client.auth.signInWithPassword({ email, password });
  if (signErr) throw signErr;
  return { client, id: created?.user?.id ?? data.user!.id };
}

const stamp = Date.now();
let A: { client: SupabaseClient<Database>; id: string };
let B: { client: SupabaseClient<Database>; id: string };
let businessId = "";

beforeAll(async () => {
  A = await userClient(`rls-a-${stamp}@example.com`);
  B = await userClient(`rls-b-${stamp}@example.com`);
  const { data, error } = await A.client.from("businesses").insert({ user_id: A.id, name: "RLS Test", slug: `rls-test-${stamp}` }).select("id").single();
  if (error) throw error;
  businessId = data.id;
  await A.client.from("business_assets").insert({ business_id: businessId, category: "brand", key: "tagline", title: "Tagline", content: { selected: "bí mật" } });
  await A.client.from("documents").insert({ business_id: businessId, type: "quotation", title: "Báo giá", content: {} });
});

describe("RLS — quyền sở hữu business", () => {
  it("chủ sở hữu đọc được business và asset của mình", async () => {
    const { data } = await A.client.from("businesses").select("id").eq("id", businessId);
    expect(data).toHaveLength(1);
    const { data: assets } = await A.client.from("business_assets").select("id").eq("business_id", businessId);
    expect(assets).toHaveLength(1);
  });
  it("người khác KHÔNG đọc/sửa/xoá được business, asset, document", async () => {
    expect((await B.client.from("businesses").select("id").eq("id", businessId)).data).toEqual([]);
    expect((await B.client.from("business_assets").select("id").eq("business_id", businessId)).data).toEqual([]);
    expect((await B.client.from("documents").select("id").eq("business_id", businessId)).data).toEqual([]);
    const upd = await B.client.from("businesses").update({ name: "hack" }).eq("id", businessId).select("id");
    expect(upd.data).toEqual([]);
    const del = await B.client.from("businesses").delete().eq("id", businessId).select("id");
    expect(del.data).toEqual([]);
    const { data: still } = await admin.from("businesses").select("name").eq("id", businessId).single();
    expect(still?.name).toBe("RLS Test");
  });
  it("không thể tạo business cho user khác", async () => {
    const { error } = await B.client.from("businesses").insert({ user_id: A.id, name: "x", slug: `x-${stamp}` });
    expect(error).toBeTruthy();
  });
  it("khách (anon) không đọc được businesses nhưng đọc được catalog", async () => {
    const anonClient = createClient<Database>(url, anon);
    expect((await anonClient.from("businesses").select("id")).data).toEqual([]);
    expect(((await anonClient.from("business_types").select("id")).data ?? []).length).toBeGreaterThan(0);
    expect(((await anonClient.from("products").select("id")).data ?? []).length).toBeGreaterThan(0);
  });
});

describe("RLS — profile & admin", () => {
  it("user không tự tăng credits / đổi role (trigger bảo vệ)", async () => {
    await A.client.from("profiles").update({ credits: 9999, role: "super_admin" }).eq("id", A.id);
    const { data } = await admin.from("profiles").select("credits, role").eq("id", A.id).single();
    expect(data?.role).toBe("user");
    expect(data?.credits).toBeLessThan(9999);
  });
  it("user thường không gọi được thống kê admin và không đọc coupons/audit", async () => {
    const { error } = await A.client.rpc("admin_dashboard_stats", { p_days: 30 });
    expect(error).toBeTruthy();
    expect((await A.client.from("coupons").select("id")).data).toEqual([]);
    expect((await A.client.from("audit_logs").select("id")).data).toEqual([]);
    expect((await A.client.from("profiles").select("id").eq("id", B.id)).data).toEqual([]);
  });
  it("admin đọc được mọi business", async () => {
    await admin.from("profiles").update({ role: "admin" }).eq("id", B.id);
    const { data } = await B.client.from("businesses").select("id").eq("id", businessId);
    expect(data).toHaveLength(1);
    await admin.from("profiles").update({ role: "user" }).eq("id", B.id);
  });
  it("entitlements/orders chỉ chủ sở hữu đọc được", async () => {
    await admin.from("entitlements").insert({ user_id: A.id, business_id: businessId, key: "brand_full", source: "admin" });
    expect(((await A.client.from("entitlements").select("key").eq("business_id", businessId)).data ?? []).length).toBe(1);
    expect((await B.client.from("entitlements").select("key").eq("business_id", businessId)).data).toEqual([]);
  });
});

describe("RLS — chia sẻ public", () => {
  it("get_shared_kit chỉ trả về mục đã chọn và chỉ khi token hợp lệ", async () => {
    const { data: share } = await A.client.from("shares").insert({ business_id: businessId, token: `tok-${stamp}`, sections: ["brand"], active: true }).select("token").single();
    const anonClient = createClient<Database>(url, anon);
    const { data } = await anonClient.rpc("get_shared_kit", { p_token: share!.token });
    const kit = data as { assets: { key: string }[]; sections: string[] } | null;
    expect(kit?.assets.map((a) => a.key)).toEqual(["tagline"]);
    expect((await anonClient.rpc("get_shared_kit", { p_token: "sai" })).data).toBeNull();
    expect((await anonClient.from("shares").select("token")).data).toEqual([]);
  });
});

describe("Storage — chính sách thư mục theo user", () => {
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  it("user chỉ ghi được vào thư mục của mình trong bucket logos/avatars", async () => {
    const own = await A.client.storage.from("logos").upload(`${A.id}/test-${stamp}.png`, png, { contentType: "image/png", upsert: true });
    expect(own.error).toBeNull();
    const other = await B.client.storage.from("logos").upload(`${A.id}/hack-${stamp}.png`, png, { contentType: "image/png", upsert: true });
    expect(other.error).toBeTruthy();
    const avatarOther = await B.client.storage.from("avatars").upload(`${A.id}/hack-${stamp}.png`, png, { contentType: "image/png" });
    expect(avatarOther.error).toBeTruthy();
    await admin.storage.from("logos").remove([`${A.id}/test-${stamp}.png`]);
  });
  it("bucket exports: chỉ chủ sở hữu đọc, user không tự upload", async () => {
    const path = `${A.id}/${businessId}/kit-${stamp}.txt`;
    const up = await admin.storage.from("exports").upload(path, Buffer.from("secret"), { contentType: "text/plain" });
    expect(up.error).toBeNull();
    const ownDl = await A.client.storage.from("exports").download(path);
    expect(ownDl.error).toBeNull();
    const otherDl = await B.client.storage.from("exports").download(path);
    expect(otherDl.error).toBeTruthy();
    const selfUp = await A.client.storage.from("exports").upload(`${A.id}/x-${stamp}.txt`, Buffer.from("x"), { contentType: "text/plain" });
    expect(selfUp.error).toBeTruthy();
    await admin.storage.from("exports").remove([path]);
  });
});

describe("RLS — hộp thư liên hệ (contact_messages)", () => {
  it("user thường không đọc được tin của người khác; service role ghi được; admin đọc được", async () => {
    const { data: inserted, error } = await admin.from("contact_messages").insert({ name: "RLS Guest", email: `rls-contact-${stamp}@example.com`, topic: "support", message: "Tin nhắn kiểm thử RLS, đủ dài để hợp lệ." }).select("id").single();
    expect(error).toBeNull();
    // Người dùng thường (B) không thấy tin của khách ẩn danh và không insert trực tiếp được
    expect((await B.client.from("contact_messages").select("id").eq("id", inserted!.id)).data).toEqual([]);
    const direct = await B.client.from("contact_messages").insert({ name: "Hack", email: "h@example.com", message: "Cố ghi trực tiếp vào bảng này." });
    expect(direct.error).not.toBeNull();
    // Admin đọc & cập nhật được
    const adminUser = await userClient(`rls-admin-contact-${stamp}@example.com`);
    await admin.from("profiles").update({ role: "admin" }).eq("id", adminUser.id);
    const adminClient = (await userClient(`rls-admin-contact-${stamp}@example.com`)).client; // đăng nhập lại để JWT có role mới
    const { data: seen } = await adminClient.from("contact_messages").select("id, status").eq("id", inserted!.id);
    expect(seen).toHaveLength(1);
    const upd = await adminClient.from("contact_messages").update({ status: "read" }).eq("id", inserted!.id).select("status").single();
    expect(upd.data?.status).toBe("read");
    await admin.from("contact_messages").delete().eq("id", inserted!.id);
  });
});
