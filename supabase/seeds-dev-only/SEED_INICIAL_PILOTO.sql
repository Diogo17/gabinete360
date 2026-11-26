-- =====================================================================
-- GABINETE DIGITAL 360° by DM IA Studio
-- SEED INICIAL: ORGANIZAÇÃO PILOTO, DEPARTAMENTOS E CATEGORIAS DE DEMANDAS
-- =====================================================================

begin;

-- 1. Criação da Organização Piloto (Gabinete Vereadora Mariana Costa)
insert into public.organizations (id, platform_tenant_id, name, slug, kind, status)
values (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Gabinete Mariana Costa',
  'gabinete-mariana-costa',
  'individual',
  'active'
) on conflict (id) do nothing;

-- 2. Workspace Principal
insert into public.workspaces (id, organization_id, name, kind, status)
values (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Mandato 2025-2028',
  'main',
  'active'
) on conflict (id) do nothing;

-- 3. Departamentos do Gabinete
insert into public.departments (id, organization_id, workspace_id, name, kind, status)
values 
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Chefia de Gabinete', 'general', 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Assessoria Jurídica & Legislativa', 'legal', 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Atendimento ao Cidadão', 'citizen_support', 'active'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Comunicação & Mídias', 'comms', 'active')
on conflict (id) do nothing;

-- 4. Categorias Padrão de Demandas Cidadãs
insert into public.demand_categories (id, organization_id, name, description, sla_hours)
values 
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Iluminação Pública', 'Troca de lâmpadas, postes apagados e expansão de iluminação pública', 72),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Saúde & UBS', 'Agendamento de consultas, falta de medicamentos e infraestrutura de UBS', 48),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Asfalto & Pavimentação', 'Tapa-buraco, recapeamento e drenagem de vias públicas', 120),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Poda & Zeladoria', 'Poda de árvores, limpeza de praças e bueiros entupidos', 96),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Segurança & Ronda', 'Solicitação de reforço de patrulhamento da Guarda Municipal', 24)
on conflict (id) do nothing;

commit;
