# AUDITORIA COMPLETA — GABINETE DIGITAL 360°

**Data:** 2026-11-26  
**Escopo:** Auditoria técnica, funcional, de segurança, multi-tenant, RLS, qualidade, performance e integrações (Etapas A–C, sem alterações no código-fonte).

---

## 1. Resumo Executivo

O **Gabinete Digital 360°** é um monorepo `pnpm` + `Turborepo` composto por duas aplicações Next.js 15 (`apps/client` e `apps/master`), três pacotes compartilhados (`packages/config`, `packages/types`, `packages/ui`), migrations SQL em `supabase/` (Control Plane + Operational Plane + WhatsApp) e uma suíte de testes de contrato em `tests/e2e/`.

### Baseline Técnico Observado
- **Typecheck (`tsc --noEmit`):** PASSOU em `apps/client` e `apps/master` (código de saída `0`).
- **Lint (`pnpm turbo run lint`):** Não configurado nos `package.json` de `apps/client` e `apps/master` (não há script `"lint"` nas aplicações).
- **Suíte E2E (`node tests/e2e/harness/runner.ts`):** 102/102 testes passaram (620 assertions em 158ms) — **testes baseados em contratos e simulações em memória**, sem validação real contra HTTP/Next.js ou PostgreSQL/Supabase.
- **Git status:** Existem alterações locais não commitadas em `.env.example`, `.github/workflows/ci.yml`, rotas de API (`ia/assist`, `signature/request`, `whatsapp/*`), `demands.ts`, `connections.ts`, `privacidade/` e `20261126_whatsapp_rls_hardening.sql`.

---

## 2. Arquitetura Atual

- **Gerenciador / Monorepo:** `pnpm@12.21.0`, `turbo@^2.3.3`, `typescript@^5.7.2`, Node `>=20.0.0` (CI usa Node 22).
- **Aplicações:**
  - `apps/client` (`@gabinete360/client`, porta 3000): Portal operacional do gabinete parlamentar, portal público (`/portal`, `/privacidade`, `/validar-assinatura`, `/assinar/[id]`) e APIs (`/api/ia/assist`, `/api/public/intake`, `/api/signature/request`, `/api/signature/verify`, `/api/whatsapp/*`).
  - `apps/master` (`@gabinete360/master`, porta 3001): Control Plane SaaS (`/dashboard`, `/clientes`, `/organizacoes`, `/planos`, `/planos-modulos`, `/administradores`, `/provisionamento`, `/monitoramento`, `/auditoria`, `/suporte`, `/login`, `/mfa`).
- **Pacotes:**
  - `packages/ui`: Design System compartilhado (tokens CSS em `tokens.css`, `app-shell`, `stat-card`, `table`, `modal`, `states/*`, `demo-watermark`).
  - `packages/types`: Tipos compartilhados de domínio (Control Plane e Operational Plane).
  - `packages/config`: Configurações compartilhadas (ESLint, Tailwind, TypeScript).

---

## 3. Inventário de Aplicações e Módulos

### `apps/client` (21 páginas)
- **Autenticação e Raiz:** `/`, `/login`
- **Operacional Core & CRM:** `/dashboard`, `/cidadaos`, `/demandas`, `/agenda`, `/tarefas`, `/equipe`
- **Legislativo & Fiscalização:** `/legislativo`, `/legislativo/destinatarios`, `/legislativo/januaria`, `/legislativo/protocolos`, `/fiscalizacao`
- **Comunicação & IA:** `/whatsapp`, `/ia`
- **Participação, Denúncias & Público:** `/participacao`, `/denuncias`, `/portal`, `/privacidade`, `/assinar/[id]`, `/validar-assinatura`

### `apps/master` (13 páginas)
- **Auth & MFA:** `/login`, `/mfa`
- **Control Plane:** `/`, `/dashboard`, `/clientes`, `/organizacoes`, `/planos`, `/planos-modulos`, `/administradores`, `/provisionamento`, `/monitoramento`, `/auditoria`, `/suporte`

---

## 4. Inventário de APIs e Server Actions

