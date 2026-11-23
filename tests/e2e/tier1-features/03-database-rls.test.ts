import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertFileContains,
  assertTrue,
  assertEqual
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 1: Database Migrations Package & RLS Security (F7, F8)', { tier: 1 }, () => {
  // Feature 7: Database Migrations Package
  test('F7.1: Control Plane foundation migrations and schema structures', () => {
    assertFileExists('gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql', 'CP migration must exist');
    assertFileContains('gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql', 'create table if not exists public.platform_tenants', 'Must create platform_tenants table');
    assertFileContains('gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql', 'create table if not exists public.platform_admins', 'Must create platform_admins table');
    assertFileContains('gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql', 'create table if not exists public.platform_audit_events', 'Must create platform_audit_events table');
    assertFileContains('gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql', 'create table if not exists public.tenant_provisioning_jobs', 'Must create tenant_provisioning_jobs table');
  });

  test('F7.2: Operational Plane foundation migrations and composite key constraints', () => {
    assertFileExists('gabinete_digital_360_sql_package_v1/operational_plane/migrations/001_operational_foundation.sql', 'OP migration must exist');
    assertFileContains('gabinete_digital_360_sql_package_v1/operational_plane/migrations/001_operational_foundation.sql', 'create table if not exists public.organizations', 'Must create organizations table');
    assertFileContains('gabinete_digital_360_sql_package_v1/operational_plane/migrations/001_operational_foundation.sql', 'create table if not exists public.workspaces', 'Must create workspaces table');
    assertFileContains('gabinete_digital_360_sql_package_v1/operational_plane/migrations/001_operational_foundation.sql', 'create table if not exists public.demands', 'Must create demands table');
    assertFileContains('gabinete_digital_360_sql_package_v1/operational_plane/migrations/001_operational_foundation.sql', 'unique (organization_id, id)', 'Must enforce composite unique key on workspaces');
  });

  // Feature 8: Database Security & RLS Validation
  test('F8.1: Defense-in-depth privilege revocation on Control Plane', () => {
    assertFileContains(
      'gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql',
      'revoke all on table public.%I from anon, authenticated',
      'Must revoke all privileges on CP tables from anon and authenticated'
    );
    assertFileContains(
      'gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql',
      'enable row level security',
      'Must enable RLS on CP tables'
    );
    assertFileExists('gabinete_digital_360_sql_package_v1/TEST_MATRIX.md', 'TEST_MATRIX.md must exist');
    assertFileContains('gabinete_digital_360_sql_package_v1/TEST_MATRIX.md', 'CP-01', 'Matrix must specify CP-01');
    assertFileContains('gabinete_digital_360_sql_package_v1/TEST_MATRIX.md', 'OP-01', 'Matrix must specify OP-01');
  });

  test('F8.2: Operational Plane RLS membership verification in mock environment', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-test-uuid',
      userId: 'user-advisor-1',
      membershipStatus: 'active'
    });

    env.client.seed('demands', [
      { id: 'dem-1', organization_id: 'org-test-uuid', title: 'Demanda Gabinete A' },
      { id: 'dem-2', organization_id: 'foreign-org-uuid', title: 'Demanda Gabinete B' }
    ]);

    const result = await env.client.from('demands').select();
    assertEqual(result.data.length, 1, 'Only tenant demands must be returned');
    assertEqual(result.data[0].id, 'dem-1', 'Must return only org-test-uuid demand');
    assertEqual(result.data[0].title, 'Demanda Gabinete A', 'Demanda title must match');
    assertEqual(result.count, 1, 'Count must equal 1');
    assertTrue(result.error === null, 'Error must be null');
  });

  test('F8.3: Segregation of confidential reports (Denúncias)', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-test-uuid',
      userId: 'user-advisor-1',
      membershipStatus: 'active'
    });

    env.client.seed('reports', [
      { id: 'rep-1', organization_id: 'org-test-uuid', protocol_code: 'DEN-2026-01' }
    ]);

    // Advisor without active grant receives 0 rows
    const noGrantResult = await env.client.from('reports').select();
    assertEqual(noGrantResult.data.length, 0, 'Advisor without grant receives 0 reports');

    // Seed active grant for user-advisor-1
    env.client.seed('report_access_grants', [
      {
        id: 'grant-1',
        organization_id: 'org-test-uuid',
        report_id: 'rep-1',
        user_id: 'user-advisor-1',
        expires_at: Date.now() + 3600000
      }
    ]);

    const withGrantResult = await env.client.from('reports').select();
    assertEqual(withGrantResult.data.length, 1, 'Investigator with active grant receives report');
    assertEqual(withGrantResult.data[0].protocol_code, 'DEN-2026-01', 'Report protocol must match');
    assertEqual(withGrantResult.count, 1, 'Report count must equal 1');
    assertTrue(withGrantResult.error === null, 'Report error must be null');
  });
});
