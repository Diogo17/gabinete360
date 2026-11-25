# Gabinete Digital 360° — Arquitetura Jurídico-Funcional de Documentos Parlamentares

**Versão:** 1.0 | **Pesquisa:** 25/11/2026 | **Produto:** Gabinete Digital 360° by DM IA Studio

> **Aviso:** documento de pesquisa e orientação para arquitetura de produto, não parecer jurídico. Competências, requisitos, espécies documentais, prazos, assinaturas e tramitação variam por Constituição Estadual, Lei Orgânica, Regimento Interno, atos da Mesa e normas administrativas do órgão. O sistema deve exigir configuração local e revisão humana; minuta de IA não é aprovação jurídica.

## 1. Resumo e recomendação

Criar um módulo transversal **Documentos e Proposições** composto por: (1) catálogo contextual por perfil e órgão; (2) formulários estruturados; (3) geração de minuta; (4) template engine institucional; (5) editor e preview; (6) revisão linguística e checklist jurídico; (7) aprovação interna; (8) exportação; (9) assinatura e protocolo integrados, quando realmente disponíveis; e (10) versões e auditoria.

A IA deve apoiar redação, organização, revisão e pesquisa. Não pode inventar fatos, leis, artigos, destinatários, prazos ou protocolo, nem afirmar que um documento está juridicamente válido. Aprovação, assinatura, envio e protocolo são etapas diferentes.

## 2. Base normativa

### Constituição Federal de 1988

Fonte primária para competências e processo legislativo:
- Arts. 22 e 24: competências legislativas privativas da União e concorrentes.
- Art. 27: Assembleia Legislativa e deputados estaduais.
- Arts. 29, 29-A, 30 e 31: organização municipal, competências municipais e fiscalização.
- Arts. 44–46: Congresso, Câmara e Senado.
- Arts. 48–49: competências do Congresso.
- Arts. 51–52: competências privativas da Câmara e do Senado.
- Art. 53: imunidades parlamentares, dentro dos limites constitucionais.
- Art. 58: comissões, fiscalização e CPIs.
- Arts. 59–69: processo legislativo.
- Arts. 70–71: fiscalização e controle externo.
- Art. 61: iniciativa legislativa e reservas de iniciativa.
- Arts. 165–169: orçamento e finanças públicas, quando aplicável.

Fonte: https://www4.planalto.gov.br/legislacao/legis-federal/constituicao

### Técnica legislativa

- **LC 95/1998:** elaboração, redação, alteração e consolidação de leis; estrutura, articulação, clareza, precisão, ementa, objeto, alteração/revogação e vigência. https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp95.htm
- **Decreto 12.002/2024:** regras de redação e estrutura de atos normativos federais. É referência técnica, mas seu âmbito não deve ser presumido como aplicação direta automática a todos os parlamentos estaduais/municipais. Revogou o Decreto 9.191/2017. https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12002.htm

### Administração, transparência, dados e assinatura

- **Lei 13.460/2017:** direitos e participação de usuários de serviços públicos. O gabinete não deve ser apresentado como substituto do órgão executor. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13460.htm
- **LAI, Lei 12.527/2011:** distinguir pedido de acesso à informação, requerimento parlamentar e solicitação de gabinete; respeitar sigilo e dados pessoais. https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm
- **LGPD, Lei 13.709/2018:** finalidade, base legal, minimização, segurança, retenção, direitos, acesso e tratamento de dados sensíveis. https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **Lei 14.063/2020:** assinatura eletrônica simples, avançada e qualificada; o nível requerido depende da norma aplicável ao órgão e ato. Não confundir imagem de assinatura com assinatura eletrônica validada. https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14063.htm
- **Decreto 10.543/2020:** regras de assinatura eletrônica na Administração Pública Federal; considerar seu âmbito específico. https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/d10543.htm
- Considerar ainda Lei 14.133/2021 para contratação/fiscalização relacionada, Lei 4.320/1964 e regras fiscais/orçamentárias quando aplicáveis, Constituição Estadual, Lei Orgânica, Regimento Interno, resoluções, portarias, atos da Mesa e manuais do órgão.

**Princípio de configuração:** não inventar regra local. Se Lei Orgânica, Constituição Estadual ou Regimento não estiver cadastrado, exibir alerta “Norma local não configurada — validar manualmente”.

