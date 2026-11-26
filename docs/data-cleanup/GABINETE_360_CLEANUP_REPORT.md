# Relatório Final de Limpeza — Gabinete Digital 360°

**Data:** 2026-11-26  
**Escopo Executado:** Repositório (`apps/client`, `apps/master`, `supabase/`) e Banco de Dados Supabase (`efughosfkbirbjaqwyya`).  
**Status:** **CONCLUÍDO**

---

## 1. Resumo
Auditoria, inventário, segregação de scripts, limpeza de código e limpeza do banco de dados concluídas com preservação integral da base oficial do **Vereador Bill do Barreiro (Januária-MG)**.

## 2. Código e Mocks Removidos / Refatorados
- **Removido:** `apps/client/src/lib/mock-data.ts` (dados fictícios da *Vereadora Mariana Costa / Santos-SP*).
- **Criado:** `apps/client/src/lib/types/domain.ts` apenas com as interfaces de tipagem, atualizando os imports em `agenda`, `cidadaos`, `demandas`, `equipe` e `tarefas`.
- **Removido:** Badges `<Badge variant="green">Ambiente Demonstração</Badge>` em `equipe`, `fiscalizacao`, `legislativo`, `participacao` e `tarefas`.
- **Substituído por Estado Vazio (`[]`):** Estados iniciais fictícios (`INITIAL_*`) removidos em:
  - `apps/client`: `denuncias`, `fiscalizacao`, `legislativo`, `participacao`.
  - `apps/master`: `administradores`, `auditoria`, `clientes`, `monitoramento`, `organizacoes`, `provisionamento`, `suporte`.

## 3. Fallbacks Corrigidos
- `apps/client/src/lib/actions/demands.ts`: Removidas as constantes `PILOT_ORG_ID` e `PILOT_WORKSPACE_ID`. `resolveUserTenant` retorna `null` caso não haja workspace ativo.

## 4. Seeds e Scripts Segregados
- Movidos para `supabase/seeds-dev-only/` com aviso explícito (`README.md`) para impedir execução acidental em produção:
  - `005_reset_demo_data_and_force_global_logout.sql`
  - `SEED_INICIAL_PILOTO.sql`
  - `CORRECAO_E_SEED_FINAL.sql`
- **Preservado:** `supabase/SEED_VEREADOR_BILL_JANUARIA.sql`.

## 5. Banco de Dados Supabase (`efughosfkbirbjaqwyya`)
- **Removido:** Organização fictícia *Gabinete Mariana Costa* (`a0000000-0000-0000-0000-000000000001`), seus 4 registros em `public.departments` e seu workspace.
- **Preservado (Base Oficial):**
  - Organização `11111111-1111-4111-8111-111111110001` (*Gabinete Vereador Bill do Barreiro do Alegre - Januária/MG*)
  - Organização `11111111-1111-4111-8111-111111110002` (*Câmara Municipal de Januária - MG* — mantida por decisão do usuário)
  - Usuários `bill.barreiro@gabinete360.app` e `diogosrodrigues92@gmail.com`
  - 17 itens legislativos reais (2025–2026) em `public.legislative_items`.

## 6. Validação Técnica
- `tsc --noEmit` executado em `apps/client` e `apps/master` com sucesso (código de saída `0`).
- Ponto de restauração no Git criado: commit `bec5bff` e tag `pre-db-cleanup-2026-11-26`.
