# Gabinete Digital 360° — plano de construção até produção

**Versão:** 1.0 · **Data:** 22/11/2026  
**Objetivo:** converter o protótipo e os documentos atuais em um produto SaaS operacional, testável, seguro e implantável por etapas.

## 1. Diagnóstico do que existe hoje

O workspace contém documentos de produto/arquitetura, um pacote SQL v1 pré-implementação e um protótipo de dashboard em HTML, CSS e JavaScript puro. Não encontrei uma aplicação executável com framework, rotas, gestão de dependências, autenticação ou conexão a backend. O protótipo apresenta indicadores e atalhos visuais; a maior parte dos atalhos não executa fluxos persistentes.

O pacote SQL é uma fundação, não o banco de produção. O Control Plane tem tabelas para administradores, clientes, planos, módulos e operação da plataforma. O Operational Plane contém organizações, workspaces, memberships, demandas e denúncias segregadas. A própria documentação registra que faltam CRM completo, agenda, tarefas, anexos/Storage, legislativo, integrações, billing, retenção, políticas funcionais granulares e validação comportamental abrangente.

Portanto, **o estado atual não está pronto para produção**. Está pronto para servir como referência de experiência, decisões e primeiros artefatos de banco. O caminho seguro é transformar o protótipo em aplicação real e só liberar o piloto depois dos gates de produto, segurança, operação e recuperação abaixo.

## 2. Identidade visual recomendada

### Posicionamento

Uma ferramenta de trabalho público: organizada, confiável e próxima da comunidade. A interface deve ajudar a equipe a perceber o que chegou, quem é responsável e qual é o próximo passo. A marca não deve depender de ornamentos futuristas nem se anunciar como produto de IA.

### Sistema visual inicial

| Elemento | Direção recomendada |
|---|---|
| Cor principal | Verde profundo institucional, próximo de `#176B52` |
| Fundo | Cinza-esverdeado muito claro, próximo de `#F6F8F5` |
| Superfície | Branco, borda suave e sombra mínima |
| Texto | Verde quase preto, próximo de `#172B27` |
| Ênfase | Âmbar para prazo/atenção; vermelho queimado para bloqueio/urgência; azul discreto para informação |
| Tipografia | Sans-serif legível; Manrope em títulos e DM Sans em interface são a direção já usada no protótipo; hospedar fontes localmente antes de produção |
| Forma | Cantos moderados (8–12 px), ícones simples e consistentes, sem excesso de cartões |
| Densidade | Dashboard com leitura rápida; listas de trabalho priorizam assunto, responsável, estado e prazo |
| Tom de voz | Claro, respeitoso, direto e sem jargão técnico para a equipe do gabinete |

O protótipo já aponta para essa direção. Na aplicação definitiva, transformar cores, tipografia, espaçamentos, estados, botões, campos, tabelas, avisos e acessibilidade em tokens e componentes compartilhados. Confirmar contraste WCAG 2.2 AA, foco visível, teclado, rótulos acessíveis, mensagens sem depender apenas de cor e layout responsivo. Diferenciar o Master por nome, navegação e contexto de acesso; não criar uma segunda marca concorrente.

### Princípios de experiência

- A tela inicial responde: o que requer atenção, o que vence hoje e qual é o próximo compromisso?
- Ações primárias aparecem onde a pessoa está trabalhando; itens secundários ficam fora do caminho.
- Cada item operacional mostra responsável, status, prazo e histórico com linguagem consistente.
- Informações sensíveis recebem indicação discreta de acesso restrito, sem expor conteúdo em listas ou notificações.
- Estados vazio, carregando, erro, sem permissão e sucesso têm conteúdo e ação de recuperação claros.
- Dados de demonstração são marcados como demonstração; em produção não exibir dados fictícios misturados a dados reais.

## 3. Arquitetura-alvo

Separar três aplicações/ambientes de execução:

