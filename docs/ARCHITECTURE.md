# LaunchKit VN — Kiến trúc & quy ước code

## Stack
- Next.js 16 (App Router, Turbopack, `proxy.ts` thay cho middleware), React 19, TypeScript strict.
- Tailwind CSS v4 + bộ UI riêng trong `src/components/ui/*` (shadcn-style, dùng package `radix-ui` hợp nhất: `import { Dialog as DialogPrimitive } from "radix-ui"`).
- Supabase: Auth + Postgres (RLS trên mọi bảng) + Storage. Migrations trong `supabase/migrations`, seed trong `supabase/seed.sql`.
- Zod v4 (`import { z } from "zod"`), react-hook-form, sonner (toast), lucide-react (icon), recharts (chart), date-fns.

## Thư mục
```
src/app/(site)       trang public (header/footer site)
src/app/(auth)       login/register/forgot/reset/verify
src/app/(wizard)     onboarding + generate (layout tối giản)
src/app/(app)        khu vực khách hàng đã đăng nhập (AppShell sidebar+topbar)
src/app/admin        khu vực admin (layout riêng, requireAdmin)
src/app/api          route handlers (webhook, track, download)
src/lib/supabase     client.ts (browser), server.ts (SSR, RLS), admin.ts (service role – chỉ server sau khi check quyền)
src/lib/auth.ts      getCurrentUser/getCurrentProfile (cache), requireProfile/requireAdmin (redirect), *Action (throw)
src/lib/access       policy.ts (ma trận quyền, can(ctx, feature)), server.ts (getAccessContext(businessId?))
src/lib/actions      server actions ("use server"), mỗi file một domain
src/lib/data         loader server-only (cache())
src/lib/ai           provider mock/anthropic, jobs.ts (runner), persist.ts
src/types            database.ts (generated), index.ts (alias + ActionResult)
```

## Quy ước server action
```ts
"use server";
export async function doThingAction(input): Promise<ActionResult<T>> {
  const profile = await requireProfileAction();        // hoặc requireAdminAction()
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("Thông tin không hợp lệ", "validation", parsed.error.flatten().fieldErrors);
  const supabase = await createClient();               // RLS áp dụng
  ...
  revalidatePath("/duong-dan");
  return ok(data, "Đã lưu");
}
```
- Mọi export trong file `"use server"` PHẢI là async function. Helper sync đặt ở file khác.
- Trả về `ActionResult` (`ok()/fail()` từ `@/types`) — KHÔNG throw ra client. Client: `const res = await action(); if (!res.ok) toast.error(res.error)`.
- Client chỉ gọi server action hoặc route handler; không dùng supabase browser client để ghi dữ liệu nhạy cảm (có thể dùng để upload storage).
- Admin: luôn `requireAdminAction()`/`requireAdmin()` rồi dùng `createAdminClient()` nếu cần bỏ RLS; ghi `logAudit()` (`@/lib/data/activity`) cho thao tác thay đổi.
- Số tiền: `numeric` trả về từ supabase-js là `number` (đã map trong types).
- jsonb không-null: cast `as JsonValue` (từ `@/types`).

## Quy ước UI
- Server Component mặc định; `"use client"` chỉ cho tương tác. Page nhận `params`/`searchParams` là Promise (`await`).
- Mỗi route có `loading.tsx` (skeleton) ở các khu vực dữ liệu; empty state dùng `<EmptyState icon title description action/>`.
- Xác nhận hành động phá huỷ: `<ConfirmDialog destructive typeToConfirm?/>`. Không dùng `alert()/confirm()`.
- Toast: `toast.success/error/info` từ `sonner`.
- Tiền tệ: `formatVND()`, ngày: `formatDate()/formatDateTime()/timeAgo()` từ `@/lib/utils`.
- Tiếng Việt cho toàn bộ copy. Không để nút không hoạt động: nếu cần tích hợp ngoài → `disabled` + tooltip/ghi chú.
- Bảng: `Table*` từ `@/components/ui/table`, phân trang `<Pagination page pageSize total hrefFor/>`.
- Form: `Form/FormField/FormItem/FormLabel/FormControl/FormMessage` + react-hook-form + zodResolver.

## Phân quyền
- Entitlement keys & feature map: `src/lib/access/policy.ts`. UI/server luôn hỏi `can(ctx, "feature")`.
- `getAccessContext(businessId)` trả về plan, credits, entitlements. Admin bypass.
- Role: `profiles.role` (user/admin/super_admin), đồng bộ vào JWT `app_metadata.role` bằng trigger; `proxy.ts` chặn sớm, server kiểm tra lại bằng DB.

## Thanh toán (mock)
- `products` (free, business-kit, business-kit-pro, pro-membership). Đơn: `orders` + `order_items` + `payments`.
- MockPaymentProvider: trang cổng giả `/checkout/pay/[paymentId]` → POST webhook `/api/payments/webhook/mock` (ký HMAC bằng `MOCK_PAYMENT_WEBHOOK_SECRET`) → đánh dấu paid → cấp `entitlements` (scope theo `products.entitlement_scope`), cộng credits (`adjust_credits` RPC), tạo subscription nếu kind=subscription, hoa hồng affiliate, notification, activity log.

## Sinh nội dung
- `generation_jobs.stages` jsonb; client gọi `advanceGenerationAction(jobId)` lặp lại, mỗi lần xử lý 1 stage (an toàn serverless). Retry: `retryGenerationAction`.
- Asset: `business_assets(category,key,content jsonb)` + `business_asset_versions` (lịch sử). Ghi qua `upsertAsset()` trong `src/lib/ai/persist.ts`.
