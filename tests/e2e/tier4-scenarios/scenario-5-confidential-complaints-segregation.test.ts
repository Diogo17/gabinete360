import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 4: Scenario 5 — Confidential Complaints & Segregated Inspection Lifecycle (S5)', { tier: 4 }, () => {
  test('S5: Confidential whistleblower complaint intake, RLS segregation, audited inspection and tenant boundary isolation', async () => {
    // Step 1: Whistleblower submits anonymous complaint via secure channel
    const whistleblowerEnv = createMockEnvironment({
      actor: 'whistleblower',
      organizationId: 'org-gabinete-mariana'
    });

    const report = {
      id: 'rep-s5-0042',
      organization_id: 'org-gabinete-mariana',
      protocol_code: 'DEN-2026-0042',
      intake_mode: 'anonymous',
      restricted_payload: 'Desvio de recursos na merenda escolar da EMEF Central',
      status: 'received',
      _serverActionContext: true
    };
    await whistleblowerEnv.client.from('reports').insert(report);

    const wbReports = await whistleblowerEnv.client.from('reports').select();
    assertEqual(wbReports.data.length, 1, 'S5 Step 1: Anonymous report registered');
    assertEqual(wbReports.data[0].protocol_code, 'DEN-2026-0042', 'Protocol code matches');
    assertFalse(!!wbReports.data[0].citizen_id, 'No citizen identity stored');

    // Step 2: Regular staff advisor queries /reports -> receives exactly 0 rows
    const advisorEnv = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-adv-carlos',
      membershipStatus: 'active'
    });
    // Copy the seeded table to advisor's DB view
    advisorEnv.client.seed('reports', whistleblowerEnv.client.getTable('reports'));

    const advisorReports = await advisorEnv.client.from('reports').select();
    assertEqual(advisorReports.data.length, 0, 'S5 Step 2: Regular advisor receives 0 confidential reports');

    // Step 3: Authorized investigator receives time-bounded access grant
    const grant = {
      id: 'grant-s5-01',
      organization_id: 'org-gabinete-mariana',
      report_id: 'rep-s5-0042',
      user_id: 'usr-investigator-helen',
      purpose: 'Vistoria oficial de fiscalização da denúncia DEN-2026-0042',
      expires_at: Date.now() + 7200000 // 2 hours valid
    };

    const investigatorEnv = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-gabinete-mariana',
      userId: 'usr-investigator-helen',
      membershipStatus: 'active'
    });
    investigatorEnv.client.seed('reports', whistleblowerEnv.client.getTable('reports'));
    investigatorEnv.client.seed('report_access_grants', [grant]);

    const grantedReport = await investigatorEnv.client.from('reports').select();
    assertEqual(grantedReport.data.length, 1, 'S5 Step 3: Authorized investigator with active grant can view report');
    assertEqual(grantedReport.data[0].protocol_code, 'DEN-2026-0042', 'Investigator sees granted report');

    // Step 4: Investigator conducts field inspection and documents evidence
    const inspectionCase = {
      id: 'fisc-s5-09',
      organization_id: 'org-gabinete-mariana',
      case_number: 'FISC-2026-009',
      linked_report_protocol: 'DEN-2026-0042',
      location: 'EMEF Central - Av. dos Bandeirantes, 450',
      findings_summary: 'Comprovada a ausência de gêneros alimentícios registrados em nota fiscal',
      evidence_count: 6,
      status: 'encaminhado_ministerio_publico'
    };
    await investigatorEnv.client.from('inspection_cases').insert(inspectionCase);

    const inspections = await investigatorEnv.client.from('inspection_cases').select();
    assertEqual(inspections.data.length, 1, 'S5 Step 4: Inspection case logged');
    assertEqual(inspections.data[0].evidence_count, 6, '6 evidence items documented');
    assertEqual(inspections.data[0].status, 'encaminhado_ministerio_publico', 'Referred to Public Prosecutor');

    // Step 5: Cross-tenant RLS isolation: User from Tenant B queries reports -> 0 rows
    const foreignTenantEnv = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'foreign-tenant-uuid',
      userId: 'usr-foreign-1',
      membershipStatus: 'active'
    });
    foreignTenantEnv.client.seed('reports', whistleblowerEnv.client.getTable('reports'));

    const foreignReports = await foreignTenantEnv.client.from('reports').select();
    assertEqual(foreignReports.data.length, 0, 'S5 Step 5: Foreign tenant receives 0 rows (RLS isolated)');
  });
});
