# BACKLOG TÉCNICO — GABINETE DIGITAL 360°

| ID | Prioridade | Módulo | Problema | Correção | Dependência | Teste | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | MASTER Auth | Bypass de auth e MFA via cookies `master_admin_auth` e `master_mfa_verified` | Exigir `user !== null` e verificação real de AAL2/sessão no servidor | Nenhuma | Teste de middleware sem sessão | 🟢 Concluído |
| SEC-002 | P0 | WhatsApp | Webhook `/api/whatsapp/webhook` aceita requisições sem secret se `WHATSAPP_WEBHOOK_SECRET` não estiver definida | Falhar fechado (retornar 500/401) quando secret não configurado | Nenhuma | Teste POST sem header/secret | 🟢 Concluído |
| SEC-003 | P0 | Portal Público | `/api/public/intake` usa fallback hardcoded `a0000000-...` para `organization_id` | Exigir `organization_id` válido (UUID) ou `tenantSlug` resolvido e validar com Zod | Nenhuma | Teste POST sem `organization_id` | 🟢 Concluído |
| SEC-004 | P1 | Assinatura 360° | `/api/signature/request` não persiste no banco e não valida `membership` | Validar `membership` ativo e persistir solicitação/auditoria no Supabase | SEC-001 | Teste de persistência e 403 | 🟢 Concluído |
| SEC-005 | P1 | IA | `/api/ia/assist` não valida `membership`/`organization_id` nem possui rate limit | Validar `membership` ativo e aplicar limite de requisições | Nenhuma | Teste 403 sem membership | 🟢 Concluído |
| QA-001 | P2 | CI/CD | `apps/client` e `apps/master` sem script `lint` | Adicionar script `lint` (`next lint`) e validar no CI | Nenhuma | `turbo run lint` | 🟢 Concluído |
| QA-002 | P2 | Testes | Suíte E2E atual é apenas simulação em memória | Adicionar testes reais de API/RLS/Auth | SEC-001..005 | Execução da suíte | 🟢 Concluído |
