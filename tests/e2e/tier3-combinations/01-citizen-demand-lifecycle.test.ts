import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 3: Citizen Demand Lifecycle (CRM -> Intake -> Assignment -> Event -> KPI)', { tier: 3 }, () => {
  test('T3.1: End-to-end data flow from citizen intake to dashboard KPI aggregation', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-mariana-costa',
      userId: 'usr-advisor-1',
      membershipStatus: 'active'
    });

    // Step 1: Register citizen in CRM
    const citizen = {
      id: 'cit-901',
      organization_id: 'org-mariana-costa',
      display_name: 'Marcos Vinícius Silva',
      phone: '+55 11 91234-5678',
      neighborhood: 'Jardim Primavera',
      preferred_channel: 'whatsapp'
    };
    await env.client.from('citizens').insert(citizen);

    const citResult = await env.client.from('citizens').select();
    assertEqual(citResult.data.length, 1, 'Step 1: Citizen registered in CRM');
    assertEqual(citResult.data[0].id, 'cit-901', 'Citizen ID matches');

    // Step 2: Intake Demand linked to Citizen
    const demand = {
      id: 'dem-901',
      organization_id: 'org-mariana-costa',
      citizen_id: 'cit-901',
      title: 'Vazamento contínuo na rede pluvial',
      category: 'saneamento',
      priority: 'high',
      status: 'received'
    };
    await env.client.from('demands').insert(demand);

    const demResult = await env.client.from('demands').select();
    assertEqual(demResult.data.length, 1, 'Step 2: Demand registered');
    assertEqual(demResult.data[0].citizen_id, 'cit-901', 'Demand linked to citizen');
    assertEqual(demResult.data[0].priority, 'high', 'Priority recorded');

    // Step 3: Staff Assignment
    const assignment = {
      id: 'asg-901',
      organization_id: 'org-mariana-costa',
      demand_id: 'dem-901',
      assigned_to: 'mem-staff-2',
      assigned_by: 'usr-advisor-1',
      notes: 'Encaminhado para vistoria no local'
    };
    await env.client.from('demand_assignments').insert(assignment);

    const asgResult = await env.client.from('demand_assignments').select();
    assertEqual(asgResult.data.length, 1, 'Step 3: Assignment registered');
    assertEqual(asgResult.data[0].assigned_to, 'mem-staff-2', 'Assigned to staff');

    // Step 4: Demand Event History Timeline
    const event = {
      id: 'evt-dem-901',
      organization_id: 'org-mariana-costa',
      demand_id: 'dem-901',
      event_type: 'status_change',
      from_status: 'received',
      to_status: 'in_progress',
      created_by: 'usr-advisor-1'
    };
    await env.client.from('demand_events').insert(event);
    await env.client.from('demands').update('dem-901', { status: 'in_progress' });

    const evtResult = await env.client.from('demand_events').select();
    assertEqual(evtResult.data.length, 1, 'Step 4: Demand event logged in timeline');
    assertEqual(evtResult.data[0].to_status, 'in_progress', 'Event status transitioned');

    // Step 5: Dashboard KPI Aggregation
    const allDemands = await env.client.from('demands').select();
    const openDemandsCount = allDemands.data.filter(d => ['received', 'in_progress', 'triage'].includes(d.status)).length;
    assertEqual(openDemandsCount, 1, 'Step 5: Dashboard KPI calculates 1 open demand');

    // Step 6: Verify Joined Contract Integrity
    const joinedRecord = {
      citizenName: citResult.data[0].display_name,
      demandTitle: demResult.data[0].title,
      assignedStaff: asgResult.data[0].assigned_to,
      currentStatus: allDemands.data[0].status
    };
    assertEqual(joinedRecord.citizenName, 'Marcos Vinícius Silva', 'Joined record retains citizen');
    assertEqual(joinedRecord.demandTitle, 'Vazamento contínuo na rede pluvial', 'Joined record retains demand');
    assertEqual(joinedRecord.currentStatus, 'in_progress', 'Joined record retains active status');
  });
});
