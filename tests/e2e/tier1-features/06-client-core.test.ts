import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertFileContains,
  assertDemoWatermark,
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 1: Client Operational Core Modules (F22 to F26)', { tier: 1 }, () => {
  // Feature 22: Client Dashboard Parlamentar
  test('F22: Client parliamentary dashboard rendering and layout widgets', () => {
    assertFileExists('apps/client/src/app/page.tsx', 'Client page.tsx must exist');
    assertFileContains('apps/client/src/app/page.tsx', 'StatCard', 'Must render StatCard components');
    assertFileContains('apps/client/src/app/page.tsx', 'AgendaEventItem', 'Must render AgendaEventItem');
    assertFileContains('apps/client/src/app/page.tsx', 'FilterChip', 'Must render FilterChip');
    assertFileContains('apps/client/src/app/page.tsx', 'AppShell', 'Must render AppShell layout');
  });

  // Feature 23: Client CRM de Cidadãos
  test('F23: Citizen directory registration and communication preferences', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const citizen = {
      id: 'cit-101',
      organization_id: 'org-gabinete-mariana',
      display_name: 'João Pereira da Silva',
      email: 'joao.pereira@gmail.com',
      phone: '+55 11 98765-4321',
      preferred_channel: 'whatsapp',
      neighborhood: 'Vila Mariana'
    };

    await env.client.from('citizens').insert(citizen);
    const result = await env.client.from('citizens').select();

    assertEqual(result.data.length, 1, 'Citizen registered in tenant CRM');
    assertEqual(result.data[0].display_name, 'João Pereira da Silva', 'Citizen name matches');
    assertEqual(result.data[0].preferred_channel, 'whatsapp', 'Preferred channel is WhatsApp');
    assertEqual(result.data[0].neighborhood, 'Vila Mariana', 'Neighborhood matches');
    assertEqual(result.data[0].organization_id, 'org-gabinete-mariana', 'Scoped to cabinet org');
  });

  // Feature 24: Client Gestão de Demandas
  test('F24: Demands intake, triage lifecycle and priority tracking', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const demand = {
      id: 'dem-201',
      organization_id: 'org-gabinete-mariana',
      title: 'Reparo de iluminação pública na Praça da Sé',
      category: 'iluminacao',
      priority: 'urgent',
      status: 'received',
      citizen_id: 'cit-101'
    };

    await env.client.from('demands').insert(demand);
    let result = await env.client.from('demands').select();

    assertEqual(result.data.length, 1, 'Demand inserted');
    assertEqual(result.data[0].status, 'received', 'Initial status is received');
    assertEqual(result.data[0].priority, 'urgent', 'Priority is urgent');

    // Triage to in_progress
    await env.client.from('demands').update('dem-201', { status: 'in_progress' });
    result = await env.client.from('demands').select();
    assertEqual(result.data[0].status, 'in_progress', 'Status transitioned to in_progress');
    assertEqual(result.data[0].category, 'iluminacao', 'Category preserved');
  });

  // Feature 25: Client Agenda Parlamentar
  test('F25: Parliamentary agenda calendar scheduling and hearing tracking', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-1',
      membershipStatus: 'active'
    });

    const event = {
      id: 'evt-301',
      organization_id: 'org-gabinete-mariana',
      title: 'Audiência Pública sobre Mobilidade Urbana',
      starts_at: '2026-11-23T14:00:00Z',
      ends_at: '2026-11-23T16:00:00Z',
      location: 'Plenário da Câmara Municipal',
      visibility: 'public'
    };

    await env.client.from('agenda_events').insert(event);
    const result = await env.client.from('agenda_events').select();

    assertEqual(result.data.length, 1, 'Agenda event scheduled');
    assertEqual(result.data[0].title, 'Audiência Pública sobre Mobilidade Urbana', 'Title matches');
    assertEqual(result.data[0].visibility, 'public', 'Event is public');
    assertEqual(result.data[0].location, 'Plenário da Câmara Municipal', 'Location matches');
    assertTrue(new Date(result.data[0].ends_at) > new Date(result.data[0].starts_at), 'End after start');
  });

  // Feature 26: Client Gestão de Equipe & Tarefas
  test('F26: Staff members directory and task delegation', async () => {
    const env = createMockEnvironment({
      actor: 'owner',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-owner-1',
      membershipStatus: 'active'
    });

    const team = [
      { id: 'mem-1', organization_id: 'org-gabinete-mariana', name: 'Mariana Costa', role: 'owner' },
      { id: 'mem-2', organization_id: 'org-gabinete-mariana', name: 'Carlos Assessor', role: 'advisor' },
      { id: 'mem-3', organization_id: 'org-gabinete-mariana', name: 'Beatriz Atendente', role: 'attendant' }
    ];
    env.client.seed('memberships', team);

    const task = {
      id: 'tsk-401',
      organization_id: 'org-gabinete-mariana',
      title: 'Elaborar minuta de resposta ao Ministério Público',
      assigned_to: 'mem-2',
      status: 'pending'
    };
    await env.client.from('tasks').insert(task);

    const members = await env.client.from('memberships').select();
    const tasks = await env.client.from('tasks').select();

    assertEqual(members.data.length, 3, 'Staff directory lists 3 members');
    assertEqual(tasks.data.length, 1, '1 task delegated');
    assertEqual(tasks.data[0].assigned_to, 'mem-2', 'Assigned to Carlos Assessor');
    assertEqual(tasks.data[0].status, 'pending', 'Task status pending');
    assertEqual(members.data[0].role, 'owner', 'Cabinet owner verified');
  });
});
