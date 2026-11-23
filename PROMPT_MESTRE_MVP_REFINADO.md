# Prompt mestre — Protótipo MVP do Gabinete Digital 360°

## Papel

Atue como Product Designer e Engenheiro Full Stack sênior, com experiência em SaaS multi-tenant, sistemas institucionais e segurança. Analise o workspace antes de propor ou alterar código. Trabalhe no produto existente e preserve decisões válidas já documentadas.

## Objetivo

Entregar uma primeira versão demonstrável, navegável e responsiva do **Gabinete Digital 360° by DM IA Studio**, que demonstre um fluxo de trabalho realista de um gabinete parlamentar e a separação conceitual entre o painel do cliente e a administração da plataforma.

O resultado é um **protótipo de MVP**, não um sistema pronto para produção. Use dados fictícios claramente identificados e não simule integrações como se fossem reais.

## Contexto e fontes de verdade

1. Examine o workspace, sua estrutura, stack e arquivos existentes antes de editar.
2. Leia a documentação existente do Gabinete Digital 360°, incluindo o DER, as decisões de segurança, o pacote SQL e seu runbook.
3. Em caso de conflito, registre-o e preserve as decisões de segurança documentadas. Não aplique migrations, não conecte serviços remotos e não use dados reais.
4. Preserve o stack e as funcionalidades existentes. Não reestruture ou apague arquivos sem necessidade demonstrável.
5. Como o workspace pode conter apenas documentos ou um protótipo isolado, relate com precisão o que encontrou. Não afirme que existe framework, backend, rota ou integração sem evidência.

## Primeiro: diagnóstico breve

Antes de implementar, apresente no próprio andamento do trabalho:

- O que existe no workspace e qual stack foi identificada, se houver.
- O estado atual do produto: interface, rotas, dados e integrações encontrados.
- Conflitos ou lacunas relevantes entre a documentação e o escopo solicitado.
- Um plano curto, delimitado ao MVP abaixo.

Não interrompa o trabalho para pedir confirmação sobre decisões reversíveis. Se uma dependência essencial estiver ausente, faça a melhor entrega compatível com o workspace e documente a limitação.

## Produto e linguagem visual

Crie uma experiência profissional, institucional, humana e própria do produto. Use hierarquia visual clara, tipografia legível, navegação previsível, espaçamento consistente e componentes reutilizáveis. A interface deve funcionar em desktop e celular.

Evite aparência de template administrativo genérico e elementos decorativos associados a ferramentas de IA. Não use gradientes chamativos, brilho, robôs, estrelas, linguagem promocional exagerada ou “cartões de IA” sem função concreta. A marca deve transmitir organização, confiança pública e proximidade com o cidadão.

Use português do Brasil, datas e exemplos coerentes com o contexto municipal. Se a identidade visual oficial não estiver disponível, adote uma direção visual sóbria e documente brevemente as escolhas.

## Escopo funcional do MVP

Priorize o fluxo cotidiano do gabinete. Entregue as áreas abaixo com navegação consistente e operações demonstrativas coerentes:

### 1. Painel operacional do gabinete

- Visão geral com indicadores úteis, atendimentos recentes, prazos e próximos compromissos.
- Atendimentos/demandas: listar, pesquisar, filtrar, abrir detalhes, cadastrar, editar status e atribuir responsável usando dados locais fictícios.
- Agenda: visualizar compromissos e cadastrar um compromisso demonstrativo.
- Tarefas da equipe: listar tarefas e atualizar estado ou responsável.
- Equipe: visualizar integrantes e funções demonstrativas.

Cada ação demonstrativa deve produzir um resultado visível na interface. Não apresente persistência entre sessões, notificações externas ou processamento real se não houver backend.

### 2. Painel Master — recorte demonstrativo

O Control Plane é uma aplicação e contexto de autenticação separados do painel operacional. No MVP, represente essa separação por navegação/entrada claramente distinta e inclua apenas:

- Resumo de clientes, status de provisionamento e saúde demonstrativa.
- Lista de clientes com busca e detalhe.
- Cadastro e edição demonstrativos de clientes.
- Visualização de plano e módulos habilitados; permitir alteração demonstrativa de módulos.
- Histórico administrativo demonstrativo.

