# Gabinete Digital 360° — Pacote SQL v1 (pré-implementação)

**Versão:** 1.0  
**Base:** DER v2.0 — Painel Master / Control Plane  
**Status:** pacote inicial de referência para revisão e testes locais.  
**Não aplicado:** nenhum projeto Supabase foi conectado, alterado ou migrado.

## 1. Objetivo e limites

Este pacote materializa a fundação de dois projetos Supabase independentes:

- `control_plane`: administração da DM IA Studio, clientes SaaS, planos, módulos, provisionamento, auditoria e suporte temporário.
- `operational_plane`: dados dos gabinetes/Câmaras, memberships e conteúdo operacional multi-tenant.

Não existe FK entre projetos. `platform_tenant_id` é um identificador externo opaco, sincronizado por API backend autenticada, com idempotência e assinatura. O Control Plane não consulta diretamente conteúdo operacional.

## 2. Conteúdo

- `control_plane/migrations/001_control_plane_foundation.sql`: tabelas centrais do Painel Master.
- `operational_plane/migrations/001_operational_foundation.sql`: núcleo multi-tenant e exemplos iniciais de demandas e denúncias segregadas.
- `tests/control_plane/001_control_plane_security_test.sql`: testes estruturais de RLS e grants.
- `tests/operational_plane/001_operational_security_structure_test.sql`: testes estruturais de RLS, FKs e índices.
- `tests/operational_plane/002_rls_behavior_test_template.sql`: roteiro pgTAP para teste comportamental com usuários de teste provisionados no Auth local.
- `TEST_MATRIX.md`: matriz de cenários positivos e negativos obrigatórios.
- `IMPLEMENTATION_RUNBOOK.md`: sequência segura de validação local.

## 3. Decisões de segurança incorporadas

1. RLS habilitado em todas as tabelas criadas neste pacote.
2. No Control Plane, `anon` e `authenticated` não recebem acesso direto às tabelas. O backend privado valida identidade Master, MFA, papel, permissão, escopo e motivo; só então executa a operação administrativa com credencial privilegiada mantida exclusivamente no servidor.
3. No Plano Operacional, as tabelas de tenant têm políticas específicas iniciais. A fundação não representa todas as permissões funcionais do produto.
4. Denúncias e concessões de acesso a denúncias ficam segregadas. Não há leitura ampla por membership simples.
5. O portal público não recebe INSERT direto nas tabelas. Intake público será feito por endpoint server-side com validação, rate limit, CAPTCHA/antibot quando aplicável, idempotência e minimização de dados.
6. Não há `is_master`, `super_admin` ou papel da DM IA Studio no banco operacional.
7. `service_role`/secret key nunca vai para navegador, app móvel, repositório ou variável `NEXT_PUBLIC_`.
8. Logs não devem conter tokens, senhas, segredos, conteúdo integral de denúncia ou payloads pessoais desnecessários.

## 4. O que ainda não está coberto

Este é o primeiro corte SQL, não o banco integral de todos os 20 módulos. Antes de produção ainda serão necessárias migrations específicas para CRM completo, anexos/Storage, mensagens e WhatsApp, legislativo, agenda, tarefas, retenção, privacidade, integrações, billing, domínio personalizado, filas, observabilidade e políticas granulares por permissão/workspace/departamento.

O schema de denúncias aqui é deliberadamente mínimo e restritivo. A política definitiva depende da definição de papéis de triagem, apuração, corregedoria/controle e regras legais de cada órgão.

## 5. Como usar

Não executar em projeto remoto. Primeiro criar dois projetos locais independentes com Supabase CLI, revisar os SQL, ajustar a configuração de schemas e executar os testes locais. Ver `IMPLEMENTATION_RUNBOOK.md`.

A CLI Supabase v3 mudou os padrões de destino: comandos de banco usam o stack local por padrão; operações remotas exigem `--remote` e confirmação. O runbook evita comandos remotos.


# Matriz de testes obrigatórios — Gabinete Digital 360°

