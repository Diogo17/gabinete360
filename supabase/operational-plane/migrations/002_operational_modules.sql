-- ============================================================================
-- 002_operational_modules.sql
-- Complemento operacional: Perfis, CRM, Demandas Avançadas, Agenda,
-- Legislativo, Fiscalização, Participação Popular e Tarefas.
-- ============================================================================

begin;

-- 1. PROFILES (Vinculado ao auth.users local do Operational Plane)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_path text,
  phone text,
  locale text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CITIZENS (CRM de Cidadãos)
create table if not exists public.citizens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  cpf text,
  email extensions.citext,
  phone text,
  birth_date date,
  gender text,
  neighborhood text,
  city text,
  state text default 'SP',
  address_line text,
  preferred_channel text not null default 'whatsapp'
    check (preferred_channel in ('whatsapp','email','phone','in_person')),
  tags text[] not null default '{}',
  notes text,
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

-- 3. DEMAND_CATEGORIES (Categorias de Demandas)
create table if not exists public.demand_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category_key text not null,
  icon text,
  color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, category_key)
);

-- 4. Alteração em DEMANDS para referenciar citizen e categoria
alter table public.demands
  add column if not exists citizen_id uuid,
  add column if not exists category_id uuid,
  add column if not exists priority text not null default 'medium'
    check (priority in ('low','medium','high','urgent')),
  add column if not exists location_text text,
  add column if not exists protocol text;

-- Restrições compostas em demands
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'demands_citizen_same_org_fk') then
    alter table public.demands
      add constraint demands_citizen_same_org_fk
      foreign key (organization_id, citizen_id)
      references public.citizens(organization_id, id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'demands_category_same_org_fk') then
    alter table public.demands
      add constraint demands_category_same_org_fk
      foreign key (organization_id, category_id)
      references public.demand_categories(organization_id, id) on delete set null;
  end if;
end $$;

-- 5. DEMAND_ASSIGNMENTS (Atribuições de responsáveis)
create table if not exists public.demand_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  demand_id uuid not null,
  membership_id uuid not null,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  unique (organization_id, id),
  foreign key (organization_id, demand_id)
    references public.demands(organization_id, id) on delete cascade,
  foreign key (organization_id, membership_id)
    references public.memberships(organization_id, id) on delete restrict,
  check (ended_at is null or ended_at > assigned_at)
);

-- 6. DEMAND_EVENTS (Trilha auditável de eventos de demandas)
create table if not exists public.demand_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  demand_id uuid not null,
  event_type text not null check (event_type in (
    'created','status_changed','assigned','comment_added',
    'forwarded','responded','closed','reopened'
  )),
  from_status text,
  to_status text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, demand_id)
    references public.demands(organization_id, id) on delete cascade
);

-- 7. DEMAND_ATTACHMENTS (Metadados de arquivos do Storage)
create table if not exists public.demand_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  demand_id uuid not null,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  classification text not null default 'internal'
    check (classification in ('public','internal','confidential')),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, demand_id)
    references public.demands(organization_id, id) on delete cascade
);

-- 8. AGENDA_EVENTS (Agenda Parlamentar / Compromissos)
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  event_type text not null default 'meeting'
    check (event_type in ('meeting','session','hearing','visit','event','other')),
  visibility text not null default 'internal'
    check (visibility in ('public','internal','confidential')),
  status text not null default 'scheduled'
    check (status in ('scheduled','confirmed','cancelled','completed')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict,
  check (ends_at >= starts_at)
);

-- 9. LEGISLATIVE_ITEMS (Proposições Legislativas)
create table if not exists public.legislative_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  type text not null check (type in (
    'bill_project','motion','indication','requirement',
    'amendment','decree','resolution'
  )),
  number text not null,
  year integer not null check (year >= 2000),
  title text not null,
  summary text not null,
  status text not null default 'draft' check (status in (
    'draft','protocolled','in_commission','floor_vote',
    'approved','rejected','sanctioned','vetoed','promulgated'
  )),
  protocol_date date,
  protocol_number text,
  official_source_url text,
  authorship text default 'parliamentarian',
  content text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, type, number, year),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict
);

-- 10. INSPECTION_CASES (Casos de Fiscalização)
create table if not exists public.inspection_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  case_number text not null,
  title text not null,
  scope text not null,
  target_entity text not null,
  location_text text,
  status text not null default 'draft' check (status in (
    'draft','planned','in_progress','report_pending',
    'referred','concluded','archived'
  )),
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  findings text,
  action_taken text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, case_number),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict
);

