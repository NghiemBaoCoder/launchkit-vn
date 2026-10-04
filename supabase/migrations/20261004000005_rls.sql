-- =====================================================================
-- Row Level Security — database tự bảo vệ quyền sở hữu
-- =====================================================================

-- Bảo vệ cột nhạy cảm trên profiles khỏi người dùng thường
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    if not public.is_admin() then
      new.role := old.role;
      new.status := old.status;
      new.credits := old.credits;
      new.referral_code := old.referral_code;
      new.referred_by := old.referred_by;
      new.suspended_at := old.suspended_at;
      new.suspended_reason := old.suspended_reason;
      new.email := old.email;
    elsif new.role is distinct from old.role and not public.is_super_admin() then
      raise exception 'Chỉ super admin mới được đổi vai trò' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns before update on public.profiles for each row execute function public.protect_profile_columns();

-- ---------- enable RLS ----------
alter table public.profiles enable row level security;
alter table public.business_types enable row level security;
alter table public.industries enable row level security;
alter table public.templates enable row level security;
alter table public.app_settings enable row level security;
alter table public.businesses enable row level security;
alter table public.business_answers enable row level security;
alter table public.business_assets enable row level security;
alter table public.business_asset_versions enable row level security;
alter table public.services enable row level security;
alter table public.pricing_packages enable row level security;
alter table public.content_items enable row level security;
alter table public.marketing_plan_items enable row level security;
alter table public.website_sites enable row level security;
alter table public.finance_calculations enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.documents enable row level security;
alter table public.exports enable row level security;
alter table public.downloads enable row level security;
alter table public.shares enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.analytics_events enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.affiliates enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.referral_signups enable row level security;
alter table public.commissions enable row level security;

-- ---------- profiles ----------
create policy "profiles: xem của mình hoặc admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: sửa của mình hoặc admin" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- ---------- catalog ----------
create policy "business_types: public đọc active" on public.business_types for select to anon, authenticated using (active or public.is_admin());
create policy "business_types: admin ghi" on public.business_types for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "industries: public đọc active" on public.industries for select to anon, authenticated using (active or public.is_admin());
create policy "industries: admin ghi" on public.industries for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "templates: admin đọc" on public.templates for select to authenticated using (public.is_admin());
create policy "templates: admin ghi" on public.templates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "app_settings: đọc public hoặc admin" on public.app_settings for select to anon, authenticated using (is_public or public.is_admin());
create policy "app_settings: super admin ghi" on public.app_settings for insert to authenticated with check (public.is_super_admin() or (public.is_admin() and key = 'ai'));
create policy "app_settings: super admin sửa" on public.app_settings for update to authenticated using (public.is_super_admin() or (public.is_admin() and key = 'ai')) with check (public.is_super_admin() or (public.is_admin() and key = 'ai'));
create policy "products: public đọc active" on public.products for select to anon, authenticated using (active or public.is_admin());
create policy "products: admin ghi" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- businesses ----------
create policy "businesses: chủ sở hữu hoặc admin xem" on public.businesses for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "businesses: tạo của mình" on public.businesses for insert to authenticated with check (user_id = auth.uid());
create policy "businesses: chủ sở hữu hoặc admin sửa" on public.businesses for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "businesses: chủ sở hữu xoá" on public.businesses for delete to authenticated using (user_id = auth.uid());

-- Macro: các bảng thuộc business
do $$
declare t text;
begin
  foreach t in array array['business_answers','business_assets','business_asset_versions','services','pricing_packages','content_items','marketing_plan_items','website_sites','finance_calculations','checklists','checklist_items','documents','shares']
  loop
    execute format('create policy "%1$s: chủ sở hữu toàn quyền" on public.%1$s for all to authenticated using (public.owns_business(business_id)) with check (public.owns_business(business_id));', t);
    execute format('create policy "%1$s: admin xem" on public.%1$s for select to authenticated using (public.is_admin());', t);
  end loop;
end $$;

-- ---------- exports / downloads ----------
create policy "exports: xem của mình hoặc admin" on public.exports for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "exports: tạo của mình" on public.exports for insert to authenticated with check (user_id = auth.uid() and public.owns_business(business_id));
create policy "exports: xoá của mình" on public.exports for delete to authenticated using (user_id = auth.uid());
create policy "downloads: xem của mình hoặc admin" on public.downloads for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "downloads: tạo của mình" on public.downloads for insert to authenticated with check (user_id = auth.uid());

-- ---------- generation jobs ----------
create policy "generation_jobs: xem của mình hoặc admin" on public.generation_jobs for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "generation_jobs: tạo của mình" on public.generation_jobs for insert to authenticated with check (user_id = auth.uid() and public.owns_business(business_id));

-- ---------- notifications ----------
create policy "notifications: xem của mình" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications: sửa của mình" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: xoá của mình" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- ---------- logs ----------
create policy "activity_logs: xem của mình hoặc admin" on public.activity_logs for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "activity_logs: tạo của mình" on public.activity_logs for insert to authenticated with check (user_id = auth.uid());
create policy "audit_logs: admin xem" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "audit_logs: admin ghi" on public.audit_logs for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());
create policy "analytics_events: ai cũng ghi được" on public.analytics_events for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy "analytics_events: admin xem" on public.analytics_events for select to authenticated using (public.is_admin());

-- ---------- commerce ----------
create policy "coupons: admin toàn quyền" on public.coupons for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders: xem của mình hoặc admin" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "orders: admin sửa" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "order_items: xem theo đơn" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "coupon_redemptions: xem của mình hoặc admin" on public.coupon_redemptions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "payments: xem của mình hoặc admin" on public.payments for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "entitlements: xem của mình hoặc admin" on public.entitlements for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "entitlements: admin ghi" on public.entitlements for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "subscriptions: xem của mình hoặc admin" on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "credit_transactions: xem của mình hoặc admin" on public.credit_transactions for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---------- affiliates ----------
create policy "affiliates: xem của mình hoặc admin" on public.affiliates for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "affiliates: admin sửa" on public.affiliates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "referral_clicks: xem của mình hoặc admin" on public.referral_clicks for select to authenticated using (public.is_admin() or exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "referral_signups: xem của mình hoặc admin" on public.referral_signups for select to authenticated using (public.is_admin() or exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "commissions: xem của mình hoặc admin" on public.commissions for select to authenticated using (public.is_admin() or exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "commissions: admin sửa" on public.commissions for update to authenticated using (public.is_admin()) with check (public.is_admin());