## 3. Perfis parlamentares e competências

### 3.1 Vereador — Câmara Municipal

**Atividades típicas:** legislar sobre interesse local e suplementar legislação federal/estadual no que couber; fiscalizar Executivo municipal; participar de orçamento e deliberações; atuar em comissões e sessões; acompanhar políticas e serviços municipais; promover participação, audiências e consultas quando previstas; registrar demandas e visitas; solicitar informações e encaminhamentos nos instrumentos permitidos.

**Limites:** não executar serviços do Executivo, administrar secretarias, ordenar despesas do Executivo ou invadir iniciativa reservada. Propostas que criem atribuições, obrigações ou despesas precisam de análise de competência, iniciativa, Lei Orgânica, jurisprudência e regimento. Fiscalização deve respeitar procedimento, direitos, sigilo e competência.

**Tipos possíveis, sujeitos ao Regimento local:** Projeto de Lei; Projeto de Resolução; Projeto de Decreto Legislativo quando cabível; emenda; indicação; requerimento; pedido de informações; moção; voto de aplauso/pesar/congratulação se previsto; parecer em comissão; ofício; comunicação interna; convite; solicitação de audiência/reunião; relatório de visita; relatório de fiscalização; relatório de atividade; pedido de providência conforme instrumento local; encaminhamento de demanda.

### 3.2 Deputado Estadual — Assembleia Legislativa

**Atividades típicas:** legislar sobre competências estaduais, concorrentes e suplementares conforme Constituição; fiscalizar Executivo estadual; atuar em comissões, sessões e orçamento; acompanhar políticas estaduais; realizar audiências; requerer informações/convocações nos limites constitucionais e regimentais; representar o Estado.

**Tipos possíveis:** Projeto de Lei; PEC estadual quando legitimidade e requisitos permitirem; Projeto de Resolução; Projeto de Decreto Legislativo conforme regimento; emendas; requerimentos; indicações; moções; pareceres; pedido de informação; convocação/audiência; ofícios; relatórios de fiscalização, visita e atividade; comunicação de comissão.

**Validação:** Constituição Estadual, Regimento da Assembleia, competência, iniciativa, procedimentos de comissão, protocolo, prazos e modelos oficiais.

### 3.3 Deputado Federal — Câmara dos Deputados

**Atividades típicas:** processo legislativo federal; proposições e emendas; comissões; fiscalização do Executivo Federal; requerimentos de informação/convocação nos limites constitucionais e regimentais; orçamento; audiências e debates; acompanhamento de políticas federais.

**Tipos possíveis:** PL; PLC; PEC, conforme legitimidade; PDL; PRC; emendas; requerimentos; indicações; pareceres; requerimentos de informação, convocação, convite ou audiência; instrumentos regimentais de manifestação; ofícios; relatórios de fiscalização/visita/atividade e comunicação institucional.

**Referência técnica:** Manual de Redação: Documentos Legislativos da Câmara dos Deputados, 5ª edição (2023), e modelos/manuais oficiais.

### 3.4 Senador — Senado Federal

**Atividades típicas:** processo legislativo federal; comissões e CPIs; fiscalização do Executivo e políticas; requerimentos de informação/convocação nos limites constitucionais e regimentais; competências privativas do art. 52; deliberações e aprovações constitucionalmente atribuídas ao Senado; atuação federativa e acompanhamento de orçamento/políticas.

**Tipos possíveis:** PL; PLC; PEC conforme legitimidade; PDL; PRS; emendas; requerimentos; indicações; pareceres; requerimentos de informação, convocação, audiência e comissão; relatórios; ofícios; fiscalização/visita/atividade e comunicações institucionais.

**Referência:** Regimento Interno do Senado e manuais oficiais.

**Importante:** catálogo não é lista automática de permissões. Cada tipo deve ter status: habilitado, condicionado, não configurado ou desabilitado para perfil/órgão.

## 4. Perfil institucional configurável

Entidade sugerida `parliamentary_profiles`:

- organization_id; jurisdiction (municipal/state/federal); institution_type (city_council/state_assembly/house/senate); parliamentary_role (vereador/deputado_estadual/deputado_federal/senador).
- legislator_name; full_name quando necessário; party opcional; state; municipality; district.
- legislature_number; term_start; term_end.
- office_address; official_email; official_phone; official_site.
- logo/brasão autorizado; status ativo.

