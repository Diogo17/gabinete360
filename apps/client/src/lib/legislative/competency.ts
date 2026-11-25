export interface CompetencyAlert {
  level: "warning" | "info";
  code: string;
  message: string;
}

/**
 * Motor de Competência e Alertas Jurídicos.
 * Não substitui parecer jurídico ou revisão humana.
 */
export function checkDocumentCompetency(params: {
  jurisdiction?: "municipal" | "state" | "federal" | null;
  kind: string;
  content: string;
  hasLocalNormConfigured?: boolean;
}): CompetencyAlert[] {
  const alerts: CompetencyAlert[] = [];
  const lower = (params.content || "").toLowerCase();

  if (!params.hasLocalNormConfigured) {
    alerts.push({
      level: "warning",
      code: "LOCAL_NORM_NOT_CONFIGURED",
      message: "Norma local (Lei Orgânica / Regimento Interno) não configurada — validar manualmente.",
    });
  }

  if (
    params.kind === "projeto_lei" &&
    (lower.includes("cria cargo") ||
      lower.includes("despesa") ||
      lower.includes("secretaria") ||
      lower.includes("orçamento"))
  ) {
    alerts.push({
      level: "warning",
      code: "RESERVED_INITIATIVE_RISK",
      message:
        "A minuta pode criar atribuições ou despesa para órgão do Executivo. Verifique iniciativa reservada, norma local e jurisprudência.",
    });
  }

  if (lower.includes("cpf") || lower.includes("rg ") || lower.includes("prontuário")) {
    alerts.push({
      level: "info",
      code: "LGPD_SENSITIVE_DATA",
      message: "Possível presença de dados pessoais/sensíveis. Garanta minimização e sigilo conforme LGPD.",
    });
  }

  return alerts;
}
