# Auditoria Completa de Dados Fictícios — Gabinete Digital 360°

**Data da Auditoria:** 2026-11-26  
**Escopo:** Repositório completo (`apps/client`, `apps/master`, `packages/*`, `supabase/*`, `tests/*`), armazenamento cliente e scripts SQL.  
**Status:** FASE 1 CONCLUÍDA (Sem alterações destrutivas).

---

## 1. Resumo Executivo

A auditoria identificou dados fictícios, demonstrativos, fallbacks artificiais e seeds de piloto distribuídos entre o frontend (`apps/client` e `apps/master`), componentes de UI (`packages/ui`) e scripts SQL (`supabase/`).

- **Arquivos de Mock Centralizados:** 1 (`apps/client/src/lib/mock-data.ts`)
- **Páginas Client com Dados Hardcoded (`INITIAL_*` / `Demo*`):** 9 páginas (`agenda`, `cidadaos`, `demandas`, `denuncias`, `equipe`, `fiscalizacao`, `legislativo`, `participacao`, `tarefas`)
- **Páginas Master com Dados Hardcoded (`INITIAL_*`):** 8 páginas (`administradores`, `auditoria`, `clientes`, `monitoramento`, `organizacoes`, `planos`, `provisionamento`, `suporte`)
- **Componentes UI com Marca d'Água Demo:** 3 (`demo-watermark.tsx`, `topbar.tsx`, `app-shell.tsx`)
- **Fallbacks Artificiais em Server Actions:** 1 (`apps/client/src/lib/actions/demands.ts` com `PILOT_ORG_ID` / `PILOT_WORKSPACE_ID`)
- **Scripts SQL de Seed/Reset:** 4 (`SEED_INICIAL_PILOTO.sql`, `CORRECAO_E_SEED_FINAL.sql`, `005_reset_demo_data_and_force_global_logout.sql`, `SEED_VEREADOR_BILL_JANUARIA.sql`)
- **Armazenamento Cliente:** Apenas chaves estruturais legítimas (`gabinete360_theme` e `gabinete360_superuser_panel_choice`).

---

## 2. Local Storage

| Chave | Arquivo | Classificação | Destino |
| :--- | :--- | :--- | :--- |
| `gabinete360_theme` | `packages/ui/src/components/app-shell/topbar.tsx` | **CATEGORIA D — Estrutural** | **PRESERVAR** |

---

## 3. Session Storage

| Chave | Arquivo | Classificação | Destino |
| :--- | :--- | :--- | :--- |
| `gabinete360_superuser_panel_choice` | `apps/master/src/components/master-shell.tsx`, `superuser-panel-selector.tsx`, `apps/master/src/lib/auth/context.tsx` | **CATEGORIA D — Estrutural** | **PRESERVAR** |

---

## 4. IndexedDB e Outros Mecanismos

- **IndexedDB:** Nenhum uso identificado no código-fonte.
- **Cookies / Service Workers / Cache Storage:** Nenhum dado fictício persistido identificado no código-fonte.

---

## 5. Supabase (Schemas, Tabelas e Registros)

As tabelas estruturais estão definidas em `supabase/control-plane/migrations/` e `supabase/operational-plane/migrations/`.  
**Nota:** Como a auditoria foi realizada no código-fonte sem acesso direto de escrita/consulta destrutiva ao banco remoto, a verificação de registros em runtime deve ser feita via consulta `SELECT` antes da execução de qualquer `DELETE`.

---

## 6. Seeds e Scripts SQL

| Arquivo | Classificação | Risco | Destino |
| :--- | :--- | :--- | :--- |
| `supabase/SEED_VEREADOR_BILL_JANUARIA.sql` | **CATEGORIA A — Oficial** | Baixo | **PRESERVAR** (Base oficial) |
| `supabase/SEED_INICIAL_PILOTO.sql` | **CATEGORIA B — Fictício** | Alto se rodar em prod | **SEGREGAR / BLOQUEAR EM PROD** |
| `supabase/CORRECAO_E_SEED_FINAL.sql` | **CATEGORIA B — Fictício** | Alto se rodar em prod | **SEGREGAR / BLOQUEAR EM PROD** |
| `supabase/005_reset_demo_data_and_force_global_logout.sql` | **CATEGORIA B/C — Perigoso** | Crítico (faz `TRUNCATE` e apaga `auth.users` exceto `diogosrodrigues92@gmail.com`, o que apagaria o Bill do Barreiro) | **BLOQUEAR / REESTRUTURAR** |

---

## 7. Mocks