### APIs (`apps/client/src/app/api/`)
1. `POST /api/ia/assist` — Assistente IA (Gemini 2.5 Flash). Autentica `user`, mas **não valida `membership`/`organization_id` nem possui rate limit/cota**.
2. `POST /api/public/intake` — Recepção pública de demandas. **Sem rate limit, sem validação Zod, e usa fallback hardcoded `organization_id || "a0000000-0000-0000-0000-000000000001"`**.
3. `POST /api/signature/request` — Criação de solicitação de assinatura. Autentica `user`, mas **não persiste no banco de dados** (gera UUID/hash/auditEvent apenas em memória) e **não valida `membership`/`organization_id`**.
4. `POST /api/signature/verify` — Verificação pública de assinatura por código opaco ou hash SHA-256.
5. `GET/POST/DELETE /api/whatsapp/instance` — Gestão de instância WhatsApp. Valida `user` e `membership` ativo, usa `SUPABASE_SERVICE_ROLE_KEY`.
6. `POST /api/whatsapp/send` — Envio de mensagem WhatsApp. Valida `user`, `membership` ativo e schema Zod.
7. `POST /api/whatsapp/webhook` — Receptor de webhooks WhatsApp. **Se `WHATSAPP_WEBHOOK_SECRET` não estiver definida, aceita requisições sem autenticação (`if (webhookSecret)`)**.

### Server Actions
- `apps/client/src/lib/actions/cabinet-management.ts`, `demands.ts`, `profile.ts`
- `apps/master/src/lib/actions/connections.ts`, `profile.ts`

---

## 5. Auditoria de Segurança, Multi-Tenant e RLS (Achados Confirmados)

1. **[P0] Bypass de Autenticação e MFA no Middleware do MASTER** (`apps/master/src/middleware.ts`, linhas 22-23):
   - `hasAdminAuth = user !== null || request.cookies.get("master_admin_auth")?.value === "true"`
   - `hasMfaVerified = request.cookies.get("master_mfa_verified")?.value === "true"`
   - Qualquer cliente pode enviar esses cookies falsificados no header HTTP e acessar rotas administrativas do MASTER sem sessão Supabase válida.
2. **[P0] Webhook WhatsApp Fail-Open** (`apps/client/src/app/api/whatsapp/webhook/route.ts`, linhas 17-26):
   - A verificação do segredo só ocorre `if (webhookSecret)`. Em ambiente sem `WHATSAPP_WEBHOOK_SECRET`, qualquer terceiro pode injetar eventos falsos (`MESSAGES_UPSERT`, `CONNECTION_UPDATE`, `QRCODE_UPDATED`).
3. **[P0] Fallback de Tenant Hardcoded em Intake Público** (`apps/client/src/app/api/public/intake/route.ts`, linha 30):
   - `organization_id: organization_id || "a0000000-0000-0000-0000-000000000001"`. Permite inserção em tenant padrão hardcoded ou em qualquer UUID arbitrário sem validar se a organização existe/aceita portal público.
4. **[P1] API de Assinatura Não Persiste Dados** (`apps/client/src/app/api/signature/request/route.ts`):
   - Retorna `signatureRequestId` e `auditEvent` gerados em memória sem gravar no Supabase, além de não verificar `membership` do usuário.
5. **[P1] API de IA sem Isolamento de Tenant, Rate Limit ou Controle de Custo** (`apps/client/src/app/api/ia/assist/route.ts`):
   - Não verifica `membership` ativo nem registra consumo/auditoria por organização.
6. **[P2] CI/CD com Lint Inoperante e Fallback de Chaves** (`.github/workflows/ci.yml`, `apps/client/package.json`, `apps/master/package.json`):
   - `turbo run lint` não executa ESLint porque os `package.json` das apps não definem script `"lint"`.

---

## 6. Pontos Positivos

- Estrutura de monorepo limpa com separação clara entre `client`, `master` e `packages/ui`.
- TypeScript estrito passando (`tsc --noEmit` com exit code 0 em ambas as apps).
- Hardening recente de RLS para WhatsApp (`supabase/migrations/20261126_whatsapp_rls_hardening.sql`) substituindo `user_metadata` por verificação em `memberships`.
- Design System consistente em `packages/ui` com tokens CSS e estados de feedback (`SkeletonLoader`, `EmptyState`, `ErrorState`, `ForbiddenState`).

---

## 7. Conclusão

O sistema possui base arquitetural sólida, porém apresenta **3 vulnerabilidades P0 confirmadas** (bypass de auth/MFA via cookie no MASTER, webhook WhatsApp fail-open e fallback hardcoded de tenant no intake público) e **lacunas P1** (persistência da API de assinatura, controle de tenant/cota na IA, testes reais de integração/RLS). O Plano Master de Correção prioriza o fechamento imediato dos P0 no Ciclo 1 antes de avançar para os demais ciclos.
