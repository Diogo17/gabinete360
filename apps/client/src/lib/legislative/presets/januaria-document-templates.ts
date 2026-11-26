export interface JanuariaDocumentStructure {
  documentType: string;
  label: string;
  legalBasis: string;
  quorum: 'maioria_simples' | 'maioria_absoluta' | 'dois_tercos';
  turns: 1 | 2;
  commissionDeadlineDays: number;
  requiredFields: string[];
  competencyAlerts: string[];
  draftSections: string[];
}

/**
 * Estrutura jurídico-regimental para elaboração e criação de documentos
 * pelos Vereadores da Câmara Municipal de Januária-MG.
 * Base: LOM nº 1/1990 (até Emenda 22/2024) e RI nº 1/1990 (até Resolução 2/2024).
 */
export const JANUARIA_DOCUMENT_STRUCTURES: JanuariaDocumentStructure[] = [
  {
    documentType: 'projeto_de_lei',
    label: 'Projeto de Lei Ordinária',
    legalBasis: 'LOM Arts. 38, 45 III, 47, 49, 52; RI Arts. 154, 155, 160, 174–181',
    quorum: 'maioria_simples',
    turns: 2,
    commissionDeadlineDays: 10,
    requiredFields: ['ementa', 'objetivo', 'texto_articulado', 'vigencia', 'justificativa'],
    competencyAlerts: [
      'Verificar iniciativa exclusiva do Prefeito (LOM Art. 49: cargos, servidores, Secretarias, orçamento e matéria tributária).',
      'Observar técnica legislativa (LC 95/1998) e parecer obrigatório da Comissão de Legislação, Justiça e Redação (RI Art. 165, § único).',
    ],
    draftSections: [
      'Epígrafe (PROJETO DE LEI Nº ___/ANO)',
      'Ementa (síntese clara do objeto)',
      'Preâmbulo (A Câmara Municipal de Januária aprova...)',
      'Artigos (Art. 1º objeto/âmbito, disposições, vigência)',
      'Justificativa (fatos, interesse local e fundamento jurídico)',
      'Local, data e assinatura do Vereador autor',
    ],
  },
  {
    documentType: 'projeto_de_lei_complementar',
    label: 'Projeto de Lei Complementar',
    legalBasis: 'LOM Art. 48 e § único; RI Art. 182 (prazos regimentais em dobro)',
    quorum: 'maioria_absoluta',
    turns: 2,
    commissionDeadlineDays: 20,
    requiredFields: ['ementa', 'materia_complementar', 'texto_articulado', 'justificativa'],
    competencyAlerts: [
      'Exige maioria absoluta (mínimo 8 votos dos 15 vereadores) e prazos regimentais em dobro (RI Art. 182).',
      'Não se aplica regime de urgência do Executivo (LOM Art. 51, § 3º).',
    ],
    draftSections: [
      'Epígrafe (PROJETO DE LEI COMPLEMENTAR Nº ___/ANO)',
      'Ementa',
      'Preâmbulo',
      'Texto normativo articulado',
      'Justificativa',
      'Assinatura',
    ],
  },
  {
    documentType: 'projeto_de_resolucao',
    label: 'Projeto de Resolução',
    legalBasis: 'LOM Art. 53; RI Arts. 158, 183–187',
    quorum: 'maioria_simples',
    turns: 2,
    commissionDeadlineDays: 10,
    requiredFields: ['ementa', 'materia_interna', 'texto_articulado', 'justificativa'],
    competencyAlerts: [
      'Destinado a matérias de economia interna da Câmara ou caráter político-administrativo interno (não depende de sanção do Prefeito).',
    ],
    draftSections: [
      'Epígrafe (PROJETO DE RESOLUÇÃO Nº ___/ANO)',
      'Ementa',
      'Preâmbulo',
      'Artigos',
      'Justificativa',
      'Assinatura',
    ],
  },
  {
    documentType: 'requerimento',
    label: 'Requerimento',
    legalBasis: 'RI Arts. 215–217 (despacho do Presidente ou deliberação do Plenário)',
    quorum: 'maioria_simples',
    turns: 1,
    commissionDeadlineDays: 5,
    requiredFields: ['destinatario', 'objeto', 'fundamentacao', 'pedido'],
    competencyAlerts: [
      'Requerimentos escritos sujeitos a parecer de comissão têm prazo de 5 dias (RI Art. 130, § 5º, II).',
    ],
    draftSections: [
      'Endereçamento (Exmo. Sr. Presidente da Câmara Municipal de Januária)',
      'Identificação do Vereador requerente',
      'Objeto e fundamentação regimental',
      'Pedido objetivo',
      'Local, data e assinatura',
    ],
  },
  {
    documentType: 'pedido_informacao',
    label: 'Pedido Escrito de Informações ao Executivo',
    legalBasis: 'LOM Arts. 35 e 67, XIV; RI Arts. 44 II e 247',
    quorum: 'maioria_simples',
    turns: 1,
    commissionDeadlineDays: 5,
    requiredFields: ['orgao_destinatario', 'quesitos_objetivos', 'justificativa'],
    competencyAlerts: [
      'Prazo legal de resposta pelo Prefeito/Secretários: 15 dias (LOM Art. 67, XIV; RI Art. 247, § único), prorrogável por igual prazo mediante solicitação.',
    ],
    draftSections: [
      'Endereçamento à Mesa Diretora / Presidente',
      'Indicação da autoridade destinatária',
      'Quesitos numerados e objetivos',
      'Justificativa de interesse público e fiscalização',
      'Assinatura',
    ],
  },
  {
    documentType: 'indicacao',
    label: 'Indicação',
    legalBasis: 'RI Art. 30, I, "d" e Art. 37',
    quorum: 'maioria_simples',
    turns: 1,
    commissionDeadlineDays: 5,
    requiredFields: ['orgao_sugerido', 'localidade', 'providencia_sugerida', 'justificativa'],
    competencyAlerts: [
      'Instrumento de sugestão ao Executivo; não cria obrigação direta nem despesa (respeita separação de Poderes, LOM Art. 3º).',
    ],
    draftSections: [
      'Epígrafe (INDICAÇÃO Nº ___/ANO)',
      'Destinatário sugerido (Prefeito / Secretaria)',
      'Descrição do problema e localidade (sede/distrito)',
      'Providência sugerida e justificativa',
      'Assinatura',
    ],
  },
  {
    documentType: 'oficio',
    label: 'Ofício Parlamentar',
    legalBasis: 'LOM Art. 3º; RI Art. 36 e Padrão Oficial',
    quorum: 'maioria_simples',
    turns: 1,
    commissionDeadlineDays: 5,
    requiredFields: ['numero_ano', 'destinatario', 'cargo_orgao', 'assunto', 'texto', 'signatario'],
    competencyAlerts: [
      'Verificar política de Assinatura 360° aceita pelo órgão destinatário.',
    ],
    draftSections: [
      'Cabeçalho institucional (Câmara Municipal de Januária / Gabinete)',
      'Numeração (Ofício nº ___/ANO) e local/data',
      'Destinatário e vocativo',
      'Assunto e corpo do texto',
      'Fecho e bloco de assinatura',
    ],
  },
];
