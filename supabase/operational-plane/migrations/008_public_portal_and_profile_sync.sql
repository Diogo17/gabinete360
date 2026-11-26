-- ============================================================================
-- Migration 008: Public Portal Sync, Parliamentary Profiles Hardening & Intake
-- Operational Plane (Supabase)
-- ============================================================================

begin;

-- 1. Organizations: alinhar metadados institucionais e permitir UPDATE controlado por titulares/chefia
alter table public.organizations
  add column if not exists parliamentarian_name text,
  add column if not exists municipality text,
  add column if not exists state text;

grant update (name, avatar_url, description, agenda_sync_url, parliamentarian_name, municipality, state)
  on public.organizations to authenticated;

drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin
  on public.organizations
  for update
  to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = organizations.id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('parliamentarian', 'chief_of_staff')
    )
  )
  with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = organizations.id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('parliamentarian', 'chief_of_staff')
    )
  );

-- 2. Parliamentary Profiles: estrutura completa do Portal Público + 1:1 com organização
alter table public.parliamentary_profiles
  add column if not exists default_workspace_id uuid,
  add column if not exists portal_slug text,
  add column if not exists cabinet_name text,
  add column if not exists avatar_url text,
  add column if not exists bio_headline text,
  add column if not exists biography text,
  add column if not exists highlights jsonb not null default '[]'::jsonb,
  add column if not exists chamber_name text,
  add column if not exists chamber_address text,
  add column if not exists chamber_cep text,
  add column if not exists portal_enabled boolean not null default true,
  add column if not exists portal_cta_label text,
  add column if not exists neighborhood_placeholder text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'parliamentary_profiles_org_unique'
  ) then
    alter table public.parliamentary_profiles
      add constraint parliamentary_profiles_org_unique unique (organization_id);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'parliamentary_profiles_portal_slug_unique'
  ) then
    alter table public.parliamentary_profiles
      add constraint parliamentary_profiles_portal_slug_unique unique (portal_slug);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'parliamentary_profiles_workspace_fk'
  ) then
    alter table public.parliamentary_profiles
      add constraint parliamentary_profiles_workspace_fk
      foreign key (organization_id, default_workspace_id)
      references public.workspaces(organization_id, id) on delete set null;
  end if;
end $$;

create index if not exists parliamentary_profiles_portal_slug_idx
  on public.parliamentary_profiles (portal_slug)
  where portal_enabled = true and status = 'active';

revoke all on public.parliamentary_profiles from anon, authenticated;
grant select on public.parliamentary_profiles to anon;
grant select, insert, update, delete on public.parliamentary_profiles to authenticated;
grant all on public.parliamentary_profiles to service_role;

drop policy if exists parliamentary_profiles_tenant_isolation on public.parliamentary_profiles;
drop policy if exists parliamentary_profiles_public_read on public.parliamentary_profiles;
drop policy if exists parliamentary_profiles_member_read on public.parliamentary_profiles;
drop policy if exists parliamentary_profiles_member_insert on public.parliamentary_profiles;
drop policy if exists parliamentary_profiles_member_update on public.parliamentary_profiles;
drop policy if exists parliamentary_profiles_member_delete on public.parliamentary_profiles;

create policy parliamentary_profiles_public_read
  on public.parliamentary_profiles
  for select
  to anon
  using (portal_enabled = true and status = 'active');

create policy parliamentary_profiles_member_read
  on public.parliamentary_profiles
  for select
  to authenticated
  using (
    (portal_enabled = true and status = 'active')
    or exists (
      select 1 from public.memberships m
      where m.organization_id = parliamentary_profiles.organization_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
  );

create policy parliamentary_profiles_member_insert
  on public.parliamentary_profiles
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = parliamentary_profiles.organization_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('parliamentarian', 'chief_of_staff')
    )
  );

create policy parliamentary_profiles_member_update
  on public.parliamentary_profiles
  for update
  to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = parliamentary_profiles.organization_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('parliamentarian', 'chief_of_staff')
    )
  )
  with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = parliamentary_profiles.organization_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('parliamentarian', 'chief_of_staff')
    )
  );

create policy parliamentary_profiles_member_delete
  on public.parliamentary_profiles
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = parliamentary_profiles.organization_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('parliamentarian', 'chief_of_staff')
    )
  );

-- 3. Legislative Items: visibilidade pública explícita + rito legislativo completo
alter table public.legislative_items
  add column if not exists is_public boolean not null default false,
  add column if not exists is_featured boolean not null default false;

alter table public.legislative_items
  drop constraint if exists legislative_items_status_check;

alter table public.legislative_items
  add constraint legislative_items_status_check
  check (status in (
    'draft', 'generated', 'needs_review', 'reviewed', 'approved',
    'ready_to_sign', 'signed', 'exported', 'protocol_pending',
    'protocol_submitted', 'protocol_confirmed', 'in_commission',
    'floor_vote', 'sanctioned', 'promulgated', 'vetoed',
    'rejected', 'returned', 'archived', 'cancelled'
  ));

create index if not exists legislative_items_public_portal_idx
  on public.legislative_items (organization_id, is_public, is_featured, year desc, created_at desc)
  where is_public = true;

grant select on public.legislative_items to anon;

drop policy if exists legislative_items_tenant_isolation on public.legislative_items;
drop policy if exists legislative_items_public_read on public.legislative_items;

create policy legislative_items_public_read
  on public.legislative_items
  for select
  to anon, authenticated
  using (
    is_public = true
    and status not in ('draft', 'archived', 'cancelled')
    and exists (
      select 1 from public.parliamentary_profiles pp
      where pp.organization_id = legislative_items.organization_id
        and pp.portal_enabled = true
        and pp.status = 'active'
    )
  );

-- 4. Agenda Events: leitura pública estrita para visibility = 'public'
create index if not exists agenda_events_public_portal_idx
  on public.agenda_events (organization_id, visibility, starts_at)
  where visibility = 'public';

grant select on public.agenda_events to anon;

drop policy if exists agenda_events_public_read on public.agenda_events;
create policy agenda_events_public_read
  on public.agenda_events
  for select
  to anon, authenticated
  using (
    visibility = 'public'
    and status <> 'cancelled'
    and exists (
      select 1 from public.parliamentary_profiles pp
      where pp.organization_id = agenda_events.organization_id
        and pp.portal_enabled = true
        and pp.status = 'active'
    )
  );

-- 5. Demands & Demand Events: recepção pública controlada sem expor leitura a anon
alter table public.demands
  alter column created_by drop not null;

alter table public.demands
  add column if not exists requester_name text,
  add column if not exists requester_phone text,
  add column if not exists source_channel text not null default 'internal';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'demands_source_channel_check'
  ) then
    alter table public.demands
      add constraint demands_source_channel_check
      check (source_channel in ('internal', 'portal', 'whatsapp', 'email', 'phone'));
  end if;
end $$;

alter table public.demand_events
  alter column actor_user_id drop not null;

grant insert (
  organization_id, workspace_id, created_by, title, description,
  status, classification, priority, location_text, protocol,
  requester_name, requester_phone, source_channel
) on public.demands to anon;

drop policy if exists demands_public_portal_insert on public.demands;
create policy demands_public_portal_insert
  on public.demands
  for insert
  to anon, authenticated
  with check (
    classification = 'public'
    and status = 'received'
    and created_by is null
    and source_channel = 'portal'
    and exists (
      select 1 from public.parliamentary_profiles pp
      where pp.organization_id = demands.organization_id
        and pp.default_workspace_id = demands.workspace_id
        and pp.portal_enabled = true
        and pp.status = 'active'
    )
  );

commit;