O perfil e a jurisdição filtram documentos, destinatários, campos, alertas de competência e normas aplicáveis.

## 5. Módulo “Documentos”

### Menu
- Criar documento.
- Minhas minutas.
- Modelos e biblioteca.
- Documentos enviados.
- Documentos assinados.
- Protocolos/encaminhamentos.
- Histórico e versões.
- Configurações institucionais.

### Fluxo
1. Selecionar espécie e finalidade.
2. Conferir perfil, órgão e jurisdição.
3. Exibir explicação, competência e cautelas.
4. Selecionar destinatário.
5. Preencher formulário contextual.
6. Informar fatos, fundamentos, pedido/objetivo e anexos.
7. Gerar minuta estruturada.
8. Revisar e validar.
9. Editar e visualizar layout.
10. Aprovar internamente.
11. Exportar DOCX/PDF.
12. Assinar por processo configurado.
13. Registrar envio/protocolo, se realizado.
14. Arquivar versão final.

### Estados
Draft; Generated; Needs_review; Reviewed; Approved; Ready_to_sign; Signed; Exported; Protocol_pending; Protocol_submitted; Protocol_confirmed; Returned; Archived; Cancelled.

“Revisado”, “aprovado internamente”, “assinado”, “exportado” e “protocolado” são estados distintos.

## 6. Catálogo inicial de documentos

### Legislativos
- Projeto de Lei; Projeto de Lei Complementar; Projeto de Resolução; Projeto de Decreto Legislativo; PEC (quando admissível); emenda/substitutivo; requerimento; indicação; moção; parecer; pedido/requerimento de informação; requerimento de audiência; convocação/convite quando cabível; relatório de comissão; relatório de fiscalização.

### Administrativos/institucionais
- Ofício; ofício circular; memorando/comunicação interna; solicitação de reunião; convite; resposta; encaminhamento; pedido de providência; pedido de informação; declaração (se autorizada); despacho interno (se configurado); nota técnica; relatório de visita; atendimento; fiscalização; atividade parlamentar; audiência; minuta de ata; comunicação de comissão.

### Participação e atendimento
- Resposta ao cidadão; encaminhamento de demanda; solicitação ao órgão competente; convite para reunião comunitária; comunicado; relatório de reunião; registro de consulta; síntese de sugestões/manifestações; avisos de privacidade/consentimento quando necessários.

### Fiscalização
- Plano de visita; checklist; relatório de visita; relatório fotográfico; solicitação de informação; encaminhamento; relatório de acompanhamento; matriz de providências; registro de resposta/evidências.

## 7. Motor de competência e alertas

Analisar perfil, esfera, órgão destinatário, assunto, finalidade (legislar/fiscalizar/solicitar/recomendar/informar/encaminhar/homenagear/representar), competência, iniciativa reservada, impacto orçamentário, criação de atribuições, interferência em outro Poder, necessidade de norma local, dados pessoais/sensíveis, sigilo e fontes legais.

Alertas exemplificativos:
- “Possível matéria fora da competência legislativa do ente. Confirme antes de continuar.”
- “A minuta pode criar atribuições ou despesa para órgão do Executivo. Verifique iniciativa reservada, norma local e jurisprudência.”
- “Destinatário de outra esfera. Confirme se o perfil e instrumento permitem o encaminhamento.”
- “Solicitação de execução de serviço: avalie instrumento adequado, competência e regimento.”
- “Regimento/Lei Orgânica não configurado.”
- “Referência normativa não verificada; confira manualmente.”

Alertas de IA são explicáveis, registrados e não substituem parecer. Bloqueios só para regras estruturais configuradas (por exemplo, tipo documental incompatível com perfil), não por conclusão jurídica automática.

## 8. Template Engine — identidade institucional

**Configurações → Documentos e Identidade Institucional**

### Configurações
- Nome oficial do órgão/gabinete; nome parlamentar; cargo; legislatura; partido opcional; município/UF; endereço; e-mail; telefone; site.
- Logo e brasão autorizado.
- Cabeçalho/rodapé; fontes; margens; tamanho/orientação da página; títulos; parágrafos; espaçamento; paginação.
- Local e data; destinatário; número e prefixo; sequência por tipo/ano.
- Bloco de assinatura; signatários múltiplos; ordem; aviso institucional; classificação.
- Modelos por tipo documental e workflow.

