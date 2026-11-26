-- ============================================================================
-- SEED COMPLEMENTAR: Vereador Bill do Barreiro do Alegre (Januária - MG)
-- Documentos adicionais extraídos de: GOOGLE DRIVE\VEREADOR BILL
-- ============================================================================

INSERT INTO public.legislative_items (organization_id, workspace_id, type, number, year, title, summary, status, created_by, created_at)
VALUES
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'bill_project', 'EI 003/2026', 2026, 'Emenda Impositiva nº 03/2026 — Vereador Bill', 'Destinação de recursos via Emenda Impositiva ao orçamento municipal de Januária.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-03-01T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '005/2026', 2026, 'Indicação 005/2026', 'Ofício para Indicação 005/2026 (assinado) protocolada na Câmara Municipal de Januária.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-02-20T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'indication', '006/2026', 2026, 'Indicação 006/2026 — Recuperação de Estradas', 'Solicitação de recuperação de estradas rurais no município de Januária.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-02-25T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'motion', '018/2025', 2025, 'Voto de Pesar — Ofício 018', 'Moção de Pesar protocolada pelo gabinete do Vereador Bill do Barreiro.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2025-10-01T10:00:00Z'),
  ('11111111-1111-4111-8111-111111110001', '22222222-2222-4222-8222-222222220001', 'bill_project', 'COMP-ABAFADOR', 2026, 'Projeto Complementar — Abafador Auricular', 'Projeto complementar para fornecimento/uso de abafadores auriculares.', 'draft', 'e48c69ce-c99d-40f0-875f-13735a5fc235', '2026-04-01T10:00:00Z')
ON CONFLICT DO NOTHING;