Não implemente gestão real de contas Master, cobrança, MFA, provisionamento de infraestrutura, logs de produção ou concessão real de suporte. Marque esses itens como futuros quando forem relevantes. Não crie papel Master no modelo operacional.

### 3. Limites de escopo

Não desenvolver neste primeiro corte os módulos completos de CRM avançado, WhatsApp, portal público, notícias, atuação legislativa, fiscalização, consultas públicas, denúncias, billing, relatórios avançados ou integração com serviços externos. Se necessário para demonstrar evolução, mostre-os como itens futuros claramente desabilitados, sem fingir que estão implementados.

Denúncias e conteúdo sigiloso não devem ser misturados com demandas comuns. Não é necessário implementar denúncias neste MVP.

## Arquitetura e segurança

Respeite as decisões documentadas para os dois planos:

- **Control Plane:** administração comercial e técnica da plataforma, com identidade e dados próprios.
- **Operational Plane:** usuários, equipe e dados do gabinete/Câmara, isolados por organização.
- Não compartilhar autenticação entre os planos.
- Não criar acesso global de plataforma dentro das tabelas operacionais.
- Não permitir que o Master leia livremente dados pessoais, demandas, mensagens ou denúncias dos clientes.
- Nunca expor segredos, service role ou credenciais no frontend.
- Trate RLS, RBAC, validação de servidor e isolamento de tenant como requisitos de produção a validar no backend; uma interface ou dado local não comprova segurança.

Se não houver backend configurado, mantenha dados de demonstração numa camada separada da interface (fixtures/repositório/serviço local apropriado ao stack). Identifique visivelmente o ambiente como **Demonstração — dados fictícios**. Não faça chamadas de rede nem alegue integração com Supabase.

## Qualidade de interação

- Toda navegação apresentada deve funcionar ou estar claramente marcada como indisponível/futura.
- Formulários devem ter campos, validação básica, mensagens de sucesso/erro e cancelamento.
- Inclua estados vazios e feedback para ações relevantes.
- Use confirmação para ações demonstrativas destrutivas, como suspender cliente.
- Garanta que os dados e nomes sejam fictícios.
- Não use texto de preenchimento genérico.
- Não acrescente funcionalidades que aumentem o escopo sem melhorar o fluxo principal.

## Processo de trabalho

1. Inspecione o workspace e a documentação antes de alterar arquivos.
2. Apresente diagnóstico e plano sucintos.
3. Implemente o MVP no stack existente. Se não houver aplicação, proponha a menor estrutura executável que caiba no workspace, sem instalar dependências ou substituir tecnologias sem necessidade.
4. Revise visualmente e funcionalmente o resultado nos tamanhos de tela relevantes, se o ambiente permitir.
5. Execute apenas verificações compatíveis com o projeto e com o ambiente disponível. Não conecte serviços remotos nem rode migrations remotas.
6. Atualize ou crie documentação de execução e limites do protótipo.

## Critérios de aceite

- O usuário consegue navegar entre o painel operacional e a área demonstrativa Master, percebendo que são contextos distintos.
- O fluxo principal de atendimento, agenda e tarefa pode ser demonstrado sem backend.
- O cadastro demonstrativo de cliente e a alteração demonstrativa de módulos funcionam na interface Master.
- Dados fictícios, ações simuladas e funcionalidades futuras estão identificados com clareza.
- Interface responsiva, consistente, em português e sem estética genérica de IA.
- Não há credenciais expostas nem alegações falsas de integração ou segurança.
- A documentação explica como abrir/executar o protótipo, o que funciona, o que é simulado e o que ainda depende de backend/revisão.

## Entrega final

Ao terminar, informe de forma objetiva:

1. Arquivos ou áreas alteradas.
2. Fluxos realmente demonstráveis.
3. O que permanece simulado ou fora do MVP.
4. Verificações realizadas e limitações encontradas.
5. Próxima etapa recomendada para avançar à integração real.

Não declare pronto para produção. O objetivo é um protótipo de MVP coerente, útil para validação de produto e preparado para evolução técnica.
