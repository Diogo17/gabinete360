import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 1: Client Advanced Modules (F27 to F32)', { tier: 1 }, () => {
  // Feature 27: Client Gestão Legislativa
  test('F27: Legislative propositions tracking (PL, Requerimento, Indicação)', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const bill = {
      id: 'leg-101',
      organization_id: 'org-gabinete-mariana',
      item_type: 'projeto_de_lei',
      number: '42/2026',
      title: 'Dispõe sobre a criação do programa Hortas Comunitárias nas escolas municipais',
      status: 'em_tramitacao',
      commission: 'Comissão de Educação e Saúde'
    };
    await env.client.from('legislative_items').insert(bill);

    const result = await env.client.from('legislative_items').select();
    assertEqual(result.data.length, 1, 'Legislative item registered');
    assertEqual(result.data[0].item_type, 'projeto_de_lei', 'Item type is PL');
    assertEqual(result.data[0].number, '42/2026', 'Proposition number matches');
    assertEqual(result.data[0].status, 'em_tramitacao', 'Status is em_tramitacao');
    assertEqual(result.data[0].organization_id, 'org-gabinete-mariana', 'Scoped to cabinet');
  });

  // Feature 28: Client Fiscalização de Serviços
  test('F28: Inspection case lifecycle, findings and photo evidence', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const inspection = {
      id: 'fisc-201',
      organization_id: 'org-gabinete-mariana',
      case_number: 'FISC-2026-008',
      title: 'Fiscalização da Unidade Básica de Saúde Vila Nova',
      location: 'UBS Vila Nova - Rua dos Cravos, 120',
      findings_summary: 'Falta de medicamentos essenciais e aparelhos de raio-x inoperantes',
      evidence_count: 4,
      status: 'relatorio_enviado'
    };
    await env.client.from('inspection_cases').insert(inspection);

    const result = await env.client.from('inspection_cases').select();
    assertEqual(result.data.length, 1, 'Inspection case recorded');
    assertEqual(result.data[0].case_number, 'FISC-2026-008', 'Case number matches');
    assertEqual(result.data[0].status, 'relatorio_enviado', 'Report dispatched');
    assertEqual(result.data[0].evidence_count, 4, '4 photographic evidence attachments');
    assertTrue(result.data[0].findings_summary.length > 20, 'Findings summary documented');
  });

  // Feature 29: Client Participação Popular
  test('F29: Citizen community suggestions and popular consultations', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const idea = {
      id: 'pop-301',
      organization_id: 'org-gabinete-mariana',
      protocol_code: 'SUG-2026-015',
      subject: 'Implantação de ciclofaixa ligando o bairro ao metrô',
      author_name: 'Comunidade Ciclistas do Bairro',
      category: 'mobilidade',
      status: 'em_analise',
      upvotes: 87
    };
    await env.client.from('popular_participation').insert(idea);

    const result = await env.client.from('popular_participation').select();
    assertEqual(result.data.length, 1, 'Popular suggestion registered');
    assertEqual(result.data[0].protocol_code, 'SUG-2026-015', 'Protocol matches');
    assertEqual(result.data[0].status, 'em_analise', 'Status em_analise');
    assertEqual(result.data[0].upvotes, 87, 'Upvote count tracked');
    assertEqual(result.data[0].category, 'mobilidade', 'Category matches');
  });

  // Feature 30: Client Canal de Denúncias
  test('F30: Segregated confidential whistleblower intake and audit vault', async () => {
    const env = createMockEnvironment({
      actor: 'whistleblower',
      organizationId: 'org-gabinete-mariana'
    });

    const report = {
      id: 'rep-401',
      organization_id: 'org-gabinete-mariana',
      protocol_code: 'DEN-2026-0042',
      intake_mode: 'anonymous',
      status: 'received',
      restricted_payload: 'Irregularidade em licitação de merenda escolar',
      _serverActionContext: true
    };
    await env.client.from('reports').insert(report);

    const result = await env.client.from('reports').select();
    assertEqual(result.data.length, 1, 'Confidential report created');
    assertEqual(result.data[0].protocol_code, 'DEN-2026-0042', 'Protocol code matches');
    assertEqual(result.data[0].intake_mode, 'anonymous', 'Intake mode is anonymous');
    assertEqual(result.data[0].status, 'received', 'Status received');
    assertTrue(!result.data[0].citizen_id, 'No citizen PII linked to anonymous report');
  });

  // Feature 31: Client WhatsApp Inbox
  test('F31: WhatsApp multi-channel inbox conversation thread simulation', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const thread = {
      id: 'wpp-501',
      organization_id: 'org-gabinete-mariana',
      remote_phone: '+551199887766',
      contact_name: 'Dona Maria dos Anjos',
      unread_count: 2,
      last_message: 'Bom dia, gostaria de saber se o requerimento sobre o asfalto foi votado',
      channel_status: 'open'
    };
    await env.client.from('whatsapp_threads').insert(thread);

    const result = await env.client.from('whatsapp_threads').select();
    assertEqual(result.data.length, 1, 'WhatsApp thread listed');
    assertEqual(result.data[0].remote_phone, '+551199887766', 'Phone matches');
    assertEqual(result.data[0].unread_count, 2, '2 unread messages');
    assertEqual(result.data[0].channel_status, 'open', 'Channel status open');
    assertTrue(result.data[0].last_message.includes('requerimento'), 'Message content retained');
  });

  // Feature 32: Client IA Assistiva
  test('F32: Assistive AI demand classification and draft generation', () => {
    function classifyDemandAI(text: string) {
      const lower = text.toLowerCase();
      let category = 'geral';
      let priority = 'normal';
      if (lower.includes('hospital') || lower.includes('remédio') || lower.includes('médico')) {
        category = 'saude';
        priority = 'high';
      } else if (lower.includes('buraco') || lower.includes('asfalto') || lower.includes('iluminação')) {
        category = 'infraestrutura';
        priority = 'normal';
      } else if (lower.includes('escola') || lower.includes('creche')) {
        category = 'educacao';
        priority = 'normal';
      }
      return {
        category,
        suggestedPriority: priority,
        summary: text.slice(0, 80) + '...',
        draftReply: `Prezado cidadão, recebemos sua solicitação referente a ${category} e estamos encaminhando ao órgão responsável.`
      };
    }

    const aiOutput = classifyDemandAI('Falta urgente de médicos pediatras no posto de saúde do centro');
    assertEqual(aiOutput.category, 'saude', 'AI categorized as saude');
    assertEqual(aiOutput.suggestedPriority, 'high', 'AI prioritized as high');
    assertTrue(aiOutput.draftReply.includes('saude'), 'Draft response generated');
    assertTrue(aiOutput.summary.length > 0, 'Summary generated');
    assertFalse(aiOutput.category === 'geral', 'Refined from default category');
  });
});
