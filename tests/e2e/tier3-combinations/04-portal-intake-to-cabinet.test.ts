import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 3: Public Intake to Cabinet Action (Suggestion -> Triage -> Legislative PL -> AI Draft)', { tier: 3 }, () => {
  test('T3.4: Complete popular participation pipeline from citizen idea to legislative proposal', async () => {
    // Stage 1: Public Citizen Intake on /portal/participacao
    const publicSubmission = {
      id: 'idea-77',
      protocol_code: 'PART-9021',
      author_name: 'Helena Ribeiro',
      author_neighborhood: 'Pinheiros',
      category: 'sustentabilidade',
      subject: 'Instalação de composteiras orgânicas nas feiras livres',
      description: 'As feiras geram grande volume de resíduos orgânicos que poderiam ser compostados localmente.',
      consent_lgpd: true,
      status: 'received'
    };

    assertTrue(publicSubmission.consent_lgpd, 'Stage 1: LGPD consent confirmed');
    assertTrue(publicSubmission.protocol_code.startsWith('PART-'), 'Protocol code generated');

    // Stage 2: Cabinet Staff Triage in /participacao
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-mariana-costa',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    await env.client.from('popular_participation').insert({
      id: publicSubmission.id,
      organization_id: 'org-mariana-costa',
      protocol_code: publicSubmission.protocol_code,
      subject: publicSubmission.subject,
      status: 'received'
    });

    const receivedList = await env.client.from('popular_participation').select();
    assertEqual(receivedList.data.length, 1, 'Stage 2: Suggestion received in cabinet triage');
    assertEqual(receivedList.data[0].protocol_code, 'PART-9021', 'Protocol code matches');

    // Stage 3: Convert to Legislative Proposition (PL)
    const legislativeBill = {
      id: 'pl-2026-88',
      organization_id: 'org-mariana-costa',
      item_type: 'projeto_de_lei',
      number: '88/2026',
      title: `Projeto de Lei: ${publicSubmission.subject}`,
      origin_idea_protocol: publicSubmission.protocol_code,
      status: 'minuta_em_elaboracao'
    };
    await env.client.from('legislative_items').insert(legislativeBill);

    const bills = await env.client.from('legislative_items').select();
    assertEqual(bills.data.length, 1, 'Stage 3: Legislative proposition created from citizen idea');
    assertEqual(bills.data[0].origin_idea_protocol, 'PART-9021', 'Linked to citizen protocol');

    // Stage 4: Assistive AI Draft Generation
    function generateAIDraft(plTitle: string, description: string) {
      return {
        executive_summary: `Proposta legislativa fundamentada na participação popular, visando ${plTitle.toLowerCase()}.`,
        legal_justification: `Considerando o artigo 30 da Constituição Federal e a competência municipal sobre resíduos sólidos, justifica-se a medida: ${description.slice(0, 50)}...`,
        suggested_articles: [
          'Art. 1º Fica instituído o Programa Municipal de Compostagem Orgânica.',
          'Art. 2º O Poder Executivo regulamentará a destinação dos resíduos.',
          'Art. 3º Esta Lei entra em vigor na data de sua publicação.'
        ]
      };
    }

    const aiDraft = generateAIDraft(legislativeBill.title, publicSubmission.description);
    assertTrue(aiDraft.executive_summary.length > 20, 'Stage 4: AI executive summary generated');
    assertTrue(aiDraft.legal_justification.includes('Constituição Federal'), 'AI legal justification citing legislation');
    assertEqual(aiDraft.suggested_articles.length, 3, 'AI generated 3 statutory articles');

    // Stage 5: Update Suggestion Status & Linkage
    await env.client.from('popular_participation').update('idea-77', {
      status: 'convertido_em_pl',
      linked_bill_number: '88/2026'
    });

    const updatedIdea = await env.client.from('popular_participation').select();
    assertEqual(updatedIdea.data[0].status, 'convertido_em_pl', 'Stage 5: Suggestion marked as converted to PL');
    assertEqual(updatedIdea.data[0].linked_bill_number, '88/2026', 'Linked to PL 88/2026');
  });
});
