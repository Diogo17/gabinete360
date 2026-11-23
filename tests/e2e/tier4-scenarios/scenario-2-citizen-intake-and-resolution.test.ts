import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 4: Scenario 2 — Citizen Intake, Demand Triage & Agenda Scheduling (S2)', { tier: 4 }, () => {
  test('S2: Complete legislative cabinet workflow from citizen arrival to dashboard KPI resolution', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-ana',
      membershipStatus: 'active'
    });

    // Step 1: Staff registers citizen in CRM
    const citizen = {
      id: 'cit-s2-01',
      organization_id: 'org-gabinete-mariana',
      display_name: 'Dona Maria de Lourdes',
      phone: '+55 11 98877-6655',
      preferred_channel: 'whatsapp',
      neighborhood: 'Jardim das Flores'
    };
    await env.client.from('citizens').insert(citizen);

    const citizens = await env.client.from('citizens').select();
    assertEqual(citizens.data.length, 1, 'S2 Step 1: Citizen registered in CRM');
    assertEqual(citizens.data[0].display_name, 'Dona Maria de Lourdes', 'Citizen name verified');

    // Step 2: Create priority demand linked to citizen
    const demand = {
      id: 'dem-s2-01',
      organization_id: 'org-gabinete-mariana',
      citizen_id: 'cit-s2-01',
      title: 'Iluminação pública na Rua das Flores',
      category: 'iluminacao',
      priority: 'urgent',
      status: 'received'
    };
    await env.client.from('demands').insert(demand);

    const demands = await env.client.from('demands').select();
    assertEqual(demands.data.length, 1, 'S2 Step 2: Demand registered');
    assertEqual(demands.data[0].priority, 'urgent', 'Priority is urgent');
    assertEqual(demands.data[0].citizen_id, 'cit-s2-01', 'Demand linked to citizen');

    // Step 3: Assign staff handler (Ana Souza)
    const assignment = {
      id: 'asg-s2-01',
      organization_id: 'org-gabinete-mariana',
      demand_id: 'dem-s2-01',
      assigned_to: 'usr-adv-ana',
      status: 'active'
    };
    await env.client.from('demand_assignments').insert(assignment);

    const assignments = await env.client.from('demand_assignments').select();
    assertEqual(assignments.data.length, 1, 'S2 Step 3: Staff handler assigned');
    assertEqual(assignments.data[0].assigned_to, 'usr-adv-ana', 'Assigned to Ana Souza');

    // Step 4: Schedule Hearing / Meeting on Agenda
    const agendaHearing = {
      id: 'evt-s2-01',
      organization_id: 'org-gabinete-mariana',
      title: 'Atendimento presencial — Dona Maria de Lourdes',
      starts_at: '2026-11-23T10:30:00Z',
      ends_at: '2026-11-23T11:00:00Z',
      location: 'Gabinete Parlamentar - Sala 3',
      visibility: 'private'
    };
    await env.client.from('agenda_events').insert(agendaHearing);

    const events = await env.client.from('agenda_events').select();
    assertEqual(events.data.length, 1, 'S2 Step 4: Hearing scheduled in Agenda');
    assertEqual(events.data[0].title, 'Atendimento presencial — Dona Maria de Lourdes', 'Hearing title matches');

    // Step 5: Verify Dashboard KPI Update
    const currentDemands = await env.client.from('demands').select();
    const openCount = currentDemands.data.filter(d => ['received', 'in_progress', 'triage'].includes(d.status)).length;
    assertEqual(openCount, 1, 'S2 Step 5: Dashboard KPI reflects 1 open demand');
    assertTrue(events.data[0].starts_at.includes('10:30'), 'Agenda reflects 10:30 appointment');
  });
});
