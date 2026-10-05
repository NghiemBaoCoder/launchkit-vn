-- LaunchKit VN — schema + seed gộp để dán vào Supabase SQL Editor (hoặc dùng: supabase db push && seed)
-- Sinh từ supabase/migrations/*.sql + supabase/seed.sql

-- ===== supabase/migrations/20261004000001_init_types.sql =====
-- =====================================================================
-- LaunchKit VN — Extensions & enum types
-- =====================================================================
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create type public.user_role as enum ('user', 'admin', 'super_admin');
create type public.user_status as enum ('active', 'suspended');
create type public.business_status as enum ('draft', 'generating', 'ready', 'archived');
create type public.asset_category as enum ('brand', 'services', 'pricing', 'sales', 'marketing', 'content', 'website', 'finance', 'operations', 'documents');
create type public.content_platform as enum ('facebook', 'tiktok', 'instagram', 'threads');
create type public.content_status as enum ('idea', 'draft', 'ready', 'published');
create type public.checklist_kind as enum ('launch', 'daily', 'weekly', 'customer_workflow', 'sales_workflow', 'delivery_workflow');
create type public.document_type as enum ('quotation', 'proposal', 'service_agreement', 'client_brief', 'invoice', 'intake_form');
create type public.export_format as enum ('pdf', 'csv', 'txt', 'md', 'zip');
create type public.export_status as enum ('pending', 'processing', 'ready', 'failed');
create type public.job_status as enum ('pending', 'processing', 'completed', 'failed');
create type public.product_kind as enum ('free', 'one_time', 'subscription');
create type public.order_status as enum ('pending', 'paid', 'failed', 'expired', 'refunded');
create type public.payment_status as enum ('pending', 'processing', 'succeeded', 'failed', 'refunded');
create type public.coupon_type as enum ('fixed', 'percentage');
create type public.subscription_status as enum ('active', 'canceled', 'expired', 'past_due');
create type public.affiliate_status as enum ('pending', 'approved', 'rejected', 'paid');
create type public.commission_status as enum ('pending', 'approved', 'paid', 'rejected');
create type public.pricing_tier as enum ('basic', 'standard', 'premium', 'custom');
create type public.finance_calc_type as enum ('startup_cost', 'monthly_expenses', 'revenue_target', 'profit', 'break_even');
create type public.template_category as enum ('brand', 'pricing', 'sales', 'marketing', 'content', 'website', 'operations', 'documents');

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== supabase/migrations/20261004000002_core_tables.sql =====
-- =====================================================================
-- Core tables: profiles, catalog, businesses & workspace data
-- =====================================================================

-- ---------- Profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  credits integer not null default 0 check (credits >= 0),
  referral_code text not null unique,
  referred_by uuid references public.profiles(id) on delete set null,
  notification_prefs jsonb not null default '{"email_marketing": true, "product_updates": true, "payment_updates": true, "generation_updates": true}'::jsonb,
  onboarding_draft jsonb,
  last_seen_at timestamptz,
  suspended_at timestamptz,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- ---------- Catalog ----------
create table public.business_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  tagline text,
  hero_title text,
  hero_description text,
  highlights jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger business_types_set_updated_at before update on public.business_types for each row execute function public.set_updated_at();

create table public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  business_type_id uuid references public.business_types(id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index industries_business_type_idx on public.industries (business_type_id);
create trigger industries_set_updated_at before update on public.industries for each row execute function public.set_updated_at();

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.template_category not null,
  business_type_id uuid references public.business_types(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger templates_set_updated_at before update on public.templates for each row execute function public.set_updated_at();

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------- Businesses ----------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  business_type_id uuid references public.business_types(id) on delete set null,
  industry_id uuid references public.industries(id) on delete set null,
  status public.business_status not null default 'draft',
  logo_url text,
  currency text not null default 'VND',
  location text,
  contact jsonb not null default '{}'::jsonb,
  onboarding_step integer not null default 0,
  onboarding_completed boolean not null default false,
  generated_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_user_idx on public.businesses (user_id);
create index businesses_status_idx on public.businesses (status);
create index businesses_name_trgm_idx on public.businesses using gin (name gin_trgm_ops);
create trigger businesses_set_updated_at before update on public.businesses for each row execute function public.set_updated_at();

create table public.business_answers (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger business_answers_set_updated_at before update on public.business_answers for each row execute function public.set_updated_at();

create table public.business_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category public.asset_category not null,
  key text not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, category, key)
);
create index business_assets_business_idx on public.business_assets (business_id, category);
create index business_assets_title_trgm_idx on public.business_assets using gin (title gin_trgm_ops);
create trigger business_assets_set_updated_at before update on public.business_assets for each row execute function public.set_updated_at();

create table public.business_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.business_assets(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  version integer not null,
  content jsonb not null,
  source text not null default 'edit', -- edit | generate | regenerate | restore
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index business_asset_versions_asset_idx on public.business_asset_versions (asset_id, version desc);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(14,0) not null default 0,
  sale_price numeric(14,0),
  unit text default 'gói',
  delivery_time text,
  features text[] not null default '{}',
  benefits text[] not null default '{}',
  target_customer text,
  upsell text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_business_idx on public.services (business_id, sort_order);
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();

create table public.pricing_packages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tier public.pricing_tier not null default 'custom',
  name text not null,
  description text,
  price numeric(14,0) not null default 0,
  billing_unit text default 'gói',
  features jsonb not null default '[]'::jsonb,
  recommended boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pricing_packages_business_idx on public.pricing_packages (business_id, sort_order);
create trigger pricing_packages_set_updated_at before update on public.pricing_packages for each row execute function public.set_updated_at();

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  hook text,
  caption text,
  cta text,
  platform public.content_platform not null default 'facebook',
  content_type text not null default 'post',
  status public.content_status not null default 'idea',
  scheduled_date date,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_items_business_idx on public.content_items (business_id, scheduled_date);
create index content_items_title_trgm_idx on public.content_items using gin (title gin_trgm_ops);
create trigger content_items_set_updated_at before update on public.content_items for each row execute function public.set_updated_at();

create table public.marketing_plan_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_index integer not null check (day_index between 1 and 90),
  scheduled_date date,
  title text not null,
  description text,
  channel text,
  kind text not null default 'task', -- task | campaign | promotion | content
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index marketing_plan_items_business_idx on public.marketing_plan_items (business_id, day_index);
create trigger marketing_plan_items_set_updated_at before update on public.marketing_plan_items for each row execute function public.set_updated_at();

create table public.website_sites (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  slug text not null unique,
  sections jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger website_sites_set_updated_at before update on public.website_sites for each row execute function public.set_updated_at();

create table public.finance_calculations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.finance_calc_type not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, type)
);
create trigger finance_calculations_set_updated_at before update on public.finance_calculations for each row execute function public.set_updated_at();

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind public.checklist_kind not null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, kind)
);
create trigger checklists_set_updated_at before update on public.checklists for each row execute function public.set_updated_at();

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index checklist_items_checklist_idx on public.checklist_items (checklist_id, sort_order);
create trigger checklist_items_set_updated_at before update on public.checklist_items for each row execute function public.set_updated_at();

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.document_type not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index documents_business_idx on public.documents (business_id, type);
create index documents_title_trgm_idx on public.documents using gin (title gin_trgm_ops);
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();

create table public.exports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'full_kit', -- full_kit | section | document
  format public.export_format not null,
  status public.export_status not null default 'pending',
  title text not null,
  file_path text,
  file_size integer,
  items jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index exports_business_idx on public.exports (business_id, created_at desc);
create index exports_user_idx on public.exports (user_id, created_at desc);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  export_id uuid references public.exports(id) on delete set null,
  file_name text,
  created_at timestamptz not null default now()
);
create index downloads_user_idx on public.downloads (user_id, created_at desc);

create table public.shares (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  token text not null unique,
  sections text[] not null default '{}',
  active boolean not null default true,
  expires_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shares_business_idx on public.shares (business_id);
create trigger shares_set_updated_at before update on public.shares for each row execute function public.set_updated_at();

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'full', -- full | brand | services | ... (asset category)
  provider text not null default 'mock',
  model text,
  status public.job_status not null default 'pending',
  stages jsonb not null default '[]'::jsonb,
  current_stage text,
  credits_used integer not null default 0,
  error text,
  attempts integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index generation_jobs_business_idx on public.generation_jobs (business_id, created_at desc);
create index generation_jobs_user_idx on public.generation_jobs (user_id, created_at desc);
create index generation_jobs_status_idx on public.generation_jobs (status);
create trigger generation_jobs_set_updated_at before update on public.generation_jobs for each row execute function public.set_updated_at();

-- ---------- Notifications / activity / audit ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  business_id uuid references public.businesses(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id text,
  title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_logs_user_idx on public.activity_logs (user_id, created_at desc);
create index activity_logs_business_idx on public.activity_logs (business_id, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  anon_id text,
  event text not null,
  path text,
  source text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index analytics_events_event_idx on public.analytics_events (event, created_at desc);
create index analytics_events_created_idx on public.analytics_events (created_at desc);

-- ===== supabase/migrations/20261004000003_commerce.sql =====
-- =====================================================================
-- Commerce: products, coupons, orders, payments, entitlements, credits, affiliates
-- =====================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  kind public.product_kind not null default 'one_time',
  price numeric(14,0) not null default 0,
  sale_price numeric(14,0),
  currency text not null default 'VND',
  billing_interval text, -- month | year (subscription)
  features jsonb not null default '[]'::jsonb,
  entitlements text[] not null default '{}',
  entitlement_scope text not null default 'business', -- business | account
  credits integer not null default 0,
  active boolean not null default true,
  recommended boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  type public.coupon_type not null,
  value numeric(14,2) not null check (value >= 0),
  max_discount numeric(14,0),
  min_order numeric(14,0) not null default 0,
  usage_limit integer,
  per_user_limit integer not null default 1,
  used_count integer not null default 0,
  applicable_product_ids uuid[] not null default '{}',
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index coupons_code_idx on public.coupons (upper(code));
create trigger coupons_set_updated_at before update on public.coupons for each row execute function public.set_updated_at();

create sequence public.order_number_seq start 1000;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  product_id uuid not null references public.products(id),
  status public.order_status not null default 'pending',
  subtotal numeric(14,0) not null default 0,
  discount numeric(14,0) not null default 0,
  total numeric(14,0) not null default 0,
  currency text not null default 'VND',
  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text,
  payment_method text not null default 'mock',
  affiliate_id uuid,
  terms_accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_business_idx on public.orders (business_id);
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  unit_price numeric(14,0) not null default 0,
  quantity integer not null default 1,
  total numeric(14,0) not null default 0
);
create index order_items_order_idx on public.order_items (order_id);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index coupon_redemptions_user_idx on public.coupon_redemptions (coupon_id, user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'mock',
  provider_ref text,
  amount numeric(14,0) not null default 0,
  currency text not null default 'VND',
  status public.payment_status not null default 'pending',
  raw_event jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);
create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_provider_ref_idx on public.payments (provider, provider_ref);
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  key text not null,
  source text not null default 'purchase', -- purchase | admin | plan | free
  order_id uuid references public.orders(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index entitlements_unique_business_idx on public.entitlements (user_id, business_id, key) where business_id is not null;
create unique index entitlements_unique_account_idx on public.entitlements (user_id, key) where business_id is null;
create index entitlements_user_idx on public.entitlements (user_id);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id),
  order_id uuid references public.orders(id) on delete set null,
  status public.subscription_status not null default 'active',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  provider text not null default 'mock',
  provider_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id, created_at desc);
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  balance_after integer not null,
  reason text not null,
  ref_type text,
  ref_id text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index credit_transactions_user_idx on public.credit_transactions (user_id, created_at desc);

-- ---------- Affiliates ----------
create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  code text not null unique,
  status public.affiliate_status not null default 'approved',
  commission_rate numeric(5,2) not null default 10.00,
  clicks integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger affiliates_set_updated_at before update on public.affiliates for each row execute function public.set_updated_at();

create table public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  landing_path text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index referral_clicks_affiliate_idx on public.referral_clicks (affiliate_id, created_at desc);

create table public.referral_signups (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  amount numeric(14,0) not null default 0,
  rate numeric(5,2) not null default 10.00,
  status public.commission_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index commissions_affiliate_idx on public.commissions (affiliate_id, created_at desc);
create trigger commissions_set_updated_at before update on public.commissions for each row execute function public.set_updated_at();

alter table public.orders add constraint orders_affiliate_fk foreign key (affiliate_id) references public.affiliates(id) on delete set null;

-- ===== supabase/migrations/20261004000004_functions.sql =====
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
  values (new.id, new_code, (case when auto_approve then 'approved' else 'pending' end)::public.affiliate_status)
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

-- ===== supabase/migrations/20261004000005_rls.sql =====
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

-- ===== supabase/migrations/20261004000006_storage.sql =====
-- =====================================================================
-- Storage buckets & policies
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp','image/gif']),
  ('logos', 'logos', true, 2097152, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('exports', 'exports', false, 52428800, null),
  ('assets', 'assets', true, 10485760, array['image/png','image/jpeg','image/webp','image/svg+xml','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- avatars: thư mục đầu = user id
create policy "avatars public read" on storage.objects for select to anon, authenticated using (bucket_id = 'avatars');
create policy "avatars owner insert" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars owner update" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars owner delete" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- logos: thư mục đầu = user id
create policy "logos public read" on storage.objects for select to anon, authenticated using (bucket_id = 'logos');
create policy "logos owner insert" on storage.objects for insert to authenticated with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos owner update" on storage.objects for update to authenticated using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos owner delete" on storage.objects for delete to authenticated using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

-- exports: private, chỉ chủ sở hữu đọc; server (service role) ghi
create policy "exports owner read" on storage.objects for select to authenticated using (bucket_id = 'exports' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "exports owner delete" on storage.objects for delete to authenticated using (bucket_id = 'exports' and (storage.foldername(name))[1] = auth.uid()::text);

-- assets: admin quản lý, public đọc
create policy "assets public read" on storage.objects for select to anon, authenticated using (bucket_id = 'assets');
create policy "assets admin write" on storage.objects for insert to authenticated with check (bucket_id = 'assets' and public.is_admin());
create policy "assets admin update" on storage.objects for update to authenticated using (bucket_id = 'assets' and public.is_admin());
create policy "assets admin delete" on storage.objects for delete to authenticated using (bucket_id = 'assets' and public.is_admin());

-- ===== supabase/seed.sql =====
-- =====================================================================
-- Seed: catalog, products, settings, templates, coupons
-- (Người dùng mẫu được tạo bằng `pnpm seed:users`)
-- =====================================================================

insert into public.app_settings (key, value, is_public) values
('site', jsonb_build_object(
  'site_name', 'LaunchKit VN',
  'logo_url', null,
  'support_email', 'support@launchkit.vn',
  'default_currency', 'VND',
  'maintenance_mode', false,
  'registration_enabled', true,
  'referral_percentage', 10,
  'free_credits', 3,
  'purchase_credits', 20,
  'affiliate_auto_approve', true,
  'default_pricing', jsonb_build_object('business_kit', 299000, 'business_kit_pro', 599000, 'pro_membership', 199000)
), true),
('ai', jsonb_build_object(
  'provider', 'mock',
  'model', 'launchkit-mock-v1',
  'credits', jsonb_build_object('full', 1, 'section', 1, 'document', 1, 'content', 1),
  'free_limits', jsonb_build_object('max_businesses', 1, 'max_regenerations_per_day', 3),
  'timeout_ms', 60000,
  'stage_delay_ms', 600
), false)
on conflict (key) do update set value = excluded.value, is_public = excluded.is_public;

-- ---------- Business types ----------
insert into public.business_types (slug, name, description, icon, tagline, hero_title, hero_description, highlights, seo, sort_order) values
('freelancer', 'Freelancer', 'Làm việc tự do: thiết kế, lập trình, viết lách, marketing, dịch thuật…', 'Laptop', 'Biến kỹ năng thành dịch vụ có giá', 'Business Kit cho Freelancer', 'Định vị, bảng giá, kịch bản chốt deal và hợp đồng mẫu — để bạn nhận dự án tự tin và đúng giá.', '["Bảng giá 3 gói theo giờ/theo dự án", "Kịch bản tư vấn & xử lý từ chối", "Mẫu báo giá, hợp đồng, biên bản bàn giao", "Kế hoạch tìm khách 30 ngày"]', '{"title": "Business Kit cho Freelancer | LaunchKit VN", "description": "Tạo bộ khởi nghiệp hoàn chỉnh cho freelancer trong 10 phút: thương hiệu, bảng giá, kịch bản bán hàng, hợp đồng mẫu."}', 1),
('creator', 'Creator', 'Content creator, KOC/KOL, YouTuber, TikToker, podcaster', 'Clapperboard', 'Kiếm tiền bền vững từ cộng đồng', 'Business Kit cho Creator', 'Định vị kênh, gói hợp tác với nhãn hàng, media kit, lịch nội dung và kế hoạch kiếm tiền.', '["Media kit & bảng giá booking", "Lịch nội dung 30 ngày đa nền tảng", "Kịch bản pitch nhãn hàng", "Mẫu hợp đồng hợp tác"]', '{"title": "Business Kit cho Creator | LaunchKit VN"}', 2),
('salon', 'Salon & Spa', 'Tiệm tóc, nail, spa, mi, massage, chăm sóc da', 'Scissors', 'Kín lịch mỗi tuần', 'Business Kit cho Salon & Spa', 'Menu dịch vụ, combo, chương trình khách thân thiết, nội dung Facebook/TikTok và quy trình phục vụ chuẩn.', '["Menu dịch vụ & combo theo mùa", "Kịch bản tư vấn upsell", "Lịch nội dung TikTok/Facebook", "Checklist mở cửa – đóng cửa"]', '{"title": "Business Kit cho Salon & Spa | LaunchKit VN"}', 3),
('online-shop', 'Shop online', 'Bán hàng online trên Facebook, Shopee, TikTok Shop, Instagram', 'ShoppingBag', 'Bán nhiều hơn, chốt nhanh hơn', 'Business Kit cho Shop online', 'Định vị shop, chiến lược giá, kịch bản chốt đơn inbox, nội dung bán hàng và kế hoạch khuyến mãi.', '["Kịch bản inbox chốt đơn & chăm sóc", "Bảng giá & combo tối ưu lợi nhuận", "Lịch đăng 30 ngày", "Quy trình xử lý đơn và đổi trả"]', '{"title": "Business Kit cho Shop online | LaunchKit VN"}', 4),
('agency', 'Agency', 'Agency marketing, thiết kế, phát triển web, sản xuất nội dung', 'Building2', 'Chuyên nghiệp từ pitch đầu tiên', 'Business Kit cho Agency', 'Định vị dịch vụ, gói retainer, proposal mẫu, quy trình bán hàng B2B và kế hoạch marketing.', '["Gói dịch vụ retainer/dự án", "Proposal & hợp đồng dịch vụ", "Quy trình discovery – pitch – close", "Kế hoạch content B2B"]', '{"title": "Business Kit cho Agency | LaunchKit VN"}', 5),
('fnb', 'F&B nhỏ', 'Quán cà phê, trà sữa, quán ăn, bếp online, bánh handmade', 'Coffee', 'Mở quán có kế hoạch', 'Business Kit cho F&B nhỏ', 'Định vị quán, menu & giá vốn, kế hoạch khai trương, nội dung mạng xã hội và checklist vận hành hàng ngày.', '["Tính giá vốn & biên lợi nhuận", "Kế hoạch khai trương 30 ngày", "Checklist mở ca – đóng ca", "Nội dung TikTok/Facebook"]', '{"title": "Business Kit cho F&B nhỏ | LaunchKit VN"}', 6),
('coach', 'Coach & Giáo viên', 'Gia sư, coach, trung tâm nhỏ, khoá học online', 'GraduationCap', 'Lớp đầy, học viên quay lại', 'Business Kit cho Coach & Giáo viên', 'Chương trình học, gói học phí, kịch bản tư vấn phụ huynh/học viên, nội dung và quy trình chăm sóc.', '["Gói học phí & lộ trình", "Kịch bản tư vấn & xử lý từ chối", "Form tiếp nhận học viên", "Kế hoạch content chia sẻ kiến thức"]', '{"title": "Business Kit cho Coach & Giáo viên | LaunchKit VN"}', 7),
('local-service', 'Dịch vụ tại nhà', 'Sửa chữa, dọn dẹp, vận chuyển, chăm sóc thú cưng, điện lạnh', 'Wrench', 'Khách gọi là có mặt', 'Business Kit cho Dịch vụ tại nhà', 'Bảng giá minh bạch, kịch bản báo giá qua điện thoại, nội dung địa phương và quy trình phục vụ chuẩn.', '["Bảng giá minh bạch theo hạng mục", "Kịch bản báo giá qua Zalo/điện thoại", "Quy trình nhận – làm – bàn giao", "Nội dung marketing địa phương"]', '{"title": "Business Kit cho Dịch vụ tại nhà | LaunchKit VN"}', 8)
on conflict (slug) do nothing;

-- ---------- Industries ----------
with bt as (select id, slug from public.business_types)
insert into public.industries (slug, name, description, icon, business_type_id, sort_order)
select v.slug, v.name, v.description, v.icon, bt.id, v.sort_order
from (values
  ('website-development', 'Phát triển website', 'Thiết kế & lập trình website, landing page, web app', 'Code2', 'freelancer', 1),
  ('graphic-design', 'Thiết kế đồ hoạ', 'Logo, bộ nhận diện, ấn phẩm, social media design', 'Palette', 'freelancer', 2),
  ('copywriting', 'Viết nội dung', 'Copywriting, content marketing, SEO content, biên tập', 'PenTool', 'freelancer', 3),
  ('digital-marketing', 'Digital marketing', 'Chạy quảng cáo, SEO, social media, email marketing', 'Megaphone', 'freelancer', 4),
  ('video-editing', 'Dựng video', 'Edit video, motion graphics, TikTok/YouTube', 'Film', 'freelancer', 5),
  ('translation', 'Dịch thuật', 'Dịch tài liệu, phiên dịch, bản địa hoá', 'Languages', 'freelancer', 6),
  ('photography', 'Nhiếp ảnh', 'Chụp sản phẩm, sự kiện, chân dung, cưới', 'Camera', 'freelancer', 7),
  ('lifestyle-creator', 'Lifestyle & Vlog', 'Nội dung đời sống, du lịch, ăn uống', 'Sparkles', 'creator', 1),
  ('beauty-creator', 'Beauty & Fashion', 'Làm đẹp, thời trang, review mỹ phẩm', 'Sparkle', 'creator', 2),
  ('education-creator', 'Giáo dục & Kiến thức', 'Chia sẻ kiến thức, tài chính cá nhân, kỹ năng', 'BookOpen', 'creator', 3),
  ('tech-creator', 'Công nghệ & Review', 'Review thiết bị, phần mềm, AI', 'Cpu', 'creator', 4),
  ('food-creator', 'Ẩm thực', 'Nấu ăn, review quán, mukbang', 'UtensilsCrossed', 'creator', 5),
  ('hair-salon', 'Salon tóc', 'Cắt, uốn, nhuộm, phục hồi tóc', 'Scissors', 'salon', 1),
  ('nail-salon', 'Nail & Mi', 'Nail art, nối mi, uốn mi', 'Hand', 'salon', 2),
  ('spa-skincare', 'Spa & Chăm sóc da', 'Chăm sóc da, trị mụn, massage mặt', 'Flower2', 'salon', 3),
  ('massage-wellness', 'Massage & Wellness', 'Massage trị liệu, xông hơi, thư giãn', 'HeartPulse', 'salon', 4),
  ('fashion-shop', 'Thời trang', 'Quần áo, phụ kiện, giày dép', 'Shirt', 'online-shop', 1),
  ('cosmetics-shop', 'Mỹ phẩm', 'Mỹ phẩm, skincare, nước hoa', 'SprayCan', 'online-shop', 2),
  ('home-decor-shop', 'Đồ gia dụng & Decor', 'Đồ gia dụng, trang trí nhà cửa', 'Lamp', 'online-shop', 3),
  ('mom-baby-shop', 'Mẹ & Bé', 'Đồ dùng cho mẹ và bé', 'Baby', 'online-shop', 4),
  ('handmade-shop', 'Handmade & Quà tặng', 'Sản phẩm thủ công, quà tặng cá nhân hoá', 'Gift', 'online-shop', 5),
  ('food-shop', 'Thực phẩm & Đặc sản', 'Đặc sản vùng miền, thực phẩm sạch', 'Apple', 'online-shop', 6),
  ('marketing-agency', 'Marketing agency', 'Dịch vụ marketing trọn gói, performance, branding', 'Rocket', 'agency', 1),
  ('web-agency', 'Web & Software agency', 'Phát triển website, ứng dụng, phần mềm theo yêu cầu', 'Code2', 'agency', 2),
  ('design-studio', 'Design studio', 'Branding, packaging, UI/UX', 'PenTool', 'agency', 3),
  ('content-production', 'Sản xuất nội dung', 'Video, ảnh, content studio', 'Clapperboard', 'agency', 4),
  ('coffee-shop', 'Quán cà phê', 'Cà phê, trà, bánh', 'Coffee', 'fnb', 1),
  ('milk-tea', 'Trà sữa & Đồ uống', 'Trà sữa, nước ép, đồ uống take-away', 'CupSoda', 'fnb', 2),
  ('home-kitchen', 'Bếp online', 'Đồ ăn đặt trước, cơm văn phòng, bánh handmade', 'ChefHat', 'fnb', 3),
  ('restaurant-small', 'Quán ăn nhỏ', 'Quán ăn gia đình, ăn vặt, đặc sản', 'UtensilsCrossed', 'fnb', 4),
  ('english-tutor', 'Dạy tiếng Anh', 'Gia sư, lớp nhỏ, luyện IELTS/TOEIC', 'Languages', 'coach', 1),
  ('life-career-coach', 'Life & Career coach', 'Coaching cá nhân, sự nghiệp, kỹ năng', 'Compass', 'coach', 2),
  ('fitness-coach', 'Fitness & Yoga', 'PT cá nhân, yoga, dinh dưỡng', 'Dumbbell', 'coach', 3),
  ('music-art-class', 'Lớp nhạc & Mỹ thuật', 'Dạy đàn, vẽ, năng khiếu', 'Music', 'coach', 4),
  ('home-cleaning', 'Dọn dẹp nhà cửa', 'Vệ sinh nhà, văn phòng, sofa, máy lạnh', 'SprayCan', 'local-service', 1),
  ('repair-service', 'Sửa chữa & Điện lạnh', 'Sửa điện nước, máy lạnh, máy giặt', 'Wrench', 'local-service', 2),
  ('pet-care', 'Chăm sóc thú cưng', 'Spa thú cưng, trông giữ, dắt chó', 'PawPrint', 'local-service', 3),
  ('moving-delivery', 'Vận chuyển & Giao hàng', 'Chuyển nhà, giao hàng nội thành', 'Truck', 'local-service', 4)
) as v(slug, name, description, icon, bt_slug, sort_order)
join bt on bt.slug = v.bt_slug
on conflict (slug) do nothing;

-- ---------- Products ----------
insert into public.products (slug, name, description, kind, price, sale_price, billing_interval, features, entitlements, entitlement_scope, credits, active, recommended, sort_order) values
('free', 'Miễn phí', 'Trải nghiệm Business Kit với bản xem trước cơ bản.', 'free', 0, null, null,
  '["1 business", "Thương hiệu & dịch vụ cơ bản", "Bảng giá cơ bản", "3 credits tạo nội dung", "Máy tính tài chính cơ bản"]',
  '{}', 'account', 0, true, false, 0),
('business-kit', 'Business Kit', 'Bộ khởi nghiệp đầy đủ cho một business: thương hiệu, bảng giá, bán hàng, marketing, nội dung, vận hành, tài liệu.', 'one_time', 499000, 299000, null,
  '["Toàn bộ nội dung thương hiệu & định vị", "Bảng giá 3 gói + máy tính biên lợi nhuận", "Kịch bản bán hàng, xử lý từ chối, follow-up", "Kế hoạch marketing 30 ngày", "30 nội dung đa nền tảng", "Checklist vận hành & quy trình", "6 mẫu tài liệu (báo giá, hợp đồng, hoá đơn…)", "Xuất PDF/CSV/Markdown"]',
  '{brand_full,services_full,pricing_full,sales_full,marketing_full,content_30,operations_full,documents_full,exports_basic}', 'business', 10, true, true, 1),
('business-kit-pro', 'Business Kit Pro', 'Tất cả trong Business Kit cộng Website Kit, tạo lại nội dung không giới hạn và xuất bản cao cấp.', 'one_time', 899000, 599000, null,
  '["Mọi thứ trong Business Kit", "Website Kit: studio dựng website & trang public", "Tạo lại nội dung từng mục", "Xuất bản cao cấp (ZIP trọn bộ)", "+20 credits"]',
  '{brand_full,services_full,pricing_full,sales_full,marketing_full,content_30,operations_full,documents_full,exports_basic,website_kit,premium_exports,regeneration}', 'business', 20, true, false, 2),
('pro-membership', 'Pro Membership', 'Dành cho người làm nhiều dự án: không giới hạn business, credits hàng tháng, template cao cấp.', 'subscription', 199000, null, 'month',
  '["Nhiều business cùng lúc", "50 credits mỗi tháng", "Mở khoá toàn bộ kit cho mọi business", "Website Kit cho mọi business", "Template & generator cao cấp"]',
  '{multiple_businesses,regeneration,premium_templates,advanced_generators,premium_exports,brand_full,services_full,pricing_full,sales_full,marketing_full,content_30,operations_full,documents_full,exports_basic,website_kit}', 'account', 50, true, false, 3)
on conflict (slug) do update set name = excluded.name, description = excluded.description, price = excluded.price, sale_price = excluded.sale_price, features = excluded.features, entitlements = excluded.entitlements, credits = excluded.credits;

-- ---------- Coupons ----------
insert into public.coupons (code, description, type, value, max_discount, min_order, usage_limit, per_user_limit, active, applicable_product_ids) values
('DEMO50', 'Giảm 50% cho đơn đầu tiên (demo)', 'percentage', 50, 300000, 0, 1000, 1, true, '{}'),
('LAUNCH100K', 'Giảm 100.000đ cho Business Kit', 'fixed', 100000, null, 299000, 500, 1, true, '{}'),
('FREEKIT', 'Miễn phí 100% — dùng để kiểm thử', 'percentage', 100, null, 0, 50, 1, true, '{}')
on conflict (code) do nothing;

-- ---------- Templates ----------
insert into public.templates (name, category, config, active, version) values
('Thương hiệu — chuẩn', 'brand', '{"tone": "gần gũi, tự tin", "structure": ["positioning", "value_proposition", "tagline", "description", "voice", "persona", "key_messages", "palette", "typography"], "hints": {"tagline_max_words": 8}}', true, 1),
('Bảng giá — 3 gói', 'pricing', '{"tiers": ["basic", "standard", "premium"], "multipliers": [1, 1.8, 3.2], "margin_target": 0.45}', true, 1),
('Bán hàng — tư vấn & chốt', 'sales', '{"structure": ["elevator_pitch", "short_message", "long_message", "consultation_script", "discovery_questions", "objections", "follow_up", "closing"], "objection_count": 6}', true, 1),
('Marketing — 30 ngày', 'marketing', '{"plan_days": 30, "channels": ["facebook", "tiktok", "instagram", "zalo", "google"], "campaign_count": 5}', true, 1),
('Nội dung — đa nền tảng', 'content', '{"items": 30, "platforms": ["facebook", "tiktok", "instagram", "threads"], "mix": {"educational": 0.4, "social_proof": 0.2, "promotion": 0.2, "behind_the_scenes": 0.2}}', true, 1),
('Website — landing 12 section', 'website', '{"sections": ["hero", "about", "problem", "solution", "services", "benefits", "pricing", "social_proof", "faq", "cta", "contact", "footer"]}', true, 1),
('Vận hành — checklist', 'operations', '{"checklists": ["launch", "daily", "weekly", "customer_workflow", "sales_workflow", "delivery_workflow"]}', true, 1),
('Tài liệu — bộ 6 mẫu', 'documents', '{"types": ["quotation", "proposal", "service_agreement", "client_brief", "invoice", "intake_form"]}', true, 1);