### Cabeçalho
Configurar logo/brasão (posições), nome do órgão, gabinete, parlamentar/cargo, legislatura opcional, linha divisória, contatos e layout. Símbolos oficiais devem ser autorizados e utilizados conforme identidade institucional; não inventar nem inserir brasões automaticamente.

### Rodapé
Contato, site, paginação, ID, data de geração, versão, QR de validação opcional e aviso eletrônico quando apropriado.

### Assinatura
Nome, cargo, órgão, local/data, linha, múltiplos signatários, ordem e papéis. Imagem manuscrita é representação visual e não deve ser chamada de assinatura eletrônica validada. Integração de assinatura só é anunciada como real quando implementada e verificada.

### Destinatário
Tratamento, nome, cargo, órgão, unidade, endereço, e-mail, “A/C” e referência. Sugestões de tratamento/vocativo devem ser confirmadas.

## 9. Importação de modelos PDF/DOCX

Adicionar “Importar modelo institucional”.

**Fluxo:** upload → validação de arquivo → extração de texto/metadados → OCR se necessário → detecção de logo, cabeçalho, rodapé, margens, fonte aproximada, títulos, espaçamento, destinatário, local/data, assinatura, paginação e campos → preview → editor de template → documento de teste → comparação visual → aprovação → versionamento → ativação.

PDF pode ser textual, escaneado, híbrido ou complexo; OCR/extrator não garante fidelidade de fonte, posição, tabelas ou espaçamento. Sempre exibir “extraído — necessita conferência”; nunca ativar automaticamente.

### Editor de template
Logo, cabeçalho, rodapé, margens, fontes, tamanhos, alinhamento, espaçamento, títulos, destinatário, data, assinatura, número e campos dinâmicos.

### Versionamento
Template ativo imutável. Alteração cria nova versão:
- template_id, organization_id, document_type, version, status (draft/review/approved/active/deprecated), source_file, extraction_method, approved_by/at, creator, timestamp, change_summary, hash, settings_json.

## 10. Formulários contextualizados

**Ofício:** tipo, número/ano, destinatário, cargo, órgão, assunto, referência, contexto, pedido/encaminhamento, justificativa, prazo quando cabível, anexos, local/data, signatário, classificação.

**Indicação:** órgão, autor, assunto, problema, localidade, providência sugerida, justificativa, beneficiários, evidências, norma regimental, anexos, assinatura e checklist de competência.

**Requerimento:** tipo, destinatário, objeto, pedido, fundamentos, fatos, informações solicitadas, referência legal/regimental, prazo/urgência se admissível, anexos, autor/signatários e checklist.

**Projeto de Lei:** ementa, problema, objetivo, âmbito, texto normativo, artigos, definições necessárias, obrigações, responsabilidades, implementação, disposições transitórias, revogação, vigência, justificativa, competência/iniciativa, impacto orçamentário, legislação relacionada, checklist LC 95 e revisão jurídica.

**Relatório de fiscalização:** data, local, objeto, escopo, participantes, método, observações, evidências, fotos/anexos, fatos, limitações, providências, órgãos envolvidos, responsável e classificação.

## 11. Revisão de português e qualidade

Criar ação “Revisar documento” para ortografia, gramática, pontuação, concordância, regência, acentuação, clareza, coesão, repetição, ambiguidade, formalidade, frases longas, inconsistência de termos, nomes/cargos/órgãos, datas, valores, numeração, referências legais, siglas, vocativo, coerência entre assunto/pedido/corpo, estrutura normativa e placeholders.

Mostrar original, sugestão, motivo, categoria e gravidade; aceitar/rejeitar individualmente; histórico. Aplicar todas apenas para correções linguísticas de baixo risco. Nunca alterar silenciosamente fatos, nomes, datas, números, valores, citações ou fundamentos.

Gravidade: crítica (dados incorretos/placeholders); alta (estrutura/competência); média (ambiguidade/redação); baixa (estilo opcional).

## 12. Checklist pré-exportação

