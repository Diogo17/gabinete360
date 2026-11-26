# PLANO DE TESTES — GABINETE DIGITAL 360°

## 1. Situação Atual
- A suíte `tests/e2e/harness/runner.ts` executa **102 testes de contrato (620 assertions)** em 158ms usando simulações em memória.
- `tsc --noEmit` passa em `apps/client` e `apps/master`.
- Não há testes unitários/integração reais contra endpoints Next.js ou Supabase RLS.

## 2. Estratégia de Testes por Camada
1. **Typecheck & Lint:** `tsc --noEmit` e `next lint` em `apps/client` e `apps/master`.
2. **Testes de Segurança (Ciclo 1):**
   - `MASTER` middleware: rejeitar requisições com cookies forjados `master_admin_auth=true` sem sessão Supabase.
   - `WhatsApp` webhook: rejeitar `POST` quando `WHATSAPP_WEBHOOK_SECRET` não estiver configurada ou quando o segredo for inválido.
   - `Public Intake`: rejeitar `POST` sem `organization_id` válido (sem fallback hardcoded).
3. **Testes de Autorização & Multi-Tenant (Ciclo 2–3):**
   - Verificar `401` sem sessão e `403` sem `membership` ativo em `/api/ia/assist` e `/api/signature/request`.
   - Verificar isolamento cross-tenant em queries e políticas RLS.
4. **Testes E2E Reais (Ciclo 3+):**
   - Fluxos principais de Demandas, Cidadãos, Legislativo, WhatsApp e Master Control Plane.