1. **Painel do cliente** — uso de gabinetes e Câmaras; autenticação de usuários operacionais; plano de dados operacional.
2. **Painel Master** — uso interno da DM IA Studio; aplicação, domínio, autenticação e Control Plane próprios.
3. **Portal público** — fase posterior; endpoints públicos server-side e superfície de dados publicada explicitamente. Não usar acesso amplo ao banco operacional.

Separar também os projetos Supabase de desenvolvimento, staging e produção. O Control Plane e o Operational Plane permanecem projetos distintos em cada ambiente. Não compartilhar cookies, identidades administrativas ou chaves entre os dois planos. Comunicação entre planos apenas por serviços backend autenticados, com assinatura, allowlist, idempotência, versão de contrato e auditoria. O Master recebe status e métricas agregadas necessárias; nunca consulta diretamente conteúdo operacional.

### Stack sugerido (decidir e registrar antes de construir)

- TypeScript, framework React com suporte a renderização server-side e rotas backend server-side, biblioteca de componentes acessíveis e CSS/tokens próprios.
- Supabase para Postgres/Auth/Storage, com um projeto independente por plano e por ambiente.
- CI com lint, typecheck, build, testes unitários, integração e testes de navegador; revisão de dependências e análise de segredos.
- Deploy em plataforma que ofereça ambientes de preview, staging e produção, proteção de secrets, logs e rollback.

Isso é uma recomendação para decisão de arquitetura, não uma descrição do que já existe. Antes de instalar ou adotar, validar experiência da equipe, hospedagem, requisitos de contratação pública, custos, residência/região de dados e necessidades de suporte. Fixar versões e lockfile.

### Estrutura de código sugerida

```text
apps/
  client/                 # painel operacional
  master/                 # painel Control Plane independente
  public-portal/          # somente quando o portal fizer parte da entrega
packages/
  design-system/          # tokens e componentes visuais comuns, sem compartilhar auth
  contracts/              # schemas e tipos de API versionados
  test-fixtures/          # dados exclusivamente sintéticos
supabase/
  control-plane/          # migrations, config e testes do plano de controle
  operational-plane/      # migrations, config e testes operacionais
docs/
  architecture/ security/ runbooks/ decisions/
```

Monorepo é opcional. Se a política de acesso exigir isolamento do código administrativo, manter repositórios separados e extrair apenas contratos/componentes seguros. Compartilhar tokens visuais não significa compartilhar sessão, banco ou autorização.

## 4. Plano passo a passo com gates

### Fase 0 — decisões de produto e operação

1. Nomear responsável de produto, técnico, segurança/privacidade e implantação.
2. Escolher o primeiro segmento: gabinete individual ou Câmara; definir o piloto e o fluxo de ponta a ponta.
3. Definir limites e regras de negócio: status de demanda, categorias, SLA, papéis, unidades, retenção, anexos, consentimento/base legal e canal de entrada.
4. Validar com usuários reais protótipo, termos usados, volume de trabalho, celular/tablet e necessidades de acessibilidade.
5. Criar ADRs para stack, multi-tenancy, auth, deploy, backup, logs, região e gestão de segredos.

**Gate:** escopo de release 1, atores, permissões e critérios de aceite aprovados. Denúncias e dados especiais ficam fora do primeiro release até política de acesso e fluxo jurídico definidos.

### Fase 1 — fundação de engenharia e ambientes

1. Criar repositório/versionamento e registrar convenções de branches, revisão e release.
2. Escolher stack final e criar aplicações separadas (cliente e Master), lint, typecheck, build e pipeline CI.
3. Preparar ambientes local, preview, staging e produção, com projetos Supabase independentes por plano e ambiente.
4. Configurar segredos pelo gerenciador de ambiente, sem arquivos `.env` versionados; publicar apenas chaves explicitamente públicas.
5. Configurar domínios, HTTPS, política de cookies, headers de segurança, CSP e proteção contra abuso nos endpoints.
6. Criar runbook de provisionamento de ambiente, restauração, rollback e rotação de chaves.

**Gate:** build reproduzível, deploy de staging automatizado e nenhum segredo no bundle, histórico Git ou logs.

### Fase 2 — identidade e autenticação

