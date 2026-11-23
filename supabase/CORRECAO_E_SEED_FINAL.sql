-- =====================================================================
-- GABINETE DIGITAL 360° by DM IA Studio
-- SCRIPT DE CORREÇÃO E FINALIZAÇÃO DE TABELAS (IDEMPOTENTE)
-- Execute este script no SQL Editor do Supabase
-- =====================================================================

begin;

-- 1. Garante colunas de compatibilidade na tabela memberships (role e joined_at)
alter table if exists public.memberships
  add column if not exists role text not null default 'staff'
  check (role in ('parliamentarian', 'chief_of_staff', 'staff', 'advisor', 'intern'));

-- 2. Garante colunas de compatibilidade na tabela demand_categories
alter table if exists public.demand_categories
  add column if not exists description text,
  add column if not exists sla_hours integer not null default 72;

-- 3. Garante colunas de compatibilidade na tabela profiles
alter table if exists public.profiles
  add column if not exists institutional_role text;

-- 4. Criação idempotente de políticas de RLS para evitar o erro 42710
do $$
begin
  -- Policy: memberships_select_self
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'memberships' and policyname = 'memberships_select_self'
  ) then
    create policy memberships_select_self on public.memberships
      for select to authenticated
      using (user_id = auth.uid());
  end if;

  -- Policy: profiles_select_organization_or_self (substitui profiles_select_all para eliminar leituras globais)
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_all'
  ) then
    drop policy profiles_select_all on public.profiles;
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_organization_or_self'
  ) then
    create policy profiles_select_organization_or_self on public.profiles
      for select to authenticated
      using (
        user_id = auth.uid()
        or exists (
          select 1 
          from public.memberships m_viewer
          join public.memberships m_target on m_viewer.organization_id = m_target.organization_id
          where m_viewer.user_id = auth.uid()
            and m_viewer.status = 'active'
            and m_target.user_id = public.profiles.user_id
            and m_target.status = 'active'
        )
      );
  end if;

  -- Policy: profiles_update_self
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_self'
  ) then
    create policy profiles_update_self on public.profiles
      for update to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- 5. Carga da Organização Piloto e Departamentos
insert into public.organizations (id, platform_tenant_id, name, slug, kind, status)
values (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Gabinete Mariana Costa',
  'gabinete-mariana-costa',
  'individual',
  'active'
) on conflict (id) do nothing;

insert into public.workspaces (id, organization_id, name, kind, status)
values (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Mandato 2025-2028',
  'main',
  'active'
) on conflict (id) do nothing;

insert into public.departments (id, organization_id, workspace_id, name, kind, status)
values 
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Chefia de Gabinete', 'general', 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Assessoria Jurídica & Legislativa', 'legal', 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Atendimento ao Cidadão', 'citizen_support', 'active'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Comunicação & Mídias', 'comms', 'active')
on conflict (id) do nothing;

-- 6. Carga das Categorias de Atendimento
insert into public.demand_categories (id, organization_id, name, category_key, description, sla_hours)
values 
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Iluminação Pública', 'iluminacao_publica', 'Troca de lâmpadas, postes apagados e expansão', 72),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Saúde & UBS', 'saude_ubs', 'Agendamento de consultas, falta de medicamentos', 48),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Asfalto & Pavimentação', 'asfalto_pavimentacao', 'Tapa-buraco, recapeamento e drenagem', 120),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Poda & Zeladoria', 'poda_zeladoria', 'Poda de árvores, limpeza de praças e bueiros', 96),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Segurança & Ronda', 'seguranca_ronda', 'Reforço de patrulhamento da Guarda Municipal', 24)
on conflict (id) do update set
  description = excluded.description,
  sla_hours = excluded.sla_hours;

commit;
