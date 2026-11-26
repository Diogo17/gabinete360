import type { TerritorialLegalConfig } from '../territorial-config';

export const JANUARIA_MG_LEGAL_PRESET = {
  municipality: 'Januária',
  state: 'MG',
  institutionName: 'Câmara Municipal de Januária',
  seats: 15, // LOM Art. 20, § 2º (Emenda nº 17/2011)
  legislativePeriods: ['15/02 a 30/06', '01/08 a 15/12'] as const, // LOM Art. 21
  ordinarySessionsPerMonth: 2, // RI Art. 22, § 1º
  sessionSchedule: '20:30 às 23:30', // RI Art. 22, § 3º
  deadlines: {
    infoRequestDays: 15, // LOM Art. 67, XIV / RI Art. 247
    executiveUrgencyDays: 45, // LOM Art. 51 / RI Art. 198
    sanctionOrVetoBusinessDays: 15, // LOM Art. 52, § 1º / RI Art. 207, § 1º
    vetoAppreciationDays: 30, // LOM Art. 52, § 4º / RI Art. 207, § 4º
    commissionProjectDays: 10, // RI Art. 130, § 5º, I
    commissionOtherDays: 5, // RI Art. 130, § 5º, II
  },
  permanentCommissions: [
    'Comissão de Serviços Públicos Municipais',
    'Comissão de Assuntos Financeiros e Orçamentários',
    'Comissão de Legislação, Justiça e Redação',
    'Comissão de Acompanhamento e Fiscalização da Execução Orçamentária',
  ] as const, // RI Art. 101
  individualAmendmentRclPercent: 2, // LOM Art. 125-A (Emenda nº 22/2024)
  votingMethods: [
    'simbolico',
    'nominal',
    'escrutinio_secreto',
    'votacao_eletronica',
  ] as const, // RI Art. 228 (Resolução nº 6/2022)
  territorialConfig: {
    jurisdiction: 'municipal',
    state: 'MG',
    municipality: 'Januária',
    organicLawOrConstitutionConfigured: true,
    internalRulesConfigured: true,
    lastReviewedAt: '2026-11-25',
  } satisfies TerritorialLegalConfig,
};
