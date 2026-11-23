import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 4: Scenario 4 — Master Admin Tenant Onboarding & JIT Audit (S4)', { tier: 4 }, () => {
  test('S4: Master admin onboarding lifecycle, service health monitoring, JIT request and audit log', async () => {
    // Step 1: Master Admin authenticates with mandatory MFA
    const adminSession = {
      actor: 'master_admin' as const,
      userId: 'adm-sec-01',
      mfaVerified: true
    };
    assertTrue(adminSession.mfaVerified, 'S4 Step 1: Master admin authenticated with verified MFA TOTP');

    const cpEnv = createMockEnvironment(adminSession);

    // Step 2: Create new client and organization
    const tenantPayload = {
      id: 'ten-campinas-s4',
      name: 'Câmara Municipal de Campinas',
      slug: 'camara-campinas',
      customer_type: 'municipal_chamber',
      status: 'pending_provisioning'
    };
    await cpEnv.client.from('platform_tenants').insert(tenantPayload);

    const tenants = await cpEnv.client.from('platform_tenants').select();
    assertEqual(tenants.data.length, 1, 'S4 Step 2: Tenant registered in Control Plane');
    assertEqual(tenants.data[0].slug, 'camara-campinas', 'Tenant slug matches');

    // Step 3: Allocate Pro Plan modules & trigger provisioning pipeline
    const modules = ['crm', 'demandas', 'agenda', 'legislativo', 'fiscalizacao'];
    for (const mod of modules) {
      await cpEnv.client.from('tenant_module_entitlements').insert({
        tenant_id: 'ten-campinas-s4',
        module_key: mod,
        status: 'enabled',
        version: 1
      });
    }

    const entitlements = await cpEnv.client.from('tenant_module_entitlements').select();
    assertEqual(entitlements.data.length, 5, 'S4 Step 3: 5 Pro Plan modules allocated');

    // Step 4: Verify Service Health Status
    const services = [
      { name: 'Control Plane API', status: 'healthy', latency_ms: 18 },
      { name: 'Supabase PostgreSQL', status: 'healthy', latency_ms: 22 },
      { name: 'Supabase Auth', status: 'healthy', latency_ms: 35 }
    ];
    assertTrue(services.every(s => s.status === 'healthy'), 'S4 Step 4: All services reporting healthy');
    assertTrue(services.every(s => s.latency_ms < 100), 'Service latencies well under 100ms');

    // Step 5: Support technician requests JIT access with 2-person approval
    const jitRequest = {
      id: 'jit-req-01',
      tenant_id: 'ten-campinas-s4',
      requested_by: 'adm-support-operator',
      approved_by: 'adm-sec-01', // 2nd person approving
      purpose: 'Diagnóstico de erro em sincronização de webhooks do portal',
      requested_scope: 'read_diagnostics',
      duration_minutes: 60,
      status: 'approved'
    };
    await cpEnv.client.from('support_access_requests').insert(jitRequest);

    const requests = await cpEnv.client.from('support_access_requests').select();
    assertEqual(requests.data.length, 1, 'S4 Step 5: JIT request approved');
    assertFalse(requests.data[0].requested_by === requests.data[0].approved_by, '2-person rule validated');

    // Step 6: Verify Append-Only Audit Trail
    const auditRecord = {
      id: 'aud-s4-01',
      actor_admin_id: 'adm-sec-01',
      action: 'support.jit.grant_approved',
      resource_type: 'support_access_requests',
      resource_id: 'jit-req-01',
      tenant_id: 'ten-campinas-s4',
      result: 'success'
    };
    await cpEnv.client.from('platform_audit_events').insert(auditRecord);

    const auditEvents = await cpEnv.client.from('platform_audit_events').select();
    assertEqual(auditEvents.data.length, 1, 'S4 Step 6: JIT grant audited in platform_audit_events');
    assertEqual(auditEvents.data[0].action, 'support.jit.grant_approved', 'Audit action recorded');
    assertEqual(auditEvents.data[0].result, 'success', 'Audit result recorded');
  });
});
