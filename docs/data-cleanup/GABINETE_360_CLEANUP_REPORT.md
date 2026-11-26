# Relatório Final de Limpeza — Gabinete Digital 360°

**Data:** 2026-11-26  
**Escopo Executado:** Código-fonte (`apps/client`, `apps/master`, `supabase/`).  
**Status:** Limpeza de código e segregação de scripts concluídas.

---

## 1. Resumo
Foram removidos os mocks centralizados, fallbacks artificiais de tenant piloto, badges de demonstração no frontend e segregados os scripts SQL destrutivos/piloto, preservando integralmente a estrutura do sistema e a base oficial do **Vereador Bill do Barreiro (Januária-MG)**.

## 2. Código e Mocks Removidos / Refatorados
- **Removido:** `apps/client/src/lib/mock-data.ts` (dados fictícios da `Vereadora Mariana Costa / Santos-SP`).
- **Criado:** `apps/client/src/lib/types/domain.ts` apenas com as interfaces de tipagem, atualizando os imports em `agenda`, `cidadaos`, `demandas`, `equipe` e `tarefas`.
- **Removido:** Badges `<Badge variant="green">Ambiente Demonstração</Badge>` em `equipe`, `fiscalizacao`, `legislativo`, `participacao` e `tarefas`.

## 3. Fallbacks Corrigidos
- `apps/client/src/lib/actions/demands.ts`: Removidas as constantes `PILOT_ORG_ID` e `PILOT_WORKSPACE_ID`. Quando o workspace ativo não é encontrado, `resolveUserTenant` retorna `null` em vez de assumir um tenant piloto.

## 4. Seeds e Scripts Segregados
- Movidos para `supabase/seeds-dev-only/` com aviso explícito (`README.md`) para impedir execução acidental em produção:
  - `005_reset_demo_data_and_force_global_logout.sql`
  - `SEED_INICIAL_PILOTO.sql`
  - `CORRECAO_E_SEED_FINAL.sql`
- **Preservado:** `supabase/SEED_VEREADOR_BILL_JANUARIA.sql` (base oficial).

## 5. Dados Preservados (Bill do Barreiro)
- Organização `11111111-1111-4111-8111-111111110001`
- Workspace `22222222-2222-4222-8222-222222220001`
- Usuário `e48c69ce-c99d-40f0-875f-13735a5fc235` (`bill.barreiro@gabinete360.app`)
- 17 itens legislativos reais (2025–2026)

## 6. Pendências
- **Banco Supabase Remoto:** A verificação e eventual `DELETE` de registros fictícios no banco remoto e buckets do Storage dependem de conexão/credenciais administrativas no ambiente Supabase.
- **Arrays `INITIAL_*`:** As constantes `INITIAL_*` nas páginas de `apps/client` (`denuncias`, `fiscalizacao`, `legislativo`, `participacao`) e `apps/master` (`administradores`, `auditoria`, `clientes`, `monitoramento`, `organizacoes`, `planos`, `provisionamento`, `suporte`) permanecem mapeadas em `GABINETE_360_CLEANUP_PLAN.md` para substituição gradual conforme a integração com as tabelas reais do Supabase for ativada em cada tela.