| ID | Plano | Ator | Cenário | Resultado esperado |
|---|---|---|---|---|
| CP-01 | Control Plane | anon | consultar tenants | negado por grants |
| CP-02 | Control Plane | authenticated não Master | consultar logs/auditoria | negado por grants |
| CP-03 | Control Plane | Master sem permissão `tenant.suspend` | suspender tenant | backend nega; evento `denied` auditado |
| CP-04 | Control Plane | Master com papel expirado | operação administrativa | backend nega |
| CP-05 | Control Plane | Master sem MFA/AAL exigido | ação crítica | backend exige step-up MFA |
| CP-06 | Control Plane | operador | provisionar com idempotency key repetida | não cria recursos duplicados |
| CP-07 | Control Plane | suporte | grant JIT expirado/revogado | acesso operacional bloqueado |
| CP-08 | Control Plane | Master | consultar dados pessoais de cidadão/denúncia | sem endpoint de leitura genérica; negado |
| OP-01 | Operacional | user A | consultar demandas do tenant A | somente tenant A |
| OP-02 | Operacional | user A | consultar demandas do tenant B | zero linhas/negado |
| OP-03 | Operacional | user A | inserir demanda com organization_id B | negado |
| OP-04 | Operacional | membership suspenso | consultar tenant | zero linhas/negado |
| OP-05 | Operacional | usuário sem grant | consultar denúncia | zero linhas/negado |
| OP-06 | Operacional | usuário com grant ativo | consultar denúncia concedida | somente recurso concedido |
| OP-07 | Operacional | usuário com grant expirado | consultar denúncia | zero linhas/negado |
| OP-08 | Operacional | anon | inserir denúncia via tabela | negado; intake somente backend |
| OP-09 | Operacional | usuário autenticado | criar `report_access_grants` | negado |
| OP-10 | Operacional | user A | forjar workspace de outro tenant | FK composta / RLS impedem |
| INT-01 | Integração | comando Master replay | reprocessar webhook/comando | idempotência impede duplicidade |
| INT-02 | Integração | API não autorizada | chamar endpoint de provisionamento | 401/403; sem mutação |
| INT-03 | Integração | sincronização falha | atualizar entitlement | não concede acesso por padrão; alerta |
| OBS-01 | Observabilidade | operador | logar erro | sem token, senha, conteúdo de denúncia ou PII desnecessária |
| DR-01 | Recuperação | equipe técnica | restaurar backup em ambiente isolado | RPO/RTO medidos e evidência registrada |

## Critério de aprovação

Nenhuma implementação em produção antes de:
- todos os casos críticos passarem;
- testes de isolamento A/B passarem via clientes reais (`anon` e `authenticated`);
- grants e policies serem revisados em conjunto;
- Advisors de segurança/performance serem revisados;
- revisão manual das APIs server-side que usam `service_role`;
- aprovação do modelo de suporte JIT e da política de dados/retention.


# Runbook de validação local (sem produção)

## Pré-requisitos

- Dois projetos locais Supabase independentes: um para `control_plane`, outro para `operational_plane`.
- Supabase CLI instalada e versão registrada.
- Docker ou runtime local compatível.
- Repositório Git com migrations e testes versionados.
- Nenhuma chave/URL de produção nos arquivos `.env` locais.

## Passos

1. Criar um diretório/repositório separado para cada plano.
2. Inicializar cada projeto com `supabase init`.
3. Conferir a versão instalada com `supabase --version`.
4. Conferir a sintaxe disponível com `supabase migration --help`, `supabase test --help` e `supabase start --help`.
5. Criar a migration com `supabase migration new control_plane_foundation` e copiar o conteúdo do arquivo correspondente para o arquivo gerado pela CLI. Repetir para `operational_plane_foundation` no outro projeto.
6. Iniciar o stack local com `supabase start`.
7. Aplicar migrations somente no banco local usando o fluxo local da CLI.
8. Copiar os testes para `supabase/tests/` em cada projeto.
9. Executar `supabase test db` localmente.
10. Executar testes comportamentais com usuários Auth de teste e fixtures para dois tenants.
11. Executar os cenários backend para autorização Master, MFA, JIT, idempotência e acesso entre projetos.
12. Revisar SQL, grants, policies, funções, views, Storage e logs.
13. Rodar Security/Performance/Health Advisors e resolver findings relevantes.
14. Registrar resultados, versões, commit e evidências de teste.

## Aviso CLI v3 (22/11/2026)

A CLI v3 usa o stack local como destino padrão para comandos de banco. Para qualquer operação remota, a CLI exige `--remote` e confirmação explícita; em CI também pode exigir `--yes`. Este runbook não inclui comandos remotos intencionalmente.

## Não fazer

- Não usar `service_role` no browser.
- Não apontar o ambiente local para projeto de produção.
- Não aplicar migrations em projeto remoto durante a fase de teste.
- Não usar dados reais de cidadãos ou denúncias em fixtures.
- Não tratar um teste estrutural de RLS como prova suficiente de isolamento comportamental.
- Não conceder acesso Master direto ao banco operacional.
