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
