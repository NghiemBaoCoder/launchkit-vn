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
