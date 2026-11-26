-- ============================================================================
-- SEED OFICIAL DO PORTAL & PERFIL PARLAMENTAR:
-- Vereador Bill do Barreiro do Alegre (Edilson Alves dos Santos) — Januária/MG
-- Execute após a Migration 008 (008_public_portal_and_profile_sync.sql).
-- Script 100% idempotente.
-- ============================================================================

begin;

-- 1. Promover titular do mandato no controle de membros
UPDATE public.memberships
SET role = 'parliamentarian'
WHERE user_id = 'e48c69ce-c99d-40f0-875f-13735a5fc235'
  AND organization_id IN (
    '11111111-1111-4111-8111-111111110001',
    '11111111-1111-4111-8111-111111110002'
  );

-- 2. Atualizar metadados da Organização (Gabinete + Câmara)
UPDATE public.organizations
SET
  name = 'Gabinete Vereador Bill do Barreiro do Alegre - Januária/MG',
  parliamentarian_name = 'Bill do Barreiro do Alegre',
  municipality = 'Januária',
  state = 'MG',
  avatar_url = '/vereador-bill.jpg',
  description = 'Mandato do Vereador Edilson Alves dos Santos (Bill do Barreiro do Alegre) — União Brasil (2025–2028) na Câmara Municipal de Januária-MG.'
WHERE id = '11111111-1111-4111-8111-111111110001';

UPDATE public.organizations
SET
  municipality = 'Januária',
  state = 'MG',
  description = 'Poder Legislativo do Município de Januária - Minas Gerais.'
WHERE id = '11111111-1111-4111-8111-111111110002';

-- 3. Atualizar perfil do usuário titular
UPDATE public.profiles
SET
  display_name = 'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  institutional_role = 'Vereador (2025–2028)',
  phone = '(38) 3620-0650',
  avatar_path = '/vereador-bill.jpg',
  updated_at = now()
WHERE user_id = 'e48c69ce-c99d-40f0-875f-13735a5fc235';

-- 4. Inserir / Atualizar Perfil Parlamentar Oficial (Fonte de Verdade do Portal Público)
INSERT INTO public.parliamentary_profiles (
  organization_id,
  default_workspace_id,
  portal_slug,
  cabinet_name,
  jurisdiction,
  institution_type,
  parliamentary_role,
  legislator_name,
  full_name,
  party,
  state,
  municipality,
  district,
  legislature_number,
  term_start,
  term_end,
  office_address,
  official_email,
  official_phone,
  official_site,
  avatar_url,
  bio_headline,
  biography,
  highlights,
  chamber_name,
  chamber_address,
  chamber_cep,
  portal_enabled,
  portal_cta_label,
  neighborhood_placeholder,
  status
)
VALUES (
  '11111111-1111-4111-8111-111111110001',
  '22222222-2222-4222-8222-222222220001',
  'bill-barreiro-januaria',
  'Gabinete Vereador Bill do Barreiro do Alegre',
  'municipal',
  'city_council',
  'vereador',
  'Bill do Barreiro do Alegre',
  'Edilson Alves dos Santos',
  'União Brasil',
  'MG',
  'Januária',
  'Riacho da Cruz (Barreiro do Alegre)',
  '2025–2028',
  '2025-01-01',
  '2028-12-31',
  'Gabinete 08 · Av. Marechal Deodoro da Fonseca, nº 202 · Centro · Januária - MG',
  'billdobarreiro@januaria.mg.leg.br',
  '(38) 3620-0650',
  'https://www.januaria.mg.leg.br',
  '/vereador-bill.jpg',
  'Raízes no Campo, Representatividade Quilombola e Compromisso com Januária',
  'Nascido em 05/10/1976 na Comunidade Quilombola de Barreiro do Alegre (distrito de Riacho da Cruz), filho e neto de trabalhadores rurais, Edilson Alves dos Santos — Bill do Barreiro do Alegre — foi presidente da associação comunitária por três mandatos, chefiou o Departamento Hídrico da Prefeitura de Januária e exerce seu mandato na Câmara Municipal (2025–2028) pelo União Brasil.',
  '[
    "849 Votos (Eleição 2024)",
    "R$ 302.540,00 em Emendas Impositivas 2026",
    "Comunidades Rurais e Quilombolas"
  ]'::jsonb,
  'Câmara Municipal de Januária',
  'Avenida Marechal Deodoro da Fonseca, nº 202 · Centro · Januária - MG',
  '39.480-000',
  true,
  'Enviar ao Gabinete do Vereador Bill do Barreiro',
  'Ex.: Barreiro do Alegre · Januária',
  'active'
)
ON CONFLICT (organization_id) DO UPDATE SET
  default_workspace_id = EXCLUDED.default_workspace_id,
  portal_slug = EXCLUDED.portal_slug,
  cabinet_name = EXCLUDED.cabinet_name,
  jurisdiction = EXCLUDED.jurisdiction,
  institution_type = EXCLUDED.institution_type,
  parliamentary_role = EXCLUDED.parliamentary_role,
  legislator_name = EXCLUDED.legislator_name,
  full_name = EXCLUDED.full_name,
  party = EXCLUDED.party,
  state = EXCLUDED.state,
  municipality = EXCLUDED.municipality,
  district = EXCLUDED.district,
  legislature_number = EXCLUDED.legislature_number,
  term_start = EXCLUDED.term_start,
  term_end = EXCLUDED.term_end,
  office_address = EXCLUDED.office_address,
  official_email = EXCLUDED.official_email,
  official_phone = EXCLUDED.official_phone,
  official_site = EXCLUDED.official_site,
  avatar_url = EXCLUDED.avatar_url,
  bio_headline = EXCLUDED.bio_headline,
  biography = EXCLUDED.biography,
  highlights = EXCLUDED.highlights,
  chamber_name = EXCLUDED.chamber_name,
  chamber_address = EXCLUDED.chamber_address,
  chamber_cep = EXCLUDED.chamber_cep,
  portal_enabled = EXCLUDED.portal_enabled,
  portal_cta_label = EXCLUDED.portal_cta_label,
  neighborhood_placeholder = EXCLUDED.neighborhood_placeholder,
  status = EXCLUDED.status,
  updated_at = now();