1. Implementar login, convite e recuperação de conta no Operational Plane.
2. Definir onboarding seguro de organização, primeiro administrador e membros.
3. Implementar auth separada do Master; MFA obrigatório para todos os administradores e step-up para operações críticas.
4. Aplicar ciclo de vida de sessão, revogação em suspensão, expiração adequada e proteção contra enumeração de contas.
5. Implementar RBAC: permissões nomeadas, escopo de organização/workspace/departamento e checagem server-side em cada operação.
6. Não autorizar com metadados editáveis pelo usuário. Considerar atraso de atualização de claims se claims de app forem usadas.

**Gate:** testes de login, convite, recuperação, MFA, suspensão, revogação e autorização aprovados para os perfis de cada plano.

### Fase 3 — banco, isolamento e APIs

1. Revisar o pacote SQL v1 e quebrar migrations por domínio e ordem de dependência; consolidar migrations num fluxo versionado por projeto.
2. Completar schema operacional para profiles, papéis/permissões, categorias, demandas, atribuições, eventos, prazos, tarefas, agenda e anexos conforme o release definido.
3. Completar Control Plane para estados de ciclo de vida, provisionamento idempotente, contratos de módulo, eventos, auditoria e observabilidade sem replicar conteúdo cidadão.
4. Definir constraints compostas para impedir referência cruzada de organização/workspace e índices apoiados por consultas reais.
5. Aplicar RLS em toda tabela exposta; grants mínimos; policies específicas por operação e perfil. Revisar views (security invoker), funções privilegiadas, triggers e Storage.
6. Criar APIs server-side com schemas de entrada, limite de tamanho, autorização, rate limit e respostas sem vazamento de dados.
7. Criar outbox/eventos assinados para sincronização entre Control e Operational Plane; implementar retries, idempotency key, versionamento e reconciliação.
8. Definir paginação, ordenação, busca, filtros, concorrência otimista e tratamento de conflito.

**Gate:** migrations locais reproduzíveis; testes de dois tenants A/B demonstram isolamento em SELECT/INSERT/UPDATE/DELETE/Storage; nenhuma rota client pode alterar organization/role arbitrariamente.

### Fase 4 — MVP operacional funcional

Construir por fatias verticais, com UI, API, banco, autorização e auditoria em cada fluxo:

1. Shell responsivo, navegação e design system.
2. Organização, workspace, membros e permissões essenciais.
3. Lista/detalhe/criação de atendimento, busca e filtros.
4. Atribuição, alteração de status, histórico de eventos e prazo.
5. Agenda semanal/mensal, criação e edição de compromissos.
6. Tarefas da equipe, atribuição, estado e vencimento.
7. Upload privado de anexos com limites e autorização.
8. Dashboard com consultas definidas e métricas derivadas dos registros reais do tenant.
9. Exportação de dados autorizada, com trilha de auditoria e limites contra exfiltração acidental.

Manter denúncias fora do CRM e fora do primeiro release se não houver fluxo, segregação, autorização específica, retenção e revisão jurídica aprovados.

**Gate:** representantes de gabinete conseguem completar tarefas de ponta a ponta em staging, sem intervenção técnica, com feedback de erros e trilha de auditoria.

### Fase 5 — Master e provisionamento

1. Implementar painel e Auth Master em deployment próprio.
2. Exigir MFA; atribuir permissões administrativas e escopos com expiração quando aplicável.
3. Fluxo de cadastro do tenant: rascunho, validação, provisionamento, pronto, ativo, suspenso e encerramento.
4. Criar provisionamento backend idempotente com etapas, retry controlado, compensação e reconciliação.
5. Ativar módulos por entitlement versionado; sincronizar apenas snapshot mínimo assinado ao ambiente operacional.
6. Implementar gestão demonstrável/real de contatos, planos e estado operacional conforme autoridade definida.
7. Implementar auditoria administrativa append-only; ações críticas exigem justificativa e step-up. Acesso de suporte JIT deve ter pedido, aprovação, escopo, expiração e registro de uso; nunca leitura ampla de conteúdo por padrão.
8. Expor ao Master apenas health, erro técnico minimizado e métricas agregadas.

