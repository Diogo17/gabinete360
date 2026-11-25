export interface ConfidencePanelInput {
  providedFieldsCount: number;
  requiredFieldsCount: number;
  verifiedSourcesCount: number;
  unverifiedReferencesCount: number;
  redFlagsCount: number;
}

export interface ConfidencePanelSummary {
  completenessPercent: number;
  statusLabel: string;
  disclaimer: string;
}

/**
 * Measures document completeness and evidence coverage (Section 24.2).
 * Never uses completeness score as a guarantee of legal validity.
 */
export function buildConfidencePanel(input: ConfidencePanelInput): ConfidencePanelSummary {
  const ratio =
    input.requiredFieldsCount > 0
      ? Math.min(1, input.providedFieldsCount / input.requiredFieldsCount)
      : 1;
  const completenessPercent = Math.round(ratio * 100);

  let statusLabel = 'Pronto para revisão humana';
  if (input.redFlagsCount > 0 || input.unverifiedReferencesCount > 0) {
    statusLabel = 'Requer revisão jurídica/factual';
  } else if (completenessPercent < 100) {
    statusLabel = 'Campos obrigatórios pendentes';
  }

  return {
    completenessPercent,
    statusLabel,
    disclaimer:
      'Este indicador mede completude e cobertura de evidências, não validade jurídica.',
  };
}