-- 5. Inserir PL nº 007/2025 confirmado no SAPL (Lei Ordinária nº 2.887/2025)
INSERT INTO public.legislative_items (
  organization_id, workspace_id, type, number, year, title, summary,
  status, protocol_date, official_source_url, authorship, is_public, is_featured, created_by, created_at
)
VALUES (
  '11111111-1111-4111-8111-111111110001',
  '22222222-2222-4222-8222-222222220001',
  'bill_project',
  '007/2025',
  2025,
  'PL 007/2025 — Utilidade Pública da Associação de Sambaíba (Lei nº 2.887/2025)',
  'Altera o art. 1º da Lei nº 1.246/1987 para declarar de utilidade pública a Associação dos Moradores e Amigos de Sambaíba e Adjacências. Sancionado como Lei Ordinária nº 2.887, de 20/05/2025.',
  'sanctioned',
  '2025-03-31',
  'https://sapl.januaria.mg.leg.br',
  'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  true,
  true,
  'e48c69ce-c99d-40f0-875f-13735a5fc235',
  '2025-03-31T10:00:00Z'
)
ON CONFLICT (organization_id, type, number, year) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  status = EXCLUDED.status,
  protocol_date = EXCLUDED.protocol_date,
  official_source_url = EXCLUDED.official_source_url,
  authorship = EXCLUDED.authorship,
  is_public = EXCLUDED.is_public,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();

-- 6. Atualizar visibilidade e status reais dos itens legislativos já gravados do Vereador Bill
UPDATE public.legislative_items
SET
  status = 'in_commission',
  protocol_date = '2026-06-02',
  official_source_url = 'https://sapl.januaria.mg.leg.br',
  authorship = 'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  is_public = true,
  is_featured = true,
  updated_at = now()
WHERE organization_id = '11111111-1111-4111-8111-111111110001'
  AND number = '008/2026'
  AND year = 2026;

UPDATE public.legislative_items
SET
  status = 'protocol_submitted',
  protocol_date = '2025-12-08',
  authorship = 'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  is_public = true,
  is_featured = true,
  updated_at = now()
WHERE organization_id = '11111111-1111-4111-8111-111111110001'
  AND number = '026/2025'
  AND year = 2025;

UPDATE public.legislative_items
SET
  status = 'protocol_confirmed',
  protocol_date = '2026-02-20',
  authorship = 'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  is_public = true,
  is_featured = false,
  updated_at = now()
WHERE organization_id = '11111111-1111-4111-8111-111111110001'
  AND number = '005/2026'
  AND year = 2026;

UPDATE public.legislative_items
SET
  status = 'protocol_submitted',
  authorship = 'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  is_public = true,
  is_featured = false,
  updated_at = now()
WHERE organization_id = '11111111-1111-4111-8111-111111110001'
  AND number IN (
    '013/2025', '018/2025', '019/2025', '025/2025', '050/2025',
    '027/2026', '002/2026', '003/2026', '006/2026', 'EI 003/2026',
    '011/2026', '012/2026', '015/2026', '016/2026', '019/2026',
    '031/2026', '032/2026', '033/2026'
  );

commit;
