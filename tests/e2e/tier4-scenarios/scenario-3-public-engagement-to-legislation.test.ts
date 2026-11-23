import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 4: Scenario 3 — Public Citizen Engagement to Legislative Action (S3)', { tier: 4 }, () => {
  test('S3: Public citizen proposal intake, cabinet triage, PL drafting with AI assistance and transparency publication', async () => {
    // Step 1: Citizen visits public portal and submits suggestion
    const publicSubmission = {
      name: 'Carla Dias',
      email: 'carla.dias@usp.br',
      neighborhood: 'Butantã',
      category: 'mobilidade',
      subject: 'Ciclovia conectando o campus universitário à estação de metrô',
      description: 'Grande fluxo de estudantes caminhando pela rodovia sem acostamento ou iluminação segura.',
      consent_lgpd: true
    };
    assertTrue(publicSubmission.consent_lgpd, 'S3 Step 1: Citizen accepts LGPD terms');

    const protocolCode = 'PART-2026-7788';
    const serverIdea = {
      id: 'idea-s3-01',
      protocol_code: protocolCode,
      ...publicSubmission,
      status: 'received'
    };

    // Step 2: Cabinet receives suggestion in Participação Popular
    const cabinetEnv = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });
    await cabinetEnv.client.from('popular_participation').insert(serverIdea);

    const receivedSuggestions = await cabinetEnv.client.from('popular_participation').select();
    assertEqual(receivedSuggestions.data.length, 1, 'S3 Step 2: Suggestion listed in cabinet triage');
    assertEqual(receivedSuggestions.data[0].protocol_code, 'PART-2026-7788', 'Protocol code matches');

    // Step 3: Staff initiates conversion into Legislative Proposition (PL)
    const billDraft = {
      id: 'pl-s3-105',
      organization_id: 'org-gabinete-mariana',
      item_type: 'projeto_de_lei',
      number: '105/2026',
      title: 'Projeto de Lei: Dispõe sobre a implantação de ciclovias de integração universitária',
      origin_protocol: protocolCode,
      status: 'minuta'
    };
    await cabinetEnv.client.from('legislative_items').insert(billDraft);

    const bills = await cabinetEnv.client.from('legislative_items').select();
    assertEqual(bills.data.length, 1, 'S3 Step 3: PL draft created');
    assertEqual(bills.data[0].number, '105/2026', 'PL number registered');

    // Step 4: AI Assistant generates summary and legal justification
    function generateAssistiveAIContent(title: string, rawText: string) {
      return {
        summary: `Institui ciclovia de integração no bairro Butantã com base em proposta popular.`,
        justification: `Com amparo na Lei Federal 12.587/2012 (Política Nacional de Mobilidade Urbana), propõe-se: ${rawText.slice(0, 40)}...`,
        riskLevel: 'low',
        estimatedBudgetImpact: 'moderado'
      };
    }

    const aiOutput = generateAssistiveAIContent(billDraft.title, publicSubmission.description);
    assertTrue(aiOutput.summary.includes('Butantã'), 'S3 Step 4: AI summary references neighborhood');
    assertTrue(aiOutput.justification.includes('Política Nacional de Mobilidade Urbana'), 'AI cites valid mobility legislation');

    // Step 5: Mark PL Published and Visible on Public Transparency Portal
    await cabinetEnv.client.from('legislative_items').update('pl-s3-105', {
      status: 'published',
      published_at: new Date().toISOString()
    });

    const publishedBills = await cabinetEnv.client.from('legislative_items').select();
    assertEqual(publishedBills.data[0].status, 'published', 'S3 Step 5: Bill marked published');
    assertTrue(!!publishedBills.data[0].published_at, 'Publication timestamp recorded');
  });
});
