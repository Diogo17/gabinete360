-- =====================================================================
-- 005_reset_demo_data_and_force_global_logout.sql
-- Gabinete Digital 360° — DM IA Studio
-- 1. Revoga todas as sessões ativas do Supabase Auth (desloga todos os usuários)
-- 2. Limpa dados fictícios/demonstrativos de teste mantendo apenas o Master Admin real
-- =====================================================================

begin;

-- 1. Força Logout Global / Desloga todas as sessões ativas no Supabase Auth
-- Deleta todos os tokens de refresh e sessões ativas
delete from auth.refresh_tokens;
delete from auth.sessions;

-- 2. Limpeza de registros de demonstração nas tabelas operacionais
-- Limpa demandas fictícias e eventos gerados em testes
truncate table public.demand_events cascade;
truncate table public.demand_assignments cascade;
truncate table public.demand_attachments cascade;
truncate table public.demands cascade;

-- Limpa cidadãos e atendimentos criados como dados fictícios
truncate table public.citizens cascade;

-- Limpa tarefas fictícias
truncate table public.task_assignments cascade;
truncate table public.tasks cascade;

-- Limpa agenda e fiscalizações fictícias
truncate table public.agenda_events cascade;
truncate table public.inspection_cases cascade;
truncate table public.popular_participation cascade;
truncate table public.legislative_items cascade;

-- 3. Limpeza de usuários de teste e demonstração do auth.users (preserva apenas o diogosrodrigues92@gmail.com)
delete from auth.identities 
where user_id in (
  select id from auth.users 
  where email <> 'diogosrodrigues92@gmail.com'
);

delete from auth.users 
where email <> 'diogosrodrigues92@gmail.com';

-- 4. Limpeza de perfis e memberships correspondentes aos usuários removidos
delete from public.memberships 
where user_id not in (
  select id from auth.users
);

delete from public.profiles 
where user_id not in (
  select id from auth.users
);

-- 5. No Control Plane (se as tabelas estiverem no schema public ou control_plane)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'platform_admins') then
    delete from public.platform_admin_role_assignments 
    where platform_admin_id not in (
      select id from public.platform_admins where email = 'diogosrodrigues92@gmail.com'
    );
    delete from public.platform_admins 
    where email <> 'diogosrodrigues92@gmail.com';
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'control_plane' and table_name = 'platform_admins') then
    delete from control_plane.platform_admin_role_assignments 
    where platform_admin_id not in (
      select id from control_plane.platform_admins where email = 'diogosrodrigues92@gmail.com'
    );
    delete from control_plane.platform_admins 
    where email <> 'diogosrodrigues92@gmail.com';
  end if;
end $$;

commit;
