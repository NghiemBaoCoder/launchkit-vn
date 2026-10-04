-- =====================================================================
-- Functions & triggers
-- =====================================================================

-- ---------- Role helpers (security definer => không bị RLS đệ quy) ----------
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'super_admin') and status = 'active' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' and status = 'active' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.owns_business(bid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.businesses b where b.id = bid and b.user_id = auth.uid());
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, anon, service_role;
grant execute on function public.is_super_admin() to authenticated, anon, service_role;
grant execute on function public.owns_business(uuid) to authenticated, service_role;

-- ---------- Referral code ----------
create or replace function public.generate_referral_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where referral_code = code);
  end loop;
  return code;
end;
$$;

-- ---------- Tạo profile khi có user mới ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  free_credits int := coalesce((select (value->>'free_credits')::int from public.app_settings where key = 'site'), 3);
  ref_code text := nullif(new.raw_user_meta_data->>'referral_code', '');
  referrer uuid;
  affiliate_row public.affiliates;
  new_code text := public.generate_referral_code();
  auto_approve boolean := coalesce((select (value->>'affiliate_auto_approve')::boolean from public.app_settings where key = 'site'), true);
begin
  if ref_code is not null then
    select p.id into referrer from public.profiles p where upper(p.referral_code) = upper(ref_code) limit 1;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, referral_code, referred_by, credits)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new_code,
    referrer,
    free_credits
  );

  insert into public.credit_transactions (user_id, amount, balance_after, reason, ref_type)
  values (new.id, free_credits, free_credits, 'Tặng credits khi đăng ký', 'signup');

  -- Mỗi user là một affiliate tiềm năng
  insert into public.affiliates (user_id, code, status)
  values (new.id, new_code, case when auto_approve then 'approved' else 'pending' end)
  returning * into affiliate_row;

  if referrer is not null then
    insert into public.referral_signups (affiliate_id, referred_user_id)
    select a.id, new.id from public.affiliates a where a.user_id = referrer
    on conflict do nothing;
  end if;

  -- Đồng bộ role vào JWT claims
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'user', 'status', 'active')
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cập nhật email trong profile khi auth.users đổi email
create or replace function public.handle_user_email_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();

-- ---------- Đồng bộ role/status vào JWT app_metadata ----------
create or replace function public.sync_profile_claims()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE' and (new.role is distinct from old.role or new.status is distinct from old.status)) then
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role::text, 'status', new.status::text)
    where id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_sync_claims on public.profiles;
create trigger profiles_sync_claims
  after update on public.profiles
  for each row execute function public.sync_profile_claims();

-- ---------- Order number ----------
create or replace function public.next_order_number()
returns text language sql as $$
  select 'LK' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

-- ---------- Credits (atomic) ----------
create or replace function public.adjust_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_ref_type text default null,
  p_ref_id text default null,
  p_actor uuid default null
)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  new_balance integer;
begin
  -- Chỉ service role (server) hoặc admin được gọi
  if auth.role() = 'authenticated' and not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  update public.profiles
  set credits = credits + p_amount
  where id = p_user_id
  returning credits into new_balance;

  if new_balance is null then
    raise exception 'user not found';
  end if;
  if new_balance < 0 then
    raise exception 'insufficient credits' using errcode = 'P0001';
  end if;

  insert into public.credit_transactions (user_id, amount, balance_after, reason, ref_type, ref_id, created_by)
  values (p_user_id, p_amount, new_balance, p_reason, p_ref_type, p_ref_id, coalesce(p_actor, auth.uid()));

  return new_balance;
end;
$$;
grant execute on function public.adjust_credits(uuid, integer, text, text, text, uuid) to authenticated, service_role;

