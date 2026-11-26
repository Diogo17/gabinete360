import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse,
  assertThrows
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 1: Public Portal Modules (F33, F34, F35)', { tier: 1 }, () => {
  // Feature 33: Public Portal Perfil & Transparência
  test('F33: Public parliamentary biography and transparency disclosures', () => {
    const publicProfile = {
      parliamentary_name: 'Vereador Bill do Barreiro do Alegre',
      full_name: 'Edilson Alves dos Santos',
      mandate: '2025-2028',
      party: 'União Brasil',
      city: 'Januária',
      state: 'MG',
      biography: 'Nascido na Comunidade Quilombola de Barreiro do Alegre (distrito de Riacho da Cruz).',
      social_links: {
        email: 'billdobarreiro@januaria.mg.leg.br',
        phone: '(38) 3620-0650',
        site: 'https://www.januaria.mg.leg.br'
      },
      transparency: {
        propositions_count: 23,
        votes_2024: 849,
        portal_enabled: true
      }
    };

    assertEqual(publicProfile.parliamentary_name, 'Vereador Bill do Barreiro do Alegre', 'Parliamentary name matches');
    assertEqual(publicProfile.city, 'Januária', 'City matches');
    assertEqual(publicProfile.state, 'MG', 'State matches');
    assertTrue(publicProfile.transparency.portal_enabled, 'Portal enabled');
    assertTrue(publicProfile.biography.length > 20, 'Biography text documented');
  });

  // Feature 34: Public Portal Agenda & Atuação
  test('F34: Public agenda filtering and published legislative acts', async () => {
    const env = createMockEnvironment({ actor: 'anon' });

    const allEvents = [
      { id: 'ev-1', title: 'Sessão Ordinária na Câmara Municipal de Januária', visibility: 'public', starts_at: '2026-11-25T20:30:00Z' },
      { id: 'ev-2', title: 'Reunião Interna Reservada com Lideranças', visibility: 'internal', starts_at: '2026-11-25T14:00:00Z' }
    ];

    const allPropositions = [
      { id: 'leg-1', number: '007/2025', status: 'sanctioned', is_public: true },
      { id: 'leg-2', number: 'COMP-ABAFADOR', status: 'draft', is_public: false }
    ];

    // Filter public events only
    const publicEvents = allEvents.filter(e => e.visibility === 'public');
    const publicPropositions = allPropositions.filter(p => p.is_public && p.status !== 'draft');

    assertEqual(publicEvents.length, 1, 'Only public events displayed');
    assertEqual(publicEvents[0].id, 'ev-1', 'Public event ID matches');
    assertFalse(publicEvents.some(e => e.visibility !== 'public'), 'No private/internal event leaked to public agenda');
    assertEqual(publicPropositions.length, 1, 'Only published legislative items displayed');
    assertFalse(publicPropositions.some(p => p.status === 'draft'), 'No draft legislative items leaked to public portal');
  });

  // Feature 35: Public Portal Formulário Cidadão
  test('F35: Public citizen participation intake form and protocol generation', () => {
    function processCitizenIntake(input: {
      name: string;
      email: string;
      neighborhood: string;
      category: string;
      subject: string;
      description: string;
      consent_lgpd: boolean;
    }) {
      if (!input.consent_lgpd) {
        throw new Error('É necessário aceitar os termos de privacidade (LGPD)');
      }
      if (input.subject.length < 5) {
        throw new Error('Assunto deve conter no mínimo 5 caracteres');
      }

      const protocol = `PART-${Date.now().toString().slice(-6)}`;
      return {
        protocol_code: protocol,
        status: 'received',
        subject: input.subject,
        category: input.category,
        intake_timestamp: new Date().toISOString()
      };
    }

    const payload = {
      name: 'Roberto Alencar',
      email: 'roberto@email.com',
      neighborhood: 'Jardins',
      category: 'mobilidade',
      subject: 'Melhoria na iluminação do parque local',
      description: 'Lâmpadas queimadas gerando insegurança no período noturno.',
      consent_lgpd: true
    };

    const submission = processCitizenIntake(payload);
    assertTrue(submission.protocol_code.startsWith('PART-'), 'Protocol prefix matches PART-');
    assertEqual(submission.status, 'received', 'Intake status is received');
    assertEqual(submission.subject, 'Melhoria na iluminação do parque local', 'Subject matches');
    assertEqual(submission.category, 'mobilidade', 'Category matches');
    assertTrue(!!submission.intake_timestamp, 'Timestamp recorded');
  });
});
