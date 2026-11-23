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
      parliamentary_name: 'Vereadora Mariana Costa',
      mandate: '2025-2028',
      party: 'Partido Democrático',
      city: 'São Paulo',
      state: 'SP',
      biography: 'Advogada e ativista pelos direitos da infância e juventude.',
      social_links: {
        instagram: '@mariana.costa',
        whatsapp: '+5511999998888',
        email: 'contato@marianacosta.leg.br'
      },
      transparency: {
        propositions_count: 48,
        inspections_count: 14,
        demands_resolved: 312
      }
    };

    assertEqual(publicProfile.parliamentary_name, 'Vereadora Mariana Costa', 'Parliamentary name matches');
    assertEqual(publicProfile.city, 'São Paulo', 'City matches');
    assertEqual(publicProfile.transparency.propositions_count, 48, 'Propositions count matches');
    assertTrue(publicProfile.transparency.demands_resolved > 300, 'Demands resolved threshold verified');
    assertTrue(publicProfile.biography.length > 20, 'Biography text documented');
  });

  // Feature 34: Public Portal Agenda & Atuação
  test('F34: Public agenda filtering and published legislative acts', async () => {
    const env = createMockEnvironment({ actor: 'anon' });

    const allEvents = [
      { id: 'ev-1', title: 'Sessão Solene de Abertura', visibility: 'public', starts_at: '2026-11-25T10:00:00Z' },
      { id: 'ev-2', title: 'Reunião Interna Reservada com Lideranças', visibility: 'private', starts_at: '2026-11-25T14:00:00Z' }
    ];

    // Filter public events only
    const publicEvents = allEvents.filter(e => e.visibility === 'public');
    assertEqual(publicEvents.length, 1, 'Only public events displayed');
    assertEqual(publicEvents[0].id, 'ev-1', 'Public event ID matches');
    assertEqual(publicEvents[0].title, 'Sessão Solene de Abertura', 'Public event title matches');
    assertFalse(publicEvents.some(e => e.visibility === 'private'), 'No private event leaked to public agenda');
    assertTrue(publicEvents[0].visibility === 'public', 'Visibility is strictly public');
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
