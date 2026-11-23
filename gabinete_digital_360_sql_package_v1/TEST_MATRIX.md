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
