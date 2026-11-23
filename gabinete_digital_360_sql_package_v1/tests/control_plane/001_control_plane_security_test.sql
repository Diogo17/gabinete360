-- 001_control_plane_security_test.sql
-- Executar com supabase test db no projeto LOCAL Control Plane.
begin;
select plan(8);

select has_table('public','platform_admins','platform_admins existe');
select has_table('public','platform_tenants','platform_tenants existe');
select has_table('public','platform_audit_events','auditoria existe');
select ok((select relrowsecurity from pg_class where oid='public.platform_tenants'::regclass),
          'RLS habilitado em platform_tenants');
select ok((select relrowsecurity from pg_class where oid='public.platform_audit_events'::regclass),
          'RLS habilitado em platform_audit_events');
select ok(not has_table_privilege('anon','public.platform_tenants','SELECT'),
          'anon não lê tenants');
select ok(not has_table_privilege('authenticated','public.platform_tenants','SELECT'),
          'authenticated não lê tenants diretamente');
select ok(not has_table_privilege('authenticated','public.platform_audit_events','INSERT'),
          'authenticated não grava auditoria Master diretamente');

select * from finish();
rollback;