**Identificação:** perfil, órgão, tipo, número/ano, destinatário.

**Competência:** competência verificada, iniciativa, Regimento/Lei Orgânica configurados, alertas revisados, fontes conferidas.

**Conteúdo:** assunto/pedido coerentes, fatos, datas, nomes, anexos, referências e campos obrigatórios.

**Linguagem:** revisão ortográfica, gramática, clareza, tratamento, siglas.

**Layout:** cabeçalho, rodapé, margens, paginação, assinatura, preview, template ativo.

**Finalização:** revisão humana, aprovação, signatário, nível de assinatura, exportação, protocolo/envio registrado.

## 13. Exportação, assinatura e protocolo

Exportar DOCX editável, PDF, PDF/A quando requerido/suportado, e JSON interno estruturado. Preservar layout, tabelas, numeração, campos, paginação, assinatura e anexos.

Separar assinatura visual, eletrônica simples, avançada e qualificada. Não afirmar validade sem integração e verificação. Protocolo é entidade própria: órgão, canal, número, data/hora, comprovante, status, responsável, observação, arquivo e hash. Não inventar protocolo.

## 14. Entidades de dados sugeridas

- `document_templates`: tenant, tipo, perfil, jurisdição, versão, status, source file, settings, extraction metadata, approval.
- `document_template_fields`: template, key, label, type, required, validation, default, help, order, visibility.
- `document_types`: slug, nome, descrição, jurisdição/perfil, referências, habilitado, revisão requerida, schema.
- `documents`: tenant, tipo, template/version, título, número/ano, status, autoria/revisor/aprovador, destinatário, conteúdo, classificação, revisão, assinatura, protocolo.
- `document_versions`: snapshot, versão, file, hash, resumo de alteração, autor, data.
- `document_reviews`: documento, revisor, tipo, findings, status, data.
- `document_signatures`: documento, signatário, tipo, provider, verification, metadata, signed_at.
- `document_protocols`: documento, destino, protocolo, canal, envio, comprovante, status.
- `document_audit_events`: tenant, documento, ator, ação, metadados minimizados, timestamp.
- `institutional_document_settings`: logo, header/footer, page, signature, typography, numbering.

Segurança: RLS por tenant, grants corretos, Storage privado, URL assinada temporária, controles extras para documentos restritos, logs minimizados. Não misturar denúncias restritas com documentos comuns.

## 15. Workflow e papéis

Papéis: parlamentar, chefe de gabinete, assessor legislativo, assessor jurídico, comunicação, administrativo, revisor, aprovador, signatário.

Permissões separadas: criar, editar, gerar IA, revisar, aprovar, assinar, exportar, registrar protocolo, ver restritos, administrar templates.

Workflow configurável por tipo: Draft → Generated → Review → Corrections → Approved → Ready to Sign → Signed → Exported → Protocol Submitted → Protocol Confirmed → Archived. Nem todo documento percorre todas as etapas.

## 16. Regras da IA

- Usar perfil, órgão, template, formulário e normas configuradas.
- Pesquisar legislação com fontes verificáveis e links.
- Não inventar leis, artigos, jurisprudência, fatos, prazos ou destinatários.
- Distinguir fatos do usuário e inferências.
- Marcar referências não confirmadas.
- Mostrar limitações e alertas.
- Não declarar validade jurídica.
- Não substituir consulta jurídica.
- Não preencher fatos ausentes.
- Não simular assinatura, envio ou protocolo.

A saída estruturada da IA: minuta; campos; referências; alertas; campos ausentes; limitações; checklist; texto.

## 17. Wizard de configuração inicial

1. Tipo de órgão e esfera.
2. Perfil parlamentar.
3. Estado e município, quando aplicável.
4. Nome parlamentar/cargo/mandato.
5. Constituição Estadual ou Lei Orgânica.
6. Regimento Interno.
7. Upload de modelos oficiais.
8. Identidade visual.
9. Cabeçalho e rodapé.
10. Assinaturas.
11. Numeração.
12. Tipos documentais habilitados.
13. Workflow e revisão.
14. Regras de assinatura.
15. Classificação e acesso.
16. Aprovação da configuração.

Status: incompleta, revisão, aprovada, ativa, atualização necessária.

## 18. UX

