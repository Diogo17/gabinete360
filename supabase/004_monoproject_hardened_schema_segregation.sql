-- =====================================================================
-- 004_monoproject_hardened_schema_segregation.sql
-- Gabinete Digital 360° — DM IA Studio
-- OBJETIVO: Isolar o Control Plane em Schema Próprio dentro do MESMO PROJETO Supabase
-- Garante que um vazamento da chave do Operational Plane ou da API pública NUNCA
-- consiga ler ou modificar a governança e clientes do Control Plane.
-- =====================================================================

begin;

-- 1. Criação do Schema Dedicado de Governança
create schema if not exists control_plane;

-- 2. Migração segura das tabelas de Governança para o Schema 'control_plane'
-- (Executado apenas para as tabelas que existirem no schema public)
do $$
declare
  t text;
begin
  foreach t in array array[
    'platform_admins', 'platform_roles', 'platform_permissions', 'platform_role_permissions',
    'platform_admin_role_assignments', 'platform_tenants', 'platform_tenant_contacts',
    'platform_environments', 'platform_plans', 'platform_modules', 'platform_plan_modules',
    'tenant_subscriptions', 'tenant_module_entitlements', 'tenant_domains',
    'tenant_provisioning_jobs', 'tenant_provisioning_steps', 'tenant_admin_invites',
    'tenant_usage_daily', 'platform_audit_events', 'platform_services',
    'service_health_snapshots', 'platform_incidents', 'incident_events',
    'support_access_requests', 'support_access_grants', 'support_access_events'
  ] loop
    if exists (
      select 1 from information_schema.tables 
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I set schema control_plane', t);
    end if;
  end loop;
end $$;

-- 3. Defesa em Profundidade: Isolamento de Permissões
-- NENHUM cliente web (anon ou authenticated) tem acesso ao schema de governança
revoke all on schema control_plane from anon, authenticated, public;
revoke all on all tables in schema control_plane from anon, authenticated, public;
revoke all on all sequences in schema control_plane from anon, authenticated, public;
revoke all on all routines in schema control_plane from anon, authenticated, public;

-- Garante que tabelas futuras criadas no schema control_plane continuem estritamente privadas
alter default privileges in schema control_plane revoke all on tables from anon, authenticated, public;
alter default privileges in schema control_plane revoke all on sequences from anon, authenticated, public;
alter default privileges in schema control_plane revoke all on routines from anon, authenticated, public;

-- Apenas a role superprivilegiada interna (service_role ou postgres) acessa o Control Plane
grant usage on schema control_plane to service_role, postgres;
grant all on all tables in schema control_plane to service_role, postgres;
grant all on all sequences in schema control_plane to service_role, postgres;
grant all on all routines in schema control_plane to service_role, postgres;

commit;
