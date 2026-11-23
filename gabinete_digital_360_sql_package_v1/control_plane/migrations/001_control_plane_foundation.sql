-- 001_control_plane_foundation.sql
-- Aplicar somente no projeto Supabase LOCAL dedicado ao Control Plane.
-- Tabelas em public com RLS + grants negados aos papéis de cliente.
-- A API Master é server-side; não expor estas tabelas diretamente no navegador.

begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete restrict,
  display_name text not null,
  email extensions.citext not null,
  status text not null default 'invited'
    check (status in ('invited','active','suspended','revoked')),
  mfa_required boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  created_by uuid references public.platform_admins(id) on delete set null
);

create table if not exists public.platform_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  name text not null,
  description text,
  is_system boolean not null default false,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.platform_permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  description text not null,
  risk_level text not null default 'normal'
    check (risk_level in ('low','normal','high','critical'))
);

create table if not exists public.platform_role_permissions (
  role_id uuid not null references public.platform_roles(id) on delete cascade,
  permission_id uuid not null references public.platform_permissions(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.platform_admin_role_assignments (
  id uuid primary key default gen_random_uuid(),
  platform_admin_id uuid not null references public.platform_admins(id) on delete restrict,
  role_id uuid not null references public.platform_roles(id) on delete restrict,
  scope_type text not null default 'global'
    check (scope_type in ('global','tenant')),
  tenant_id uuid,
  granted_by uuid references public.platform_admins(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  check ((scope_type = 'global' and tenant_id is null)
      or (scope_type = 'tenant' and tenant_id is not null))
);

create table if not exists public.platform_tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  customer_type text not null check (customer_type in ('individual_cabinet','municipal_chamber')),
  status text not null default 'pending'
    check (status in ('pending','active','read_only','suspended','closing','archived')),
  lifecycle_state text not null default 'draft'
    check (lifecycle_state in ('draft','pending_provisioning','provisioning','provisioning_failed','ready','active','closing','archived')),
  legal_name text,
  external_runtime_org_id uuid,
  runtime_project_ref text,
  created_by uuid references public.platform_admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_runtime_org_id)
);

create table if not exists public.platform_tenant_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  contact_type text not null check (contact_type in ('technical','administrative','billing','legal')),
  name text not null,
  email extensions.citext,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.platform_admin_role_assignments
  add constraint platform_admin_role_assignments_tenant_fk
  foreign key (tenant_id) references public.platform_tenants(id) on delete cascade;

create table if not exists public.platform_environments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  environment_key text not null check (environment_key in ('shared','dedicated')),
  runtime_project_ref text not null,
  region text,
  status text not null default 'provisioning'
    check (status in ('provisioning','healthy','degraded','disabled')),
  is_dedicated boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, runtime_project_ref)
);