**Gate:** teste de provisionamento repetido não duplica recursos; falha parcial é recuperável; cada ação privilegiada tem autorização e evento de auditoria.

### Fase 6 — privacidade, segurança e conformidade

1. Fazer inventário de dados e fluxos: finalidade, base legal, titular, localização, operadores, retenção, compartilhamento e descarte.
2. Revisar avisos de privacidade, contratos, papéis de controlador/operador e processo de direitos dos titulares com assessoria apropriada.
3. Minimizar dados, limitar exportação e mascarar PII em logs, analytics, notificações e ambientes não produtivos.
4. Definir política de retenção/eliminação, legal hold quando necessário e trilha de descarte.
5. Rever criptografia em trânsito/repouso, backups, permissões de storage e ciclo de rotação de segredos.
6. Modelar ameaças para isolamento multi-tenant, takeover de conta, IDOR/BOLA, abuso de portal, upload, suporte Master e sincronização de planos.
7. Fazer revisão independente de SQL, policies, funções, endpoints privilegiados e IAM da infraestrutura.
8. Executar análise de dependências, segredos, SAST/DAST e pentest proporcional ao risco; corrigir achados críticos/altos antes de produção.
9. Preparar resposta a incidente, comunicação, preservação de evidências e processo de revogação de acesso.

**Gate:** nenhum risco crítico/alto sem mitigação aceita; evidência dos testes e aprovações registrada. RLS estrutural sozinho não é evidência suficiente.

### Fase 7 — qualidade, desempenho e acessibilidade

1. Testes unitários de regras e validações.
2. Testes de integração de APIs, banco, policies e Storage.
3. Testes comportamentais RLS com usuários reais de teste em dois tenants para todos os métodos.
4. Testes E2E de login → atendimento → atribuição → conclusão → auditoria; onboarding; agenda; Master provisiona tenant.
5. Testes de contrato entre os planos e idempotência de eventos.
6. Testes de teclado, leitor de tela, contraste, zoom, responsividade e mensagens de erro.
7. Testes de carga baseados em volume projetado; rever query plans, índices, limites e capacidade.
8. Teste de restauração de backup e medição documentada de RPO/RTO.

**Gate:** critérios funcionais e de acessibilidade aprovados; isolamento comprovado; orçamento de desempenho atende metas pactuadas.

### Fase 8 — observabilidade e suporte

1. Métricas de saúde por serviço, latência, taxa de erro, fila, storage e uso, sem conteúdo cidadão.
2. Logs estruturados com correlação/request ID, retenção definida, redaction de PII e acesso restrito.
3. Alertas acionáveis e runbooks para indisponibilidade, falha de provisionamento, fila parada e uso anormal.
4. Painel de incidentes/status interno; canal de suporte e severidades com responsáveis e escalonamento.
5. Revisar custos e limites por tenant, alertas de orçamento, quotas e proteção contra abuso.

**Gate:** equipe consegue detectar, diagnosticar e escalar incidentes sem consultar conteúdo sensível desnecessário.

### Fase 9 — piloto controlado

1. Provisionar 1–3 organizações piloto com contrato, responsáveis e dados autorizados.
2. Importar dados somente após mapeamento, validação, deduplicação, base legal e plano de reversão.
3. Treinar equipe e entregar guias curtos por papel.
4. Acompanhar métricas de adoção e suporte; manter processo de retorno e canal para problemas.
5. Rever semanalmente falhas, clareza da interface, prazos e permissões; corrigir sem ampliar escopo indiscriminadamente.
6. Aprovar formalmente go/no-go para expansão após período e critérios acordados.

**Gate:** operação real estável, incidentes dentro da tolerância, usuários completam tarefas, recuperação testada e responsáveis aprovam expansão.

### Fase 10 — lançamento e operação contínua