-- 11. POPULAR_PARTICIPATION (Sugestões Cidadãs e Consultas Públicas)
create table if not exists public.popular_participation (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  citizen_id uuid,
  title text not null,
  description text not null,
  category text not null check (category in (
    'health','education','infrastructure','security',
    'transport','culture','environment','social','other'
  )),
  status text not null default 'submitted' check (status in (
    'submitted','in_analysis','accepted',
    'converted_to_proposal','rejected','archived'
  )),
  converted_legislative_id uuid,
  votes_count integer not null default 0 check (votes_count >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict,
  foreign key (organization_id, citizen_id)
    references public.citizens(organization_id, id) on delete set null,
  foreign key (organization_id, converted_legislative_id)
    references public.legislative_items(organization_id, id) on delete set null
);

-- 12. TASKS & TASK_ASSIGNMENTS (Gestão de Tarefas da Equipe)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  workspace_id uuid not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','review','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_at timestamptz,
  demand_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, workspace_id)
    references public.workspaces(organization_id, id) on delete restrict,
  foreign key (organization_id, demand_id)
    references public.demands(organization_id, id) on delete set null
);

create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  task_id uuid not null,
  membership_id uuid not null,
  assigned_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, task_id)
    references public.tasks(organization_id, id) on delete cascade,
  foreign key (organization_id, membership_id)
    references public.memberships(organization_id, id) on delete cascade
);

-- ============================================================================
-- RLS POLICIES E PERMISSÕES
-- ============================================================================

-- Habilitar RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.citizens enable row level security;
alter table public.demand_categories enable row level security;
alter table public.demand_assignments enable row level security;
alter table public.demand_events enable row level security;
alter table public.demand_attachments enable row level security;
alter table public.agenda_events enable row level security;
alter table public.legislative_items enable row level security;
alter table public.inspection_cases enable row level security;
alter table public.popular_participation enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;

-- Revogar acesso público e conceder papéis
revoke all on public.profiles, public.citizens, public.demand_categories,
  public.demand_assignments, public.demand_events, public.demand_attachments,
  public.agenda_events, public.legislative_items, public.inspection_cases,
  public.popular_participation, public.tasks, public.task_assignments
from anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.citizens, public.demand_categories,
  public.demand_assignments, public.demand_attachments,
  public.agenda_events, public.legislative_items, public.inspection_cases,
  public.popular_participation, public.tasks, public.task_assignments
to authenticated;

grant select, insert on public.demand_events to authenticated;

grant all on
  public.profiles, public.citizens, public.demand_categories,
  public.demand_assignments, public.demand_events, public.demand_attachments,
  public.agenda_events, public.legislative_items, public.inspection_cases,
  public.popular_participation, public.tasks, public.task_assignments
to service_role;

-- Políticas Profiles
create policy profiles_select_all on public.profiles for select to authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Políticas Genéricas Multi-Tenant por Membership Ativo
create policy citizens_all_member on public.citizens for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = citizens.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demand_categories_all_member on public.demand_categories for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = demand_categories.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
)
with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = demand_categories.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demand_assignments_all_member on public.demand_assignments for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = demand_assignments.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

-- demand_events: APPEND-ONLY (Select e Insert apenas)
create policy demand_events_select_member on public.demand_events for select to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = demand_events.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demand_events_insert_member on public.demand_events for insert to authenticated
with check (
  actor_user_id = (select auth.uid())
  and exists (
    select 1 from public.memberships m
    where m.organization_id = demand_events.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy demand_attachments_all_member on public.demand_attachments for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = demand_attachments.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy agenda_events_all_member on public.agenda_events for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = agenda_events.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy legislative_items_all_member on public.legislative_items for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = legislative_items.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy inspection_cases_all_member on public.inspection_cases for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = inspection_cases.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy popular_participation_all_member on public.popular_participation for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = popular_participation.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy tasks_all_member on public.tasks for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = tasks.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy task_assignments_all_member on public.task_assignments for all to authenticated
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = task_assignments.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

-- Índices de Performance e Isolamento
create index if not exists citizens_org_name_idx on public.citizens(organization_id, name);
create index if not exists citizens_org_phone_idx on public.citizens(organization_id, phone);
create index if not exists demand_assign_demand_idx on public.demand_assignments(demand_id);
create index if not exists demand_events_demand_idx on public.demand_events(demand_id, created_at desc);
create index if not exists agenda_org_dates_idx on public.agenda_events(organization_id, starts_at, ends_at);
create index if not exists legislative_org_status_idx on public.legislative_items(organization_id, status);
create index if not exists inspection_org_status_idx on public.inspection_cases(organization_id, status);
create index if not exists popular_part_org_status_idx on public.popular_participation(organization_id, status);
create index if not exists tasks_org_status_due_idx on public.tasks(organization_id, status, due_at);

commit;
