export type RedFlagSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface RedFlagFinding {
  code: string;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  suggestion: string;
}

export interface RedFlagInput {
  documentType: string;
  content: string;
  hasLocalNormConfigured: boolean;
  hasJustification?: boolean;
  recipientJurisdiction?: 'municipal' | 'state' | 'federal';
  profileJurisdiction?: 'municipal' | 'state' | 'federal';
}

/**
 * Red Flag Checker & Legal Context Engine (Sections 7, 24.1, 24.6).
 * Alerts and explains risks without replacing human/legal review.
 */
export function runRedFlagChecker(input: RedFlagInput): RedFlagFinding[] {
  const findings: RedFlagFinding[] = [];
  const text = input.content || '';

  if (!input.hasLocalNormConfigured) {
    findings.push({
      code: 'LOCAL_NORM_MISSING',
      severity: 'high',
      title: 'Norma local não configurada',
      description:
        'Lei Orgânica, Constituição Estadual ou Regimento Interno não estão configurados para este perfil.',
      suggestion: 'Configure as normas locais ou valide manualmente antes de protocolar.',
    });
  }

  // Placeholders check
  if (/(\[.*?\]|\{\{.*?\}\}|___+|PREENCHER)/i.test(text)) {
    findings.push({
      code: 'UNRESOLVED_PLACEHOLDER',
      severity: 'critical',
      title: 'Placeholders não preenchidos',
      description: 'O texto contém marcadores pendentes (ex: [campo], {{variável}}, ___).',
      suggestion: 'Substitua todos os campos pendentes antes de aprovar ou exportar.',
    });
  }

  // Budget / reserved initiative heuristic
  if (/(cria\s+despesa|dotação\s+orçamentária|atribuição\s+ao\s+executivo|secretaria\s+municipal\s+deverá)/i.test(text)) {
    findings.push({
      code: 'RESERVED_INITIATIVE_RISK',
      severity: 'high',
      title: 'Possível risco de iniciativa reservada ou impacto orçamentário',
      description:
        'A minuta menciona criação de despesa ou atribuição a órgão do Executivo.',
      suggestion:
        'Verifique iniciativa reservada (CF art. 61 / Lei Orgânica) e compatibilidade orçamentária.',
    });
  }

  // Cross-jurisdiction recipient
  if (
    input.recipientJurisdiction &&
    input.profileJurisdiction &&
    input.recipientJurisdiction !== input.profileJurisdiction
  ) {
    findings.push({
      code: 'CROSS_JURISDICTION_RECIPIENT',
      severity: 'medium',
      title: 'Destinatário de outra esfera',
      description: `Perfil (${input.profileJurisdiction}) difere da esfera do destinatário (${input.recipientJurisdiction}).`,
      suggestion: 'Confirme se o instrumento e a competência permitem o encaminhamento.',
    });
  }

  // Excessive personal data (CPF pattern)
  if (/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(text)) {
    findings.push({
      code: 'PII_CPF_DETECTED',
      severity: 'medium',
      title: 'Dado pessoal (CPF) detectado no corpo',
      description: 'Identificado padrão de CPF no texto do documento.',
      suggestion: 'Avalie minimização de dados (LGPD) se o documento for público.',
    });
  }

  // Missing justification
  if (input.hasJustification === false) {
    findings.push({
      code: 'MISSING_JUSTIFICATION',
      severity: 'medium',
      title: 'Justificativa ausente',
      description: 'O documento não possui justificativa preenchida.',
      suggestion: 'Inclua os fundamentos fáticos e jurídicos do pedido.',
    });
  }

  return findings;
}