1. Congelar release, registrar versão e aprovações, migrar somente por pipeline revisado.
2. Aplicar migrations com backup recente, janela, monitoramento e plano de rollback/forward-fix.
3. Ativar tenants gradualmente com feature flags/entitlements versionados.
4. Validar health checks, login, fluxo principal, isolamento, métricas e alertas pós-deploy.
5. Revisar acessos periodicamente, remover contas inativas e rotacionar credenciais conforme política.
6. Atualizar dependências, testar recuperação regularmente e reavaliar ameaças, retenção e custos.

**Gate de produção:** checklist de release assinado por produto, engenharia, operação e responsável por privacidade/segurança.

## 5. Regras de não negociação

- Nunca colocar `service_role`/secret key no navegador, mobile, repositório ou variável pública.
- Nunca confiar no tenant, papel ou permissão enviados pelo cliente sem validação server-side.
- Nunca replicar papel Master no Operational Plane nem compartilhar sessão entre os planos.
- Nunca conectar o Master diretamente ao banco operacional para busca livre de conteúdo.
- Nunca usar dados reais em fixtures, screenshots, demos públicas ou ambientes de teste sem processo aprovado.
- Nunca aplicar migrations remotas como etapa de prototipagem; usar ambientes, revisão, backup e release controlados.
- Nunca chamar uma feature de integrada se ela apenas apresenta dados locais ou resposta simulada.
- Nunca promover a produção sem testes comportamentais de isolamento e restauração comprovada.

## 6. Riscos e decisões ainda necessárias

1. **Stack e hospedagem:** o workspace não contém aplicação nem escolha confirmada de runtime.
2. **Primeiro cliente e escopo:** gabinete individual e Câmara têm papéis, unidades e processos diferentes; escolher piloto.
3. **Permissões operacionais:** matriz por papel, workspace e departamento não está completa.
4. **Denúncias:** modelo mínimo existe, mas regras de triagem, investigação, sigilo e retenção precisam de definição legal e operacional.
5. **Cidadãos e LGPD:** inventário, bases legais, prazos e atendimento aos titulares ainda não estão formalizados.
6. **Integrações:** WhatsApp, billing, domínio, portal e automações dependem de contratos, credenciais, consentimento e requisitos de operação.
7. **SLA e recuperação:** definir disponibilidade, RPO, RTO, retenção de backup e suporte antes de vender disponibilidade.
8. **Pacote SQL v1:** precisa de revisão e testes locais separados para cada projeto; não deve ser aplicado em produção como está.

## 7. Checklist de prontidão para produção

- [ ] Escopo release 1 e piloto aprovados.
- [ ] Stack, domínios, região e ambientes aprovados.
- [ ] Aplicações Client e Master separadas, com autenticação própria.
- [ ] Migrations versionadas, revisadas e reproduzíveis em staging.
- [ ] RBAC completo e RLS validado com cenários entre tenants.
- [ ] APIs server-side verificam identidade, escopo, schema e limites.
- [ ] MFA Master, auditoria, suporte JIT e processo de revogação implementados.
- [ ] Segredos geridos fora do código e rotação documentada.
- [ ] Inventário, retenção, privacidade, contratos e resposta a incidente aprovados.
- [ ] Testes unitários, integração, E2E, acessibilidade e segurança aprovados.
- [ ] Backup restaurado em ambiente isolado e RPO/RTO medidos.
- [ ] Observabilidade, alertas, runbooks, suporte e gestão de incidentes ativos.
- [ ] Piloto concluído com critérios de go/no-go satisfeitos.
- [ ] Deploy, migrations e rollback/forward-fix ensaiados.

## 8. Entrega recomendada para o próximo ciclo

Antes de implementar todo o roadmap, fechar a Fase 0 e depois construir um único fluxo vertical de produção: **convite de membro → login → registrar demanda → atribuir responsável → acompanhar prazo → concluir e auditar**. Isso exercita autenticação, isolamento, banco, autorização, interface, logs e operação num escopo pequeno. Em paralelo, preparar o esqueleto separado do Master, mas não habilitar acesso operacional privilegiado. Agenda, tarefas, anexos e módulos posteriores entram após esse fluxo passar seus gates.
