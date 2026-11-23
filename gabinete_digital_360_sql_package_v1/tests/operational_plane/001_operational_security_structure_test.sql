-- 001_operational_security_structure_test.sql
-- Executar com supabase test db no projeto LOCAL Plano Operacional.
begin;
select plan(12);

select has_table('public','organizations','organizations existe');
select has_table('public','memberships','memberships existe');
select has_table('public','demands','demands existe');
select has_table('public','reports','reports existe');
select ok((select relrowsecurity from pg_class where oid='public.organizations'::regclass),
          'RLS habilitado em organizations');
select ok((select relrowsecurity from pg_class where oid='public.demands'::regclass),
          'RLS habilitado em demands');
select ok((select relrowsecurity from pg_class where oid='public.reports'::regclass),
          'RLS habilitado em reports');
select ok(not has_table_privilege('anon','public.demands','SELECT'),
          'anon não consulta demandas diretamente');
select ok(not has_table_privilege('anon','public.reports','SELECT'),
          'anon não consulta denúncias diretamente');
select ok(not has_table_privilege('authenticated','public.reports','INSERT'),
          'authenticated não cria denúncia diretamente');
select ok(not has_table_privilege('authenticated','public.report_access_grants','INSERT'),
          'authenticated não concede acesso a denúncia diretamente');
select ok(exists (
  select 1 from pg_constraint
  where conrelid='public.departments'::regclass and contype='f'
), 'departments possui FK para workspace com escopo de organização');

select * from finish();
rollback;
