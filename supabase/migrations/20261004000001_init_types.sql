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