- `apps/client/src/lib/mock-data.ts`: Contém `DEMO_ORGANIZATION_ID = "org-gabinete-mariana"`, `DEMO_WORKSPACE_ID = "wks-santos-01"`, `DEMO_MANDATE_TITLE = "Vereadora Mariana Costa"`, `DEMO_MANDATE_CITY = "Santos · SP"`, além de arrays `DEMO_CITIZENS`, `DEMO_DEMANDS`, `DEMO_AGENDA_EVENTS`, `DEMO_TEAM_MEMBERS`, `DEMO_TASKS`, `DEMO_TERRITORIAL_STATS`.
- Importado por: `agenda/page.tsx`, `cidadaos/page.tsx`, `demandas/page.tsx`, `equipe/page.tsx`, `tarefas/page.tsx`.

---

## 8. Fallbacks

- `apps/client/src/lib/actions/demands.ts` (linhas 22-24 e 60): Define `PILOT_ORG_ID = "a0000000-0000-0000-0000-000000000001"` e `PILOT_WORKSPACE_ID = "c0000000-0000-0000-0000-000000000001"` como fallback quando o workspace não é encontrado. Deve retornar erro explícito ou estado vazio.

---

## 9. Dashboards e Páginas com Dados Hardcoded

### `apps/client`
- `denuncias/page.tsx`: `INITIAL_REPORTS`
- `fiscalizacao/page.tsx`: `INITIAL_INSPECTIONS` + `<Badge variant="green">Ambiente Demonstração</Badge>`
- `legislativo/page.tsx`: `INITIAL_LEGISLATIVE` + `<Badge variant="green">Ambiente Demonstração</Badge>`
- `participacao/page.tsx`: `INITIAL_PROPOSALS` + `<Badge variant="green">Ambiente Demonstração</Badge>`
- `equipe/page.tsx` e `tarefas/page.tsx`: `<Badge variant="green">Ambiente Demonstração</Badge>`

### `apps/master`
- `administradores/page.tsx`: `INITIAL_ADMINS`
- `auditoria/page.tsx`: `INITIAL_AUDIT_LOGS`
- `clientes/page.tsx`: `INITIAL_CLIENTS`
- `monitoramento/page.tsx`: `INITIAL_SERVICES`
- `organizacoes/page.tsx`: `INITIAL_ORGS`
- `planos/page.tsx`: `INITIAL_TENANT_ENTITLEMENTS`
- `provisionamento/page.tsx`: `INITIAL_JOBS`
- `suporte/page.tsx`: `INITIAL_JIT_REQUESTS`

---

## 10. Arquivos e Storage

Nenhum arquivo estático de mídia fictícia foi encontrado no repositório. Os buckets do Supabase Storage devem ser auditados no ambiente remoto antes de qualquer exclusão.

---

## 11. Organizações

- **Oficial (Preservar):** `11111111-1111-4111-8111-111111110001` — `Gabinete Vereador Bill do Barreiro do Alegre - Januária/MG` (`bill-barreiro-januaria`), Tenant `33333333-3333-4333-8333-333333330001`.
- **Fictícia / Piloto (Remover/Segregar):** `org-gabinete-mariana` (`Vereadora Mariana Costa`, `Santos · SP`) e `a0000000-0000-0000-0000-000000000001` (`PILOT_ORG_ID`).

---

## 12. Usuários

- **Oficial (Preservar):** `e48c69ce-c99d-40f0-875f-13735a5fc235` (`bill.barreiro@gabinete360.app` — Edilson Alves dos Santos).
- **Master Admin (Preservar):** `diogosrodrigues92@gmail.com` (referenciado em `005_reset_demo_data_and_force_global_logout.sql`).

---

## 13. Dados Oficiais (Bill do Barreiro — Januária/MG)

Confirmados em `supabase/SEED_VEREADOR_BILL_JANUARIA.sql`:
- **Organização:** `11111111-1111-4111-8111-111111110001`
- **Workspace:** `22222222-2222-4222-8222-222222220001` (`Mandato 2025–2028`)
- **Perfil:** `Edilson Alves dos Santos (Bill do Barreiro do Alegre)`
- **Itens Legislativos (17 registros reais 2025–2026):** `013/2025`, `019/2025`, `025/2025`, `050/2025`, `026/2025`, `027/2026`, `002/2026`, `003/2026`, `011/2026`, `012/2026`, `015/2026`, `016/2026`, `008/2026`, `019/2026`, `031/2026`, `032/2026`, `033/2026`.

---

## 14. Dados Não Validados

- Registros eventualmente existentes no Supabase remoto que não pertençam à organização `11111111-1111-4111-8111-111111110001` ou aos usuários oficiais listados acima.

---

## 15. Plano de Limpeza (Resumo)

1. **Prioridade 1:** Proteger e fazer backup do banco antes de qualquer alteração.
2. **Prioridade 2:** Remover `mock-data.ts`, arrays `INITIAL_*` e badges `Ambiente Demonstração` do frontend, substituindo por estados vazios (`EmptyState`) e erros explícitos (`ErrorState`).
3. **Prioridade 3:** Remover fallback `PILOT_ORG_ID` / `PILOT_WORKSPACE_ID` em `demands.ts`.
4. **Prioridade 4:** Segregar scripts de seed/reset e bloquear execução em produção.
