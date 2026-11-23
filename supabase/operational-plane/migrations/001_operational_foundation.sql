-- 001_operational_foundation.sql
-- Aplicar somente no projeto Supabase LOCAL dedicado ao Plano Operacional.

begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  platform_tenant_id uuid not null unique,
  name text not null,
  slug extensions.citext not null unique,
  kind text not null check (kind in ('individual','chamber')),
  status text not null default 'active'
    check (status in ('active','read_only','suspended','closing','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  kind text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, name)
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  workspace_id uuid not null,
  name text not null,
  kind text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'invited'
    check (status in ('invited','active','suspended','revoked')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, user_id)
);

create table if not exists public.demands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'received'
    check (status in ('received','triage','in_progress','waiting','resolved','closed')),
  classification text not null default 'internal'
    check (classification in ('public','internal','confidential')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict
);

-- Denúncias: tabela segregada. Acesso depende de concessão explícita e válida.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  protocol_code text not null,
  intake_mode text not null check (intake_mode in ('identified','anonymous')),
  status text not null default 'received'
    check (status in ('received','triage','under_review','referred','closed')),
  restricted_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, protocol_code),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict
);

create table if not exists public.report_access_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  report_id uuid not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  purpose text not null,
  granted_by uuid not null references auth.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (organization_id, id),
  foreign key (organization_id, report_id)
    references public.reports(organization_id, id) on delete restrict,
  check (expires_at is null or expires_at > granted_at)
);

create index if not exists workspaces_org_idx on public.workspaces(organization_id);
create index if not exists departments_org_workspace_idx on public.departments(organization_id, workspace_id);
create index if not exists memberships_user_status_idx on public.memberships(user_id, status);
create index if not exists demands_org_workspace_created_idx on public.demands(organization_id, workspace_id, created_at desc);
create index if not exists reports_org_created_idx on public.reports(organization_id, created_at desc);
create index if not exists report_grants_user_expiry_idx on public.report_access_grants(user_id, expires_at)
  where revoked_at is null;

-- RLS: membership do próprio usuário; gestão de membros será endpoint backend autorizado.
alter table public.organizations enable row level security;
alter table public.workspaces enable row level security;
alter table public.departments enable row level security;
alter table public.memberships enable row level security;
alter table public.demands enable row level security;
alter table public.reports enable row level security;
alter table public.report_access_grants enable row level security;

revoke all on public.organizations, public.workspaces, public.departments,
  public.memberships, public.demands, public.reports, public.report_access_grants
from anon, authenticated;

grant select on public.organizations, public.workspaces, public.departments,
  public.memberships, public.demands, public.reports, public.report_access_grants
to authenticated;
grant insert, update on public.demands to authenticated;

grant all on public.organizations, public.workspaces, public.departments,
  public.memberships, public.demands, public.reports, public.report_access_grants
to service_role;

create policy memberships_select_self
on public.memberships for select to authenticated
using (user_id = (select auth.uid()));

create policy organizations_select_member
on public.organizations for select to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organizations.id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy workspaces_select_member
on public.workspaces for select to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = workspaces.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy departments_select_member
on public.departments for select to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = departments.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demands_select_member
on public.demands for select to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = demands.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demands_insert_member
on public.demands for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.memberships m
    where m.organization_id = demands.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demands_update_creator
on public.demands for update to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.memberships m
    where m.organization_id = demands.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.memberships m
    where m.organization_id = demands.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

-- Acesso a denúncias apenas se houver concessão ativa e dentro do escopo.
create policy reports_select_granted
on public.reports for select to authenticated
using (
  exists (
    select 1 from public.report_access_grants g
    where g.organization_id = reports.organization_id
      and g.report_id = reports.id
      and g.user_id = (select auth.uid())
      and g.revoked_at is null
      and (g.expires_at is null or g.expires_at > now())
  )
);

create policy report_grants_select_self
on public.report_access_grants for select to authenticated
using (
  user_id = (select auth.uid())
  and revoked_at is null
  and (expires_at is null or expires_at > now())
);

-- Sem INSERT público/autenticado direto em reports ou report_access_grants.
-- O intake e a concessão de acesso são operações backend auditadas.

commit;
