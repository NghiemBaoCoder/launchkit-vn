# LaunchKit VN

Nền tảng SaaS tạo **Business Kit** hoàn chỉnh bằng tiếng Việt cho freelancer, creator, salon, shop online, agency, F&B nhỏ, coach và dịch vụ tại nhà: thương hiệu, dịch vụ, bảng giá, kịch bản bán hàng, kế hoạch marketing 30 ngày, 30 nội dung đa nền tảng, Website Kit, tài chính, vận hành và 6 mẫu tài liệu — kèm paywall, checkout (mock payment), export PDF/CSV/MD/TXT/ZIP, affiliate và khu quản trị.

## Stack

- **Next.js 16** (App Router, Turbopack, `proxy.ts`), React 19, TypeScript strict
- **Tailwind CSS v4** + bộ UI riêng (shadcn-style, `radix-ui`), lucide-react, sonner, recharts, dnd-kit
- **Supabase**: Auth, Postgres (RLS trên mọi bảng), Storage (avatars, logos, exports, assets)
- **Mock AI** (`MockAIProvider`) sinh nội dung tiếng Việt thực tế, có thể bật `AnthropicProvider` qua env
- **MockPaymentProvider** + webhook ký HMAC; kiến trúc sẵn để nối VNPay/MoMo
- Vitest (unit + RLS), Playwright (hành trình khách hàng & admin)

## Chạy local

Yêu cầu: Node 20.9+, pnpm 10, Docker (cho Supabase local), Supabase CLI (`npm i -g supabase`).

```bash
pnpm install
cp .env.example .env.local            # điền khoá sau khi supabase start
pnpm db:start                         # khởi động Supabase local (in ra anon/service key)
pnpm db:reset                         # áp dụng migrations + seed catalog/products/coupons
pnpm seed:users                       # admin@launchkit.vn / Admin@12345, staff@…, demo@…
pnpm dev                              # http://localhost:3000
```

`.env.local` tối thiểu:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key từ supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
MOCK_PAYMENT_WEBHOOK_SECRET=<chuỗi ngẫu nhiên>
AI_PROVIDER=mock
```

Mã giảm giá demo: `DEMO50` (−50%), `LAUNCH100K` (−100.000đ), `FREEKIT` (−100%, dùng để kiểm thử).

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm typecheck` | `next typegen` + `tsc --noEmit` |
| `pnpm lint` | ESLint (flat config) |
| `pnpm test` | Unit tests (pricing, access policy, generator, export outline, utils) |
| `pnpm test:rls` | Kiểm thử RLS thật trên Supabase local (cô lập dữ liệu giữa user, chặn leo quyền) |
| `pnpm test:e2e` | Playwright: hành trình khách hàng & admin (cần dev server + Supabase local) |
| `pnpm db:reset` / `pnpm db:types` | Reset DB theo migrations+seed / sinh lại `src/types/database.ts` |
| `pnpm seed:users` | Tạo tài khoản mẫu (super admin, admin, user) |

Chromium cho Playwright: `PW_CHROMIUM_PATH=/path/to/chrome pnpm test:e2e` nếu không muốn `npx playwright install`.

## Hiệu năng & trang public

- Toàn bộ nhóm `(site)` (trang chủ, ví dụ, bảng giá, landing theo loại hình, FAQ, pháp lý, liên hệ) được **prerender / ISR** (`revalidate` 10–60 phút): dữ liệu catalog & cài đặt site đọc qua `createPublicClient()` (anon, không cookie) nên không có truy vấn nào chạy trên mỗi request. Admin đổi sản phẩm/loại hình/cài đặt → `revalidatePath("/", "layout")` làm mới ngay.
- Trạng thái đăng nhập của header và chế độ bảo trì (bypass cho admin) được xác định ở trình duyệt từ phiên Supabase, giữ layout public tĩnh.
- `getCurrentUser()` dùng `getClaims()` (xác thực JWT cục bộ) thay cho `getUser()` gọi mạng; `vercel.json` ghim region `sin1` — đổi cho khớp region Supabase của bạn (`hnd1` Tokyo, `iad1` US East…).
- Ảnh OG/Twitter sinh động bằng `next/og` (`src/app/opengraph-image.tsx`, `/business-kit/[slug]`, `/examples/[slug]`), `icon.svg`, `apple-icon`, `manifest`, `sitemap.xml`, `robots.txt`.

