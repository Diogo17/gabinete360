# PLANO MASTER DE CORREÇÃO — GABINETE DIGITAL 360°

## 1. Objetivo e Estratégia

Corrigir de forma incremental, segura e auditável os problemas identificados na auditoria, preservando integralmente a arquitetura existente, o Design System (`packages/ui`) e as funcionalidades operacionais.

## 2. Sequenciamento em Ciclos

- **Ciclo 0 — Baseline (Concluído):** Estado do Git registrado, `tsc --noEmit` validado (0 erros), suíte E2E de contrato executada (102/102).
- **Ciclo 1 — Segurança Crítica (P0):**
  - Remover bypass por cookies no `apps/master/src/middleware.ts` (exigir sessão Supabase válida + AAL2/MFA real).
  - Tornar `WHATSAPP_WEBHOOK_SECRET` obrigatório (fail-closed) em `apps/client/src/app/api/whatsapp/webhook/route.ts`.
  - Remover fallback hardcoded de `organization_id` em `apps/client/src/app/api/public/intake/route.ts`, validar com Zod e verificar organização ativa.
- **Ciclo 2 — Autorização, IA e Assinatura (P1):**
  - Validar `membership` ativo e `organization_id` em `/api/ia/assist` e `/api/signature/request`.
  - Persistir solicitações de assinatura e eventos de auditoria no Supabase em `/api/signature/request`.
  - Adicionar rate limit básico nas APIs públicas e de IA.
- **Ciclo 3 — Qualidade, Lint e Testes Reais (P1/P2):**
  - Configurar script `lint` em `apps/client` e `apps/master`.
  - Criar testes de integração/segurança reais (auth, cross-tenant, webhook fail-closed).
- **Ciclos 4 a 9 — Evolução Modular e Inovação (P2/P3):**
  - Revisão progressiva de CRM/Demandas, Legislativo/Documentos, Agenda/Fiscalização, WhatsApp/IA, Transparência e Master Control Plane.

## 3. Critérios de Aceite e Rollback

- Nenhuma correção é considerada concluída sem `tsc --noEmit`, testes específicos e registro em `docs/audit/GABINETE_DIGITAL_360_EXECUTION_LOG.md`.
- Rollback via `git revert` por commit atômico de cada tarefa.