create table if not exists public.platform_plans (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active','retired')),
  billing_period text not null check (billing_period in ('monthly','annual','custom')),
  limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_modules (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','inactive','retired')),
  release_channel text not null default 'stable'
    check (release_channel in ('stable','beta','internal')),
  created_at timestamptz not null default now()
);

create table if not exists public.platform_plan_modules (
  plan_id uuid not null references public.platform_plans(id) on delete cascade,
  module_id uuid not null references public.platform_modules(id) on delete restrict,
  default_enabled boolean not null default false,
  default_limits jsonb not null default '{}'::jsonb,
  primary key (plan_id, module_id)
);

create table if not exists public.tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  plan_id uuid not null references public.platform_plans(id) on delete restrict,
  status text not null check (status in ('trialing','active','past_due','paused','cancelled','expired')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  billing_provider text,
  external_billing_ref text,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.tenant_module_entitlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  module_id uuid not null references public.platform_modules(id) on delete restrict,
  status text not null check (status in ('enabled','disabled','scheduled','expired')),
  limits jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  version bigint not null default 1 check (version > 0),
  updated_by uuid references public.platform_admins(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_id),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  hostname extensions.citext not null unique,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','failed','revoked')),
  verified_at timestamptz,
  is_primary boolean not null default false,
  certificate_status text not null default 'pending'
    check (certificate_status in ('pending','issued','failed','expired','revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_provisioning_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  job_type text not null check (job_type in ('create','suspend','resume','close','sync_entitlements','rotate_integration')),
  status text not null default 'queued'
    check (status in ('queued','running','succeeded','failed','needs_review','cancelled')),
  idempotency_key text not null unique,
  requested_by uuid references public.platform_admins(id) on delete set null,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  error_code text,
  safe_error_summary text
);

create table if not exists public.tenant_provisioning_steps (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.tenant_provisioning_jobs(id) on delete cascade,
  step_key text not null,
  status text not null check (status in ('pending','running','succeeded','failed','skipped')),
  attempt integer not null default 1 check (attempt > 0),
  started_at timestamptz,
  finished_at timestamptz,
  safe_output jsonb not null default '{}'::jsonb,
  unique (job_id, step_key, attempt)
);

create table if not exists public.tenant_admin_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  email extensions.citext not null,
  role_key text not null,
  status text not null default 'created'
    check (status in ('created','sent','accepted','expired','revoked','failed')),
  external_invite_ref text,
  expires_at timestamptz not null,
  created_by uuid references public.platform_admins(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_usage_daily (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  usage_date date not null,
  active_users integer not null default 0 check (active_users >= 0),
  storage_bytes bigint not null default 0 check (storage_bytes >= 0),
  messages_count bigint not null default 0 check (messages_count >= 0),
  api_requests bigint not null default 0 check (api_requests >= 0),
  jobs_failed bigint not null default 0 check (jobs_failed >= 0),
  created_at timestamptz not null default now(),
  unique (tenant_id, usage_date)
);

create table if not exists public.platform_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_admin_id uuid references public.platform_admins(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  tenant_id uuid references public.platform_tenants(id) on delete set null,
  request_id text,
  occurred_at timestamptz not null default now(),
  result text not null check (result in ('success','denied','failure')),
  reason text,
  metadata_minimized jsonb not null default '{}'::jsonb
);

create table if not exists public.platform_services (
  id uuid primary key default gen_random_uuid(),
  service_key text not null unique,
  display_name text not null,
  environment text not null check (environment in ('development','staging','production')),
  criticality text not null default 'normal' check (criticality in ('low','normal','high','critical')),
  status text not null default 'unknown' check (status in ('healthy','degraded','down','unknown'))
);

create table if not exists public.service_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.platform_services(id) on delete cascade,
  checked_at timestamptz not null default now(),
  status text not null check (status in ('healthy','degraded','down','unknown')),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  error_rate numeric(7,4) check (error_rate is null or error_rate between 0 and 1),
  source_ref text,
  details_safe jsonb not null default '{}'::jsonb
);

create table if not exists public.platform_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.platform_tenants(id) on delete set null,
  severity text not null check (severity in ('sev1','sev2','sev3','sev4')),
  status text not null default 'open'
    check (status in ('open','investigating','mitigating','resolved','closed')),
  title text not null,
  summary_safe text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  owner_admin_id uuid references public.platform_admins(id) on delete set null
);

create table if not exists public.incident_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.platform_incidents(id) on delete cascade,
  actor_admin_id uuid references public.platform_admins(id) on delete set null,
  event_type text not null,
  note_safe text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.support_access_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  requested_by uuid not null references public.platform_admins(id) on delete restrict,
  purpose text not null,
  requested_scope text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','denied','expired','revoked','used')),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  approved_by uuid references public.platform_admins(id) on delete restrict,
  approved_at timestamptz,
  check (expires_at > requested_at),
  check (approved_by is null or approved_by <> requested_by)
);

create table if not exists public.support_access_grants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.support_access_requests(id) on delete restrict,
  grant_scope text not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  access_session_ref text
);

create table if not exists public.support_access_events (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.support_access_grants(id) on delete restrict,
  actor_admin_id uuid not null references public.platform_admins(id) on delete restrict,
  action text not null,
  occurred_at timestamptz not null default now(),
  request_id text
);

create index if not exists platform_tenants_status_idx on public.platform_tenants(status, lifecycle_state);
create index if not exists tenant_subscriptions_tenant_status_idx on public.tenant_subscriptions(tenant_id, status);
create index if not exists tenant_entitlements_tenant_idx on public.tenant_module_entitlements(tenant_id, status);
create index if not exists provisioning_jobs_status_created_idx on public.tenant_provisioning_jobs(status, requested_at desc);
create index if not exists platform_audit_tenant_time_idx on public.platform_audit_events(tenant_id, occurred_at desc);
create index if not exists platform_audit_actor_time_idx on public.platform_audit_events(actor_admin_id, occurred_at desc);
create index if not exists health_snapshots_service_time_idx on public.service_health_snapshots(service_id, checked_at desc);
create index if not exists incidents_status_severity_idx on public.platform_incidents(status, severity, detected_at desc);

-- Defesa em profundidade: RLS ativo e nenhuma leitura/escrita direta pelos clientes web.
do $$
declare t text;
begin
  foreach t in array array[
    'platform_admins','platform_roles','platform_permissions','platform_role_permissions',
    'platform_admin_role_assignments','platform_tenants','platform_tenant_contacts',
    'platform_environments','platform_plans','platform_modules','platform_plan_modules',
    'tenant_subscriptions','tenant_module_entitlements','tenant_domains',
    'tenant_provisioning_jobs','tenant_provisioning_steps','tenant_admin_invites',
    'tenant_usage_daily','platform_audit_events','platform_services',
    'service_health_snapshots','platform_incidents','incident_events',
    'support_access_requests','support_access_grants','support_access_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
end $$;

revoke all on all sequences in schema public from anon, authenticated;
grant usage, select on all sequences in schema public to service_role;

-- Não conceder EXECUTE público a funções privilegiadas futuras por padrão.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

commit;