**Criar documento:** busca, categorias, favoritos, recentes, templates, compatibilidade de perfil e badges “configurado”, “regimento pendente”, “revisão jurídica”, “modelo oficial”.

**Wizard:** tipo/finalidade → destinatário → fatos/contexto → pedido → fundamentos/anexos → geração → revisão → preview → aprovação/exportação.

**Editor:** texto editável e dados à esquerda; preview à direita; ações revisar, validar, salvar versão e exportar; painel de alertas jurídicos/linguísticos e campos incompletos.

## 19. Roadmap

**Fase 1 — Protótipo:** catálogo, wizard, templates demonstrativos, configuração institucional, importação simulada, preview, revisão, versões e exportação simulada.

**Fase 2 — Documentos reais:** ofício, indicação, requerimento, moção, projeto de lei, relatório de visita/fiscalização/atividade.

**Fase 3 — Template Engine:** upload PDF/DOCX, OCR, extração, editor, versionamento, aprovação e exportação real.

**Fase 4 — Regras jurídicas:** regimentos, Lei Orgânica, Constituição Estadual, competência, fontes verificadas e checklists.

**Fase 5 — Assinatura/protocolo:** integrações, validação, comprovantes, tracking e auditoria.

## 20. Critérios de aceite

- [ ] Perfil parlamentar e esfera configurados.
- [ ] Catálogo contextual.
- [ ] Formulário específico por documento.
- [ ] Template institucional editável.
- [ ] Upload de modelo de referência.
- [ ] Importação não ativa template automaticamente.
- [ ] Preview.
- [ ] Cabeçalho, rodapé e assinatura configuráveis.
- [ ] Revisão linguística.
- [ ] Alertas de competência e normas locais ausentes.
- [ ] Referências verificáveis.
- [ ] Versionamento e histórico.
- [ ] RLS, isolamento e Storage privado.
- [ ] Workflow humano.
- [ ] Exportação.
- [ ] Assinatura não simulada como válida.
- [ ] Protocolo separado da exportação.
- [ ] Aviso de que minuta não equivale a parecer jurídico.

## 21. Fontes oficiais e manuais

- Constituição Federal: https://www4.planalto.gov.br/legislacao/legis-federal/constituicao
- Senado — competências: https://www12.senado.leg.br/institucional/carta-de-servicos/finalidade-e-competencias-legais
- Senado — atribuições: https://www12.senado.leg.br/institucional/documentos/sobre-o-senado/atividade/atribuicoes
- Senado — atividade legislativa: https://www12.senado.leg.br/institucional/documentos/sobre-o-senado/atividade
- LC 95/1998: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp95.htm
- Decreto 12.002/2024: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12002.htm
- Câmara — Manual de Redação: Documentos Legislativos (2023): https://bd.camara.leg.br/bd/items/31dd2348-5a9c-434c-8e9d-65625e111b92
- Câmara — PDF Manual de Redação: https://bd.camara.leg.br/bd/bitstream/handle/bdcamara/32279/manual_redacao_camara.pdf
- Senado — manuais: https://www12.senado.leg.br/institucional/estrutura/SF/OAS/CONLEG/arquivos/manuais
- Senado — Regimento Interno: https://www12.senado.leg.br/institucional/regimento-interno
- Lei 13.460/2017: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13460.htm
- LAI: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm
- LGPD: https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- Lei 14.063/2020: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14063.htm
- Decreto 10.543/2020: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/d10543.htm

## 22. Instrução de implementação

Construir domínio próprio e modular: `documents`, `document-types`, `templates`, `template-builder`, `document-editor`, `document-validation`, `legal-reference`, `document-workflow`, `document-export`, `signature-integrations`, `protocol-tracking`.

Não gerar tudo por prompt livre; não usar template genérico para todas as esferas; não inventar fundamento legal; não misturar denúncias sigilosas; não considerar assinatura visual como assinatura eletrônica validada; não ativar template extraído sem revisão; não inventar protocolo; não cruzar tenants; não alterar fatos/números/citações silenciosamente.

**Resultado:** minutas profissionais, configuráveis e revisáveis, adaptadas ao perfil parlamentar e órgão, com identidade institucional, templates, alertas, revisão de português, referências, workflow, exportação e trilha de auditoria — sempre com revisão e decisão humanas.
