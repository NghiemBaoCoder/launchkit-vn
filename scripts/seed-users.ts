/**
 * Tạo người dùng mẫu cho môi trường local/dev:
 *   pnpm seed:users
 * - admin@launchkit.vn / Admin@12345 (super_admin)
 * - staff@launchkit.vn / Staff@12345 (admin)
 * - demo@launchkit.vn / Demo@12345 (user, 10 credits)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

const USERS = [
  { email: "admin@launchkit.vn", password: "Admin@12345", full_name: "Super Admin", role: "super_admin", credits: 100 },
  { email: "staff@launchkit.vn", password: "Staff@12345", full_name: "Nhân viên vận hành", role: "admin", credits: 50 },
  { email: "demo@launchkit.vn", password: "Demo@12345", full_name: "Nguyễn Demo", role: "user", credits: 10 },
] as const;

async function main() {
  for (const u of USERS) {
    let id: string | undefined;
    const { data, error } = await admin.auth.admin.createUser({ email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.full_name } });
    if (error) {
      if (!/already|exists/i.test(error.message)) throw error;
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      id = list.users.find((x) => x.email === u.email)?.id;
      console.log(`• ${u.email} đã tồn tại`);
    } else {
      id = data.user.id;
      console.log(`✓ Tạo ${u.email}`);
    }
    if (!id) continue;
    const { data: profile } = await admin.from("profiles").select("credits").eq("id", id).single();
    const delta = u.credits - (profile?.credits ?? 0);
    await admin.from("profiles").update({ role: u.role, full_name: u.full_name }).eq("id", id);
    if (delta !== 0) await admin.rpc("adjust_credits", { p_user_id: id, p_amount: delta, p_reason: "Seed dữ liệu mẫu", p_ref_type: "seed" });
    console.log(`  → role=${u.role}, credits=${u.credits}`);
  }
  console.log("\nĐăng nhập tại /login với các tài khoản trên.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