-- ---------- Public share (không mở RLS cho bảng) ----------
create or replace function public.get_shared_kit(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  s public.shares;
  b public.businesses;
  result jsonb;
begin
  select * into s from public.shares where token = p_token and active = true limit 1;
  if s.id is null then return null; end if;
  if s.expires_at is not null and s.expires_at < now() then return null; end if;
  select * into b from public.businesses where id = s.business_id and status <> 'archived';
  if b.id is null then return null; end if;

  select jsonb_build_object(
    'business', jsonb_build_object('id', b.id, 'name', b.name, 'slug', b.slug, 'logo_url', b.logo_url, 'location', b.location,
      'business_type', (select name from public.business_types where id = b.business_type_id),
      'industry', (select name from public.industries where id = b.industry_id)),
    'sections', to_jsonb(s.sections),
    'assets', coalesce((
      select jsonb_agg(jsonb_build_object('category', a.category, 'key', a.key, 'title', a.title, 'content', a.content) order by a.category, a.key)
      from public.business_assets a
      where a.business_id = b.id and a.category::text = any(s.sections)
    ), '[]'::jsonb),
    'services', case when 'services' = any(s.sections) then coalesce((
      select jsonb_agg(jsonb_build_object('name', sv.name, 'description', sv.description, 'price', sv.price, 'sale_price', sv.sale_price, 'unit', sv.unit, 'features', sv.features) order by sv.sort_order)
      from public.services sv where sv.business_id = b.id and sv.active
    ), '[]'::jsonb) else '[]'::jsonb end,
    'packages', case when 'pricing' = any(s.sections) then coalesce((
      select jsonb_agg(jsonb_build_object('name', p.name, 'tier', p.tier, 'price', p.price, 'billing_unit', p.billing_unit, 'features', p.features, 'recommended', p.recommended, 'description', p.description) order by p.sort_order)
      from public.pricing_packages p where p.business_id = b.id
    ), '[]'::jsonb) else '[]'::jsonb end
  ) into result;
  return result;
end;
$$;
grant execute on function public.get_shared_kit(text) to anon, authenticated, service_role;

create or replace function public.increment_share_view(p_token text)
returns void language sql security definer set search_path = public as $$
  update public.shares set view_count = view_count + 1 where token = p_token and active = true;
$$;
grant execute on function public.increment_share_view(text) to anon, authenticated, service_role;

-- ---------- Public website ----------
create or replace function public.get_public_site(p_slug text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'business', jsonb_build_object('id', b.id, 'name', b.name, 'logo_url', b.logo_url, 'location', b.location),
    'site', jsonb_build_object('slug', w.slug, 'sections', w.sections, 'theme', w.theme, 'contact', w.contact, 'published_at', w.published_at)
  )
  from public.website_sites w
  join public.businesses b on b.id = w.business_id
  where w.slug = p_slug and w.is_published = true and b.status <> 'archived'
  limit 1;
$$;
grant execute on function public.get_public_site(text) to anon, authenticated, service_role;

-- ---------- Phiên đăng nhập của chính mình ----------
create or replace function public.get_my_sessions()
returns table (id uuid, created_at timestamptz, updated_at timestamptz, user_agent text, ip text, is_current boolean)
language sql stable security definer set search_path = public as $$
  select s.id, s.created_at, s.updated_at, s.user_agent, s.ip::text,
         (s.id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'session_id', '')) as is_current
  from auth.sessions s
  where s.user_id = auth.uid()
  order by s.updated_at desc nulls last;
$$;
grant execute on function public.get_my_sessions() to authenticated;

-- ---------- Tìm kiếm toàn cục (RLS vẫn áp dụng vì security invoker) ----------
create or replace function public.global_search(q text, lim int default 8)
returns table (kind text, id uuid, business_id uuid, title text, subtitle text, href text)
language sql stable security invoker set search_path = public as $$
  (
    select 'business'::text, b.id, b.id, b.name, coalesce(i.name, bt.name, ''), '/business/' || b.id || '/overview'
    from public.businesses b
    left join public.industries i on i.id = b.industry_id
    left join public.business_types bt on bt.id = b.business_type_id
    where b.user_id = auth.uid() and b.status <> 'archived' and b.name ilike '%' || q || '%'
    order by b.updated_at desc limit lim
  )
  union all
  (
    select 'document'::text, d.id, d.business_id, d.title, b.name, '/business/' || d.business_id || '/documents?doc=' || d.id
    from public.documents d join public.businesses b on b.id = d.business_id
    where b.user_id = auth.uid() and d.title ilike '%' || q || '%'
    order by d.updated_at desc limit lim
  )
  union all
  (
    select 'content'::text, c.id, c.business_id, c.title, b.name || ' · ' || c.platform::text, '/business/' || c.business_id || '/content?item=' || c.id
    from public.content_items c join public.businesses b on b.id = c.business_id
    where b.user_id = auth.uid() and (c.title ilike '%' || q || '%' or c.hook ilike '%' || q || '%')
    order by c.updated_at desc limit lim
  )
  union all
  (
    select 'asset'::text, a.id, a.business_id, a.title, b.name || ' · ' || a.category::text, '/business/' || a.business_id || '/' || a.category::text
    from public.business_assets a join public.businesses b on b.id = a.business_id
    where b.user_id = auth.uid() and (a.title ilike '%' || q || '%' or a.content::text ilike '%' || q || '%')
    order by a.updated_at desc limit lim
  );
$$;
grant execute on function public.global_search(text, int) to authenticated;

