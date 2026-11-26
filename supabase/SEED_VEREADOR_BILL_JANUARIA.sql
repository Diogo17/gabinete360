-- ============================================================================
-- SEED: Vereador Bill do Barreiro do Alegre (Edilson Alves dos Santos)
-- Município: Januária - MG | Mandato: 2025–2028 | Partido: União Brasil
-- Auth User ID: e48c69ce-c99d-40f0-875f-13735a5fc235
-- Login: bill.barreiro@gabinete360.app
-- ============================================================================

-- 1. Confirmar e-mail do usuário no Auth (caso ainda pendente de aprovação)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = 'e48c69ce-c99d-40f0-875f-13735a5fc235';

-- 2. Criar Organização (Gabinete)
INSERT INTO public.organizations (id, platform_tenant_id, name, slug, kind, status, created_at)
VALUES (
  '11111111-1111-4111-8111-111111110001',
  '33333333-3333-4333-8333-333333330001',
  'Gabinete Vereador Bill do Barreiro do Alegre - Januária/MG',
  'bill-barreiro-januaria',
  'individual',
  'active',
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Criar Workspace Principal
INSERT INTO public.workspaces (id, organization_id, name, kind, status, created_at)
VALUES (
  '22222222-2222-4222-8222-222222220001',
  '11111111-1111-4111-8111-111111110001',
  'Mandato 2025–2028',
  'main',
  'active',
  now()
)
ON CONFLICT DO NOTHING;

-- 4. Criar Perfil do Parlamentar
INSERT INTO public.profiles (user_id, display_name, locale, created_at)
VALUES (
  'e48c69ce-c99d-40f0-875f-13735a5fc235',
  'Edilson Alves dos Santos (Bill do Barreiro do Alegre)',
  'pt-BR',
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name;

-- 5. Vincular Membership (Titular do Gabinete)
INSERT INTO public.memberships (organization_id, user_id, role, status, joined_at, created_at)
VALUES (
  '11111111-1111-4111-8111-111111110001',
  'e48c69ce-c99d-40f0-875f-13735a5fc235',
  'parliamentarian',
  'active',
  now(),
  now()
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'parliamentarian';

-- 5b. Criar Organização da Câmara Municipal de Januária - MG e vincular o Vereador
INSERT INTO public.organizations (id, platform_tenant_id, name, slug, kind, status, created_at)
VALUES (
  '11111111-1111-4111-8111-111111110002',
  '33333333-3333-4333-8333-333333330002',
  'Câmara Municipal de Januária - MG',
  'camara-januaria-mg',
  'chamber',
  'active',
  now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.workspaces (id, organization_id, name, kind, status, created_at)
VALUES (
  '22222222-2222-4222-8222-222222220002',
  '11111111-1111-4111-8111-111111110002',
  'Legislatura 2025–2028',
  'main',
  'active',
  now()
)
ON CONFLICT DO NOTHING;

INSERT INTO public.memberships (organization_id, user_id, status, joined_at, created_at)
VALUES (
  '11111111-1111-4111-8111-111111110002',
  'e48c69ce-c99d-40f0-875f-13735a5fc235',
  'active',
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- 6. Itens Legislativos (2025–2026) — Inventário Documental Completo
INSERT INTO public.legislative_items (organization_id, workspace_id, type, number, year, title, summary, status, created_by, created_at)
VALUES
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'motion', '013/2025', 2025, 'Voto de Louvor à PMMG (250 anos)', 'Reconhecimento à Polícia Militar de Minas Gerais e ao 30º BPM de Januária.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2025-07-01T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '019/2025', 2025, 'Infraestrutura Urbana: Trânsito, Praça e Rodoviária', 'Placas na Rua Coronel Serrão, manutenção da Praça do Cemitério e reforma da Rodoviária.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2025-10-22T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'requirement', '025/2025', 2025, 'Equipamentos para Associação de São Sebastião', 'Solicitação ao Dep. Federal José Silva de 10 jogos de mesas e 2 tendas 6x6m.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2025-12-01T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'bill_project', '050/2025', 2025, 'PL 050/2025 — Semana Municipal da Melhor Idade', 'Institui a Semana Municipal da Melhor Idade na primeira semana de outubro.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2025-12-03T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'requirement', '026/2025', 2025, 'Torre Hidráulica para o Departamento Hídrico', 'Aquisição de torre hidráulica para atender mais de 500 poços artesianos rurais.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2025-12-08T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'requirement', '027/2026', 2026, 'Equipamentos para Associação Quilombola de Alegre', 'Solicitação de 10 jogos de mesas e 2 tendas 6x6m (CNPJ 21.372.677/0001-20).', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-01-21T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '002/2026', 2026, 'Água, CEMEI, Estradas e Iluminação (Alegre e Região)', 'Cobrança à COPASA, data do CEMEI de Alegre, estradas de Nova Odessa/Umburana/Tanque e iluminação.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-02-12T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'motion', '003/2026', 2026, 'Voto de Pesar — Ângela Maria de Souza', 'Homenagem póstuma pelo falecimento em 09/02/2026.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-02-12T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '011/2026', 2026, 'Solicitações ao DER — BR-135 (Alegre a Itacarambi)', 'Retirada de ponto de ônibus na BR-135 (Alegre) e poda/limpeza das margens.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-05-12T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '012/2026', 2026, 'Limpeza e Coleta de Lixo — Rodoanel ao Trevo do Barreiro', 'Solicitação de equipe de limpeza para evitar incêndios e obstrução de drenagem.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-05-12T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '015/2026', 2026, 'Criação da Praça do Autista em Januária', 'Espaço público de lazer inclusivo e adaptado para pessoas com TEA.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-05-26T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '016/2026', 2026, 'Remanejamento de Saúde — Comunidade de Formosa', 'Atendimento de moradores de Formosa no posto de saúde de Riacho da Cruz.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-05-26T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'bill_project', '008/2026', 2026, 'PDL 08/2026 — Título de Cidadão Honorário (Marconi Borges)', 'Concessão de Título de Cidadão Honorário Januarense a Marconi Leonard Lisboa Borges.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-06-12T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '019/2026', 2026, 'Cascalhamento de Estradas Rurais', 'Manutenção de estradas em Umburana, Tatu, Alegre 2, Barreiro do Alegre e Cemitério do Papagaio.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-06-22T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'requirement', '031/2026', 2026, 'Segurança Viária na LMG-603 (km 12 - Santana)', 'Estudo técnico ao DER para redutor de velocidade ou radar próximo à Comunidade de Santana.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-09-21T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '032/2026', 2026, 'Pavimentação da Rua Antônio Correia Silva (Riacho da Cruz)', 'Inclusão no cronograma de pavimentação até a ponte próxima a Zé Bodão.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-09-21T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'motion', '033/2026', 2026, 'Voto de Pesar — José Pimenta dos Santos (Rê Pimenta)', 'Homenagem póstuma ao morador da Comunidade de Umburana (falecimento em 20/09/2026).', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-09-21T10:00:00Z')
ON CONFLICT DO NOTHING;
