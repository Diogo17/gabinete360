import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 3: Master Tenant Provisioning Flow (Tenant -> Org -> Entitlements -> Pipeline -> Audit)', { tier: 3 }, () => {
  test('T3.2: Complete multi-plane provisioning pipeline with entitlements and audit trail', async () => {
    const cpEnv = createMockEnvironment({ actor: 'master_admin', userId: 'master-adm-1' });

    // Step 1: Create Tenant in Control Plane
    const tenant = {
      id: 'ten-campinas-01',
      name: 'Câmara Municipal de Campinas',
      slug: 'camara-campinas',
      customer_type: 'municipal_chamber',
      status: 'pending_provisioning'
    };
    await cpEnv.client.from('platform_tenants').insert(tenant);

    const tenants = await cpEnv.client.from('platform_tenants').select();
    assertEqual(tenants.data.length, 1, 'Step 1: Tenant registered in CP');
    assertEqual(tenants.data[0].slug, 'camara-campinas', 'Tenant slug recorded');

    // Step 2: Allocate Plan & Module Entitlements
    const entitlements = [
      { id: 'ent-1', tenant_id: 'ten-campinas-01', module_key: 'crm', status: 'enabled', version: 1 },
      { id: 'ent-2', tenant_id: 'ten-campinas-01', module_key: 'legislativo', status: 'enabled', version: 1 },
      { id: 'ent-3', tenant_id: 'ten-campinas-01', module_key: 'fiscalizacao', status: 'enabled', version: 1 },
      { id: 'ent-4', tenant_id: 'ten-campinas-01', module_key: 'participacao', status: 'enabled', version: 1 }
    ];
    for (const ent of entitlements) {
      await cpEnv.client.from('tenant_module_entitlements').insert(ent);
    }

    const savedEnt = await cpEnv.client.from('tenant_module_entitlements').select();
    assertEqual(savedEnt.data.length, 4, 'Step 2: 4 module entitlements granted');
    assertTrue(savedEnt.data.some(e => e.module_key === 'legislativo'), 'Legislativo enabled');

    // Step 3: Trigger Provisioning State Machine Job
    const job = {
      id: 'prov-job-88',
      tenant_id: 'ten-campinas-01',
      idempotency_key: 'idemp_campinas_20261122',
      status: 'running',
      current_step: 'create_org_runtime'
    };
    await cpEnv.client.from('tenant_provisioning_jobs').insert(job);

    // Step 4: Provision Operational Organization
    const org = {
      id: 'org-campinas-runtime',
      platform_tenant_id: 'ten-campinas-01',
      slug: 'camara-campinas',
      name: 'Câmara Municipal de Campinas',
      kind: 'chamber',
      status: 'active'
    };
    await cpEnv.client.from('organizations').insert(org);

    // Step 5: Mark Job Completed & Tenant Active
    await cpEnv.client.from('tenant_provisioning_jobs').update('prov-job-88', {
      status: 'completed',
      current_step: 'ready'
    });
    await cpEnv.client.from('platform_tenants').update('ten-campinas-01', {
      status: 'active'
    });

    const updatedTenant = await cpEnv.client.from('platform_tenants').select();
    assertEqual(updatedTenant.data[0].status, 'active', 'Step 5: Tenant status is active');

    // Step 6: Append-Only Administrative Audit Event
    const auditEvent = {
      id: 'aud-prov-88',
      actor_admin_id: 'master-adm-1',
      action: 'tenant.provision.complete',
      resource_type: 'platform_tenants',
      resource_id: 'ten-campinas-01',
      tenant_id: 'ten-campinas-01',
      result: 'success'
    };
    await cpEnv.client.from('platform_audit_events').insert(auditEvent);

    const auditTrail = await cpEnv.client.from('platform_audit_events').select();
    assertEqual(auditTrail.data.length, 1, 'Step 6: Provisioning action audited');
    assertEqual(auditTrail.data[0].action, 'tenant.provision.complete', 'Audit action matches');
    assertEqual(auditTrail.data[0].result, 'success', 'Audit result recorded as success');
    assertEqual(auditTrail.data[0].actor_admin_id, 'master-adm-1', 'Audit actor admin matches');
  });
});