-- ---------- Admin: thống kê ----------
create or replace function public.admin_dashboard_stats(p_days int default 30)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := now() - make_interval(days => p_days);
  prev_since timestamptz := now() - make_interval(days => p_days * 2);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'revenue', coalesce((select sum(total) from public.orders where status = 'paid' and paid_at >= since), 0),
    'revenue_prev', coalesce((select sum(total) from public.orders where status = 'paid' and paid_at >= prev_since and paid_at < since), 0),
    'orders', (select count(*) from public.orders where created_at >= since),
    'orders_prev', (select count(*) from public.orders where created_at >= prev_since and created_at < since),
    'paid_orders', (select count(*) from public.orders where status = 'paid' and paid_at >= since),
    'users', (select count(*) from public.profiles),
    'new_users', (select count(*) from public.profiles where created_at >= since),
    'new_users_prev', (select count(*) from public.profiles where created_at >= prev_since and created_at < since),
    'businesses', (select count(*) from public.businesses where status <> 'archived'),
    'new_businesses', (select count(*) from public.businesses where created_at >= since),
    'generations', (select count(*) from public.generation_jobs where created_at >= since),
    'generation_credits', coalesce((select sum(credits_used) from public.generation_jobs where created_at >= since), 0),
    'generation_failed', (select count(*) from public.generation_jobs where status = 'failed' and created_at >= since),
    'aov', coalesce((select avg(total) from public.orders where status = 'paid' and paid_at >= since), 0),
    'conversion', case when (select count(*) from public.profiles where created_at >= since) > 0
      then (select count(distinct user_id) from public.orders where status = 'paid' and paid_at >= since)::numeric / (select count(*) from public.profiles where created_at >= since)::numeric
      else 0 end,
    'top_industries', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'count', cnt) order by cnt desc)
      from (select coalesce(i.name, 'Khác') as name, count(*) as cnt from public.businesses b left join public.industries i on i.id = b.industry_id where b.status <> 'archived' group by 1 order by 2 desc limit 6) t
    ), '[]'::jsonb),
    'top_products', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'count', cnt, 'revenue', rev) order by rev desc)
      from (select p.name, count(*) as cnt, sum(o.total) as rev from public.orders o join public.products p on p.id = o.product_id where o.status = 'paid' group by p.name order by 3 desc limit 6) t
    ), '[]'::jsonb),
    'revenue_series', coalesce((
      select jsonb_agg(jsonb_build_object('date', d::date, 'revenue', coalesce(r.rev, 0), 'orders', coalesce(r.cnt, 0)) order by d)
      from generate_series((now() - make_interval(days => p_days - 1))::date, now()::date, interval '1 day') d
      left join (select paid_at::date as day, sum(total) as rev, count(*) as cnt from public.orders where status = 'paid' and paid_at >= since group by 1) r on r.day = d::date
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;
grant execute on function public.admin_dashboard_stats(int) to authenticated, service_role;

create or replace function public.admin_funnel(p_days int default 30)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := now() - make_interval(days => p_days);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'landing', (select count(distinct coalesce(user_id::text, anon_id)) from public.analytics_events where event = 'landing_view' and created_at >= since),
    'generator_start', (select count(distinct coalesce(user_id::text, anon_id)) from public.analytics_events where event = 'generator_start' and created_at >= since),
    'generator_complete', (select count(distinct coalesce(user_id::text, anon_id)) from public.analytics_events where event = 'generator_complete' and created_at >= since),
    'signup', (select count(*) from public.profiles where created_at >= since),
    'preview', (select count(distinct user_id) from public.analytics_events where event = 'workspace_preview' and created_at >= since),
    'checkout', (select count(distinct user_id) from public.orders where created_at >= since),
    'purchase', (select count(distinct user_id) from public.orders where status = 'paid' and paid_at >= since),
    'top_sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'count', cnt) order by cnt desc)
      from (select coalesce(nullif(source, ''), 'direct') as source, count(*) as cnt from public.analytics_events where event = 'landing_view' and created_at >= since group by 1 order by 2 desc limit 6) t
    ), '[]'::jsonb),
    'repeat_customers', (select count(*) from (select user_id from public.orders where status = 'paid' group by user_id having count(*) > 1) t),
    'kit_conversion', case when (select count(*) from public.businesses where created_at >= since) > 0
      then (select count(distinct business_id) from public.orders where status = 'paid' and business_id is not null and paid_at >= since)::numeric / (select count(*) from public.businesses where created_at >= since)::numeric
      else 0 end
  ) into result;
  return result;
end;
$$;
grant execute on function public.admin_funnel(int) to authenticated, service_role;

-- Đánh dấu đơn hết hạn (gọi từ server)
create or replace function public.expire_stale_orders()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.orders set status = 'expired' where status = 'pending' and expires_at < now();
  get diagnostics n = row_count;
  return n;
end;
$$;
grant execute on function public.expire_stale_orders() to service_role;
