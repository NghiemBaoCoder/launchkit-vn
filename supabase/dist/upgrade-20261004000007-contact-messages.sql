-- =====================================================================
-- Hộp thư liên hệ (/contact) — lưu tin nhắn của khách & admin xử lý trong /admin/messages
-- =====================================================================
create type public.contact_status as enum ('new', 'read', 'replied', 'archived');

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  topic text not null default 'support',
  message text not null,
  status public.contact_status not null default 'new',
  admin_note text,
  handled_by uuid references public.profiles(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);
create index contact_messages_email_idx on public.contact_messages (email);
create index contact_messages_user_idx on public.contact_messages (user_id, created_at desc);
create trigger contact_messages_set_updated_at before update on public.contact_messages for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;
-- Ghi: chỉ qua service role (server action) để khách chưa đăng nhập cũng gửi được mà không mở insert cho anon.
create policy "contact_messages: admin xem" on public.contact_messages for select to authenticated using (public.is_admin() or user_id = auth.uid());
create policy "contact_messages: admin sửa" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "contact_messages: admin xoá" on public.contact_messages for delete to authenticated using (public.is_admin());
