import { JANUARIA_MG_LEGAL_PRESET } from './presets/januaria-mg';
import type { SignatureLevel } from '../signature/types';

export interface CouncilorAccessPlan {
  councilorName: string;
  party?: string;
  profile: {
    jurisdiction: 'municipal';
    institutionType: 'city_council';
    parliamentaryRole: 'vereador';
    municipality: string;
    state: string;
  };
  territorialPreset: typeof JANUARIA_MG_LEGAL_PRESET;
  defaultSignatureLevel: SignatureLevel;
  enabledDocumentTypes: string[];
  structuredOnboardingSteps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
}

/**
 * Generates a structured access & configuration plan for a Vereador of Januária-MG,
 * pre-loading LOM nº 1/1990 (Emenda 22/2024) and Regimento Interno nº 1/1990 (Resolução 2/2024).
 */
export function buildJanuariaCouncilorAccessPlan(
  councilorName: string,
  party?: string
): CouncilorAccessPlan {
  return {
    councilorName,
    party,
    profile: {
      jurisdiction: 'municipal',
      institutionType: 'city_council',
      parliamentaryRole: 'vereador',
      municipality: JANUARIA_MG_LEGAL_PRESET.municipality,
      state: JANUARIA_MG_LEGAL_PRESET.state,
    },
    territorialPreset: JANUARIA_MG_LEGAL_PRESET,
    defaultSignatureLevel: 'advanced_native',
    enabledDocumentTypes: [
      'projeto_de_lei',
      'projeto_de_lei_complementar',
      'projeto_de_resolucao',
      'decreto_legislativo',
      'emenda_lei_organica',
      'requerimento',
      'indicacao',
      'mocao',
      'pedido_informacao',
      'oficio',
      'relatorio_fiscalizacao',
    ],
    structuredOnboardingSteps: [
      {
        step: 1,
        title: 'Perfil Parlamentar e Território',
        description:
          'Vincular Vereador à Câmara Municipal de Januária-MG (15 cadeiras, LOM Art. 20, § 2º).',
      },
      {
        step: 2,
        title: 'Normas Locais e Prazos Regimentais',
        description:
          'Ativar prazos da LOM e RI (15 dias pedido de informação, 45 dias urgência, 10/5 dias comissões).',
      },
      {
        step: 3,
        title: 'Política de Assinatura 360°',
        description:
          'Configurar Assinatura Avançada Nativa para ofícios/requerimentos e validação em /validar-assinatura.',
      },
      {
        step: 4,
        title: 'Revisão de Identidade Institucional',
        description:
          'Confirmar brasão autorizado, cabeçalho, rodapé e equipe do gabinete (RBAC).',
      },
    ],
  };
}
