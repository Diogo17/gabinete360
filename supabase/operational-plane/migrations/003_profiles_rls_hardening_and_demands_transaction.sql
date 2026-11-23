-- =====================================================================
-- 003_profiles_rls_hardening_and_demands_transaction.sql
-- Gabinete Digital 360° — Operational Plane
-- 1. Elimina leituras globais de perfis (profiles_select_all)
-- 2. Restringe acesso de perfis apenas a membros da mesma organização ou ao próprio perfil
-- 3. Função transacional atômica para Cidadão, Demanda e Trilha de Auditoria
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Hardening de RLS para a tabela public.profiles
-- ---------------------------------------------------------------------
drop policy if exists profiles_select_all on public.profiles;

-- Política restritiva: Usuário só pode ler seu próprio perfil OU perfis de colegas da mesma organização
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

-- ---------------------------------------------------------------------
-- 2. Função RPC transacional para registro íntegro de Demanda
-- Garante atomicidade ACID entre busca/criação de cidadão, demanda e trilha de auditoria
-- ---------------------------------------------------------------------
create or replace function public.register_demand_transactional(
  p_org_id uuid,
  p_workspace_id uuid,
  p_title text,
  p_description text default null,
  p_classification text default 'internal',
  p_priority text default 'medium',
  p_citizen_name text default null,
  p_citizen_phone text default null,
  p_citizen_neighborhood text default null,
  p_category_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_citizen_id uuid := null;
  v_demand_id uuid;
  v_is_member boolean;
  v_result jsonb;
begin
  v_user_id := auth.uid();

  -- Validação de autorização no tenant (Operational Isolation)
  if v_user_id is not null then
    select exists (
      select 1 from public.memberships
      where organization_id = p_org_id
        and user_id = v_user_id
        and status = 'active'
    ) into v_is_member;

    if not v_is_member then
      raise exception 'Acesso negado: Usuário autenticado não pertence à organização especificada.'
        using errcode = '42501';
    end if;
  end if;

  -- 1. Criação ou busca de Cidadão (se dados de contato fornecidos)
  if p_citizen_name is not null and trim(p_citizen_name) <> '' then
    -- Tenta localizar por telefone na mesma organização se houver telefone
    if p_citizen_phone is not null and trim(p_citizen_phone) <> '' then
      select id into v_citizen_id
      from public.citizens
      where organization_id = p_org_id
        and phone = trim(p_citizen_phone)
      limit 1;
    end if;

    -- Se não encontrado, cria novo registro de cidadão
    if v_citizen_id is null then
      insert into public.citizens (
        organization_id,
        name,
        phone,
        neighborhood
      ) values (
        p_org_id,
        trim(p_citizen_name),
        nullif(trim(p_citizen_phone), ''),
        nullif(trim(p_citizen_neighborhood), '')
      ) returning id into v_citizen_id;
    end if;
  end if;

  -- 2. Inserção atômica da Demanda
  insert into public.demands (
    organization_id,
    workspace_id,
    created_by,
    title,
    description,
    status,
    classification
  ) values (
    p_org_id,
    p_workspace_id,
    coalesce(v_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    trim(p_title),
    p_description,
    'received',
    coalesce(p_classification, 'internal')
  ) returning id into v_demand_id;

  -- 3. Inserção obrigatória na trilha imutável de eventos (Auditoria)
  insert into public.demand_events (
    organization_id,
    demand_id,
    event_type,
    from_status,
    to_status,
    actor_user_id,
    notes
  ) values (
    p_org_id,
    v_demand_id,
    'created',
    null,
    'received',
    v_user_id,
    'Demanda registrada atomicamente com auditoria integrada'
  );

  -- Monta resposta JSON estruturada
  select jsonb_build_object(
    'success', true,
    'demand_id', v_demand_id,
    'citizen_id', v_citizen_id,
    'organization_id', p_org_id,
    'status', 'received'
  ) into v_result;

  return v_result;
exception
  when others then
    -- Qualquer falha acarreta rollback automático da transação ACID
    raise;
end;
$$;

-- Permite execução para usuários autenticados
grant execute on function public.register_demand_transactional to authenticated;

commit;
