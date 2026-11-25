export interface TerritorialLegalConfig {
  jurisdiction: 'municipal' | 'state' | 'federal';
  state?: string;
  municipality?: string;
  organicLawOrConstitutionConfigured: boolean;
  internalRulesConfigured: boolean;
  lastReviewedAt?: string;
}

export interface TerritorialConfigStatus {
  status: 'incomplete' | 'review_needed' | 'active';
  alerts: string[];
}

/**
 * Evaluates territorial legal configuration completeness (Section 24.15).
 */
export function evaluateTerritorialConfig(
  config: TerritorialLegalConfig
): TerritorialConfigStatus {
  const alerts: string[] = [];

  if (!config.organicLawOrConstitutionConfigured) {
    alerts.push(
      config.jurisdiction === 'municipal'
        ? 'Lei Orgânica Municipal não configurada — validar manualmente.'
        : 'Constituição Estadual/Federal não configurada — validar manualmente.'
    );
  }

  if (!config.internalRulesConfigured) {
    alerts.push('Regimento Interno não configurado — validar manualmente.');
  }

  if (!config.lastReviewedAt) {
    alerts.push('Configuração jurídica sem data de revisão registrada.');
  }

  const status =
    !config.organicLawOrConstitutionConfigured || !config.internalRulesConfigured
      ? 'incomplete'
      : !config.lastReviewedAt
        ? 'review_needed'
        : 'active';

  return { status, alerts };
}