## Giao diện & chuyển động

- `src/components/motion/*`: `Reveal`/`Stagger` (hiện khi cuộn), `AnimatedNumber`, `TiltCard`, `RotatingWords`, `Marquee` — dựa trên `motion` (LazyMotion, gói `domAnimation`), tôn trọng `prefers-reduced-motion`.
- Hình ảnh thuần SVG/UI: `HeroVisual` (workspace đang tạo kit, parallax), `KitCover` (ảnh bìa sinh theo bảng màu + seed), `BrowserFrame`/`PhoneFrame` (mockup thiết bị), bộ `illustrations.tsx` cho how-it-works, auth, 404/403/500/offline.
- Mobile: thanh tab đáy trong app (`MobileTabBar`, chừa safe-area), vùng chạm ≥ 44px trên thiết bị cảm ứng, cột đầu của bảng dính trái khi cuộn ngang, tiêu đề hero co giãn theo `clamp()`.

## Deploy lên Vercel + Supabase cloud

1. Tạo project Supabase, chạy migrations: `supabase link --project-ref <ref> && supabase db push`, rồi chạy `supabase/seed.sql` (SQL editor) và `pnpm seed:users` với env trỏ tới cloud. Không dùng CLI? Dán `supabase/dist/full-schema.sql` vào SQL Editor. **Đã cài bản cũ** → chạy thêm `supabase/dist/upgrade-20261004000007-contact-messages.sql` (hộp thư liên hệ `/admin/messages`).
2. Supabase Auth → URL Configuration: Site URL = domain Vercel; Redirect URLs thêm `https://<domain>/auth/callback` và `https://<domain>/**`. Bật xác thực email nếu muốn (`/verify-email` đã sẵn sàng). Google OAuth: bật provider và đặt `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true`.
3. Vercel → Environment Variables: như `.env.local` (đổi URL/keys, `NEXT_PUBLIC_APP_URL=https://<domain>`).
4. `pnpm build` chạy sạch; không cần cấu hình thêm (Turbopack mặc định).

## Kiến trúc

Xem `docs/ARCHITECTURE.md` (quy ước server actions, phân quyền, thanh toán, sinh nội dung).

- `src/lib/access/policy.ts` — ma trận quyền tập trung (entitlement → feature), `can(ctx, feature)`
- `src/lib/ai/` — provider + job runner (mỗi request xử lý 1 stage, an toàn serverless, retry được)
- `src/lib/payments/` — pricing thuần (unit test), provider mock, `fulfill.ts` cấp entitlement/credits/commission
- `src/lib/export/` — outline → PDF (@react-pdf, font Be Vietnam Pro) / MD / TXT / CSV / ZIP → Supabase Storage
- `supabase/migrations/` — schema, RLS, functions (`get_shared_kit`, `global_search`, `admin_*`), storage policies

## Vai trò & quyền

`user` → `admin` → `super_admin` (lưu ở `profiles.role`, đồng bộ vào JWT bằng trigger). `/admin/*` bị chặn ở `proxy.ts` và kiểm tra lại trên DB trong layout/actions; RLS từ chối mọi truy vấn admin từ user thường (có test).

## Deploy tự động bằng script

`scripts/deploy.sh` thực hiện toàn bộ: link Supabase → push migrations → seed → tạo user mẫu → set env Vercel → deploy production. Đặt các biến môi trường được liệt kê ở đầu script (không dán vào chat/commit), rồi chạy:

```bash
pnpm install && ./scripts/deploy.sh
```

Không dùng CLI? Dán `supabase/dist/full-schema.sql` vào Supabase SQL Editor, import repo vào Vercel và đặt env như `.env.example`.
