import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  assertThrowsAsync
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 2: Edge Cases, Idempotency, Expirations & Composite Keys', { tier: 2 }, () => {
  // CP-06 / INT-01: Provisioning Job Idempotency
  test('B3.1: Provisioning job rejects duplicate idempotency_key (CP-06, INT-01)', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    const jobKey = 'idemp_key_unique_2026';

    // First insert succeeds
    await env.client.from('tenant_provisioning_jobs').insert({
      id: 'job-1',
      tenant_id: 't-1',
      idempotency_key: jobKey,
      status: 'pending'
    });

    // Replay attempt with same idempotency key fails
    await assertThrowsAsync(
      async () => {
        await env.client.from('tenant_provisioning_jobs').insert({
          id: 'job-2',
          tenant_id: 't-1',
          idempotency_key: jobKey,
          status: 'pending'
        });
      },
      'Unique Constraint Violation: duplicate idempotency_key',
      'Duplicate idempotency key must be rejected'
    );
  });

  // CP-07: Expired JIT Support Grant
  test('B3.2: Expired JIT support grant blocks operational access (CP-07)', async () => {
    const pastTime = Date.now() - 3600000; // 1 hour ago
    const env = createMockEnvironment({
      actor: 'jit_support',
      organizationId: 'org-client-1',
      userId: 'adm-support-1',
      jitExpiresAt: pastTime
    });

    env.client.seed('demands', [{ id: 'dem-1', organization_id: 'org-client-1', title: 'Demanda' }]);

    await assertThrowsAsync(
      async () => { await env.client.from('demands').select(); },
      'Access Denied: JIT support grant has expired',
      'Expired JIT support grant must deny query execution'
    );
  });

  // OP-04: Suspended Membership Access Denial
  test('B3.3: Suspended or revoked membership returns zero rows (OP-04)', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-client-1',
      userId: 'user-suspended',
      membershipStatus: 'suspended'
    });

    env.client.seed('demands', [
      { id: 'dem-1', organization_id: 'org-client-1', title: 'Demanda de Gabinete' }
    ]);

    const result = await env.client.from('demands').select();
    assertEqual(result.data.length, 0, 'Suspended member receives 0 rows');
    assertEqual(result.count, 0, 'Count is 0 for suspended user');

    // Switch to revoked status
    env.client.setSession({ ...env.client.getSession(), membershipStatus: 'revoked' });
    const revokedResult = await env.client.from('demands').select();
    assertEqual(revokedResult.data.length, 0, 'Revoked member receives 0 rows');
    assertEqual(revokedResult.count, 0, 'Count is 0 for revoked user');
  });

  // JIT Support 2-Person Integrity Check
  test('B3.4: JIT support access request prevents self-approval', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });

    await assertThrowsAsync(
      async () => {
        await env.client.from('support_access_requests').insert({
          id: 'req-self',
          tenant_id: 't-1',
          requested_by: 'adm-operator-1',
          approved_by: 'adm-operator-1', // Self-approval prohibited
          purpose: 'Tentativa de auto-aprovação'
        });
      },
      'Check Constraint Violation: support access cannot be self-approved',
      'Self-approval of support access must throw check constraint error'
    );
  });

  // OP-10: Composite Foreign Key Mismatch Prevention
  test('B3.5: Forged foreign workspace_id rejected by composite key (OP-10)', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-a-uuid',
      userId: 'user-1',
      membershipStatus: 'active'
    });

    // Seed workspace belonging to Org B
    env.client.seed('workspaces', [
      { id: 'ws-org-b', organization_id: 'org-b-uuid', name: 'Gabinete B' }
    ]);

    // Attempt to insert demand referencing Org A + ws-org-b (which belongs to Org B)
    await assertThrowsAsync(
      async () => {
        await env.client.from('demands').insert({
          organization_id: 'org-a-uuid',
          workspace_id: 'ws-org-b',
          title: 'Demanda com workspace forjado de outro tenant'
        });
      },
      'Composite FK Violation',
      'Mismatched (organization_id, workspace_id) must be rejected'
    );
  });

  // OP-07: Expired Denúncia Grant Access Denial
  test('B3.6: Expired report access grant returns zero rows (OP-07)', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-a-uuid',
      userId: 'investigator-1',
      membershipStatus: 'active'
    });

    env.client.seed('reports', [
      { id: 'rep-secret-1', organization_id: 'org-a-uuid', protocol_code: 'DEN-2026-99' }
    ]);

    // Grant expired 10 minutes ago
    env.client.seed('report_access_grants', [
      {
        id: 'grant-exp',
        organization_id: 'org-a-uuid',
        report_id: 'rep-secret-1',
        user_id: 'investigator-1',
        expires_at: Date.now() - 600000
      }
    ]);

    const result = await env.client.from('reports').select();
    assertEqual(result.data.length, 0, 'Investigator with expired grant receives 0 rows');
    assertEqual(result.count, 0, 'Count is 0 for expired grant');
  });

  // Subscription Date Constraint (ends_at > starts_at)
  test('B3.7: Tenant subscription with invalid date interval rejected', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });

    await assertThrowsAsync(
      async () => {
        await env.client.from('tenant_subscriptions').insert({
          tenant_id: 't-1',
          plan_id: 'plan-pro',
          starts_at: '2026-11-25T00:00:00Z',
          ends_at: '2026-11-20T00:00:00Z' // Earlier than starts_at
        });
      },
      'Check Constraint Violation: ends_at must be greater than starts_at',
      'Inverted subscription dates must be rejected'
    );
  });

  // Tenant Custom Domain Format
  test('B3.8: Custom domain hostname FQDN format boundaries', () => {
    const fqdnRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    function validateDomain(hostname: string): boolean {
      if (!hostname || !fqdnRegex.test(hostname)) {
        throw new Error('Hostname deve ser um FQDN válido (ex: gabinete.leg.br)');
      }
      return true;
    }

    assertThrows(() => validateDomain('not_a_domain'), 'Hostname deve ser um FQDN válido');
    assertThrows(() => validateDomain('http://gabinete.leg.br'), 'Hostname deve ser um FQDN válido');
    assertThrows(() => validateDomain('gabinete.leg.br/path'), 'Hostname deve ser um FQDN válido');
    assertTrue(validateDomain('gabinete.marianacosta.leg.br'), 'Valid leg.br subdomain passes');
    assertTrue(validateDomain('camaracampinas.sp.gov.br'), 'Valid gov.br domain passes');
  });

  // Plan Limits Non-Negative Validation
  test('B3.9: Commercial plan limits cannot specify negative quotas', () => {
    function validatePlanLimits(limits: { max_users: number; max_storage_gb: number; max_demands_monthly: number }): boolean {
      if (limits.max_users < 1) throw new Error('Limite de usuários deve ser pelo menos 1');
      if (limits.max_storage_gb < 0) throw new Error('Armazenamento não pode ser negativo');
      if (limits.max_demands_monthly < 0) throw new Error('Limite de demandas não pode ser negativo');
      return true;
    }

    assertThrows(() => validatePlanLimits({ max_users: 0, max_storage_gb: 10, max_demands_monthly: 500 }), 'Limite de usuários deve ser pelo menos 1');
    assertThrows(() => validatePlanLimits({ max_users: 5, max_storage_gb: -1, max_demands_monthly: 500 }), 'Armazenamento não pode ser negativo');
    assertThrows(() => validatePlanLimits({ max_users: 5, max_storage_gb: 10, max_demands_monthly: -100 }), 'Limite de demandas não pode ser negativo');
    assertTrue(validatePlanLimits({ max_users: 10, max_storage_gb: 50, max_demands_monthly: 1000 }), 'Valid plan limits pass');
  });
});
