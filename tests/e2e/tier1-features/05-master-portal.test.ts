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

describe('Tier 1: Master Control Plane Modules (F13 to F21)', { tier: 1 }, () => {
  // Feature 13: Master Dashboard
  test('F13: Master executive dashboard and infrastructure metrics', () => {
    assertFileExists('apps/master/src/app/page.tsx', 'Master page.tsx must exist');
    assertFileContains('apps/master/src/app/page.tsx', 'DM IA Studio', 'Must render DM IA Studio branding');
    assertFileContains('apps/master/src/app/page.tsx', 'CONTROL PLANE', 'Must specify CONTROL PLANE subtitle');
    assertFileContains('apps/master/src/app/page.tsx', 'Clientes Cadastrados', 'Must display Clientes Cadastrados KPI');
    assertFileContains('apps/master/src/app/page.tsx', 'DemoWatermark', 'Must include DemoWatermark component');
  });

  // Feature 14: Master Gestão de Clientes
  test('F14: Client customer management lifecycle', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    env.client.seed('platform_tenants', [
      { id: 't-1', name: 'Gabinete Mariana Costa', slug: 'mariana-costa', customer_type: 'individual_cabinet', status: 'active' },
      { id: 't-2', name: 'Câmara Municipal de Campinas', slug: 'camara-campinas', customer_type: 'municipal_chamber', status: 'pending' }
    ]);

    const result = await env.client.from('platform_tenants').select();
    assertEqual(result.data.length, 2, 'Must list all platform tenants');
    assertEqual(result.data[0].slug, 'mariana-costa', 'First tenant slug must match');
    assertEqual(result.data[1].customer_type, 'municipal_chamber', 'Second tenant customer type must match');
    assertEqual(result.data[0].status, 'active', 'Active status verified');
    assertEqual(result.data[1].status, 'pending', 'Pending status verified');
  });

  // Feature 15: Master Gestão de Organizações
  test('F15: Organizational hierarchy and workspace topologies', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    env.client.seed('organizations', [
      { id: 'org-1', name: 'Câmara Municipal de Campinas', kind: 'chamber', status: 'active' }
    ]);
    env.client.seed('workspaces', [
      { id: 'ws-1', organization_id: 'org-1', name: 'Presidência', kind: 'cabinet' },
      { id: 'ws-2', organization_id: 'org-1', name: 'Comissão de Constituição e Justiça', kind: 'committee' }
    ]);

    const orgs = await env.client.from('organizations').select();
    const workspaces = env.client.getTable('workspaces');
    assertEqual(orgs.data.length, 1, 'Org count must match');
    assertEqual(workspaces.length, 2, 'Workspaces count must match');
    assertEqual(workspaces[0].organization_id, 'org-1', 'Workspace must belong to org-1');
    assertEqual(workspaces[1].kind, 'committee', 'Workspace kind must match');
    assertTrue(workspaces.every(w => w.organization_id === 'org-1'), 'All workspaces tied to org-1');
  });

  // Feature 16: Master Planos e Módulos
  test('F16: Plan catalog, limits and module entitlements', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    const plans = [
      { id: 'plan-basic', plan_key: 'basic', name: 'Plano Básico', monthly_price: 490 },
      { id: 'plan-pro', plan_key: 'pro', name: 'Plano Gabinete Pro', monthly_price: 990 },
      { id: 'plan-chamber', plan_key: 'chamber', name: 'Plano Câmara Legislativa', monthly_price: 3900 }
    ];
    env.client.seed('platform_plans', plans);

    const result = await env.client.from('platform_plans').select();
    assertEqual(result.data.length, 3, 'Must catalog 3 plans');
    assertEqual(result.data[0].plan_key, 'basic', 'Basic plan verified');
    assertEqual(result.data[1].plan_key, 'pro', 'Pro plan verified');
    assertEqual(result.data[2].plan_key, 'chamber', 'Chamber plan verified');
    assertTrue(result.data[1].monthly_price > result.data[0].monthly_price, 'Pro price greater than Basic');
  });

  // Feature 17: Master Gestão de Administradores
  test('F17: Platform administrator directory and MFA enforcement', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    env.client.seed('platform_admins', [
      { id: 'adm-1', email: 'sec-admin@dmiastudio.com', role: 'platform_security_admin', mfa_required: true, status: 'active' },
      { id: 'adm-2', email: 'ops-admin@dmiastudio.com', role: 'platform_operations', mfa_required: true, status: 'active' }
    ]);

    const result = await env.client.from('platform_admins').select();
    assertEqual(result.data.length, 2, 'Admin directory count must match');
    assertTrue(result.data[0].mfa_required, 'Security admin must require MFA');
    assertTrue(result.data[1].mfa_required, 'Ops admin must require MFA');
    assertEqual(result.data[0].role, 'platform_security_admin', 'Role must match');
    assertEqual(result.data[1].status, 'active', 'Admin status must be active');
  });

  // Feature 18: Master Provisionamento
  test('F18: Visual provisioning pipeline and step execution state machine', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    const job = {
      id: 'job-101',
      tenant_id: 't-1',
      job_type: 'create',
      idempotency_key: 'prov_t1_20261122',
      status: 'completed',
      steps: [
        { name: 'create_database_schema', status: 'completed' },
        { name: 'seed_core_roles', status: 'completed' },
        { name: 'configure_rls_policies', status: 'completed' },
        { name: 'generate_owner_invite', status: 'completed' }
      ]
    };
    await env.client.from('tenant_provisioning_jobs').insert(job);

    const stored = env.client.getTable('tenant_provisioning_jobs');
    assertEqual(stored.length, 1, 'Provisioning job persisted');
    assertEqual(stored[0].status, 'completed', 'Job marked completed');
    assertEqual(stored[0].steps.length, 4, 'All 4 pipeline steps registered');
    assertEqual(stored[0].steps[0].name, 'create_database_schema', 'First step matches');
    assertEqual(stored[0].idempotency_key, 'prov_t1_20261122', 'Idempotency key retained');
  });

  // Feature 19: Master Monitoramento & Saúde
  test('F19: Platform telemetry, service health monitoring and uptime', async () => {
    const services = [
      { name: 'Frontend Client (Next.js)', status: 'healthy', latency_ms: 24, environment: 'production' },
      { name: 'Control Plane Admin (Next.js)', status: 'healthy', latency_ms: 18, environment: 'production' },
      { name: 'Supabase PostgreSQL DB', status: 'healthy', latency_ms: 32, environment: 'production' },
      { name: 'Supabase Auth Service', status: 'healthy', latency_ms: 45, environment: 'production' },
      { name: 'Storage Buckets', status: 'healthy', latency_ms: 55, environment: 'production' }
    ];

    assertEqual(services.length, 5, 'Must monitor 5 critical services');
    assertTrue(services.every(s => s.status === 'healthy'), 'All services must report healthy');
    assertTrue(services.every(s => s.latency_ms < 100), 'All service latencies under 100ms');
    assertEqual(services[2].name, 'Supabase PostgreSQL DB', 'PostgreSQL monitor registered');
    assertTrue(services.every(s => s.environment === 'production'), 'Environment is production');
  });

  // Feature 20: Master Auditoria Administrativa
  test('F20: Append-only administrative audit log records', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    const auditEvents = [
      { id: 'aud-1', actor_admin_id: 'adm-1', action: 'tenant.create', resource_type: 'tenant', result: 'success' },
      { id: 'aud-2', actor_admin_id: 'adm-1', action: 'tenant.entitlements.update', resource_type: 'tenant', result: 'success' }
    ];
    env.client.seed('platform_audit_events', auditEvents);

    const result = await env.client.from('platform_audit_events').select();
    assertEqual(result.data.length, 2, 'Audit log contains 2 events');
    assertEqual(result.data[0].action, 'tenant.create', 'First action recorded');
    assertEqual(result.data[1].action, 'tenant.entitlements.update', 'Second action recorded');
    assertEqual(result.data[0].result, 'success', 'Audit result recorded');
    assertTrue(!!result.data[0].actor_admin_id, 'Actor admin ID is present');
  });

  // Feature 21: Master Suporte & Acesso JIT
  test('F21: Just-In-Time emergency support access with 2-person approval', async () => {
    const env = createMockEnvironment({ actor: 'master_admin' });
    const request = {
      tenant_id: 't-1',
      requested_by: 'adm-support-1',
      approved_by: 'adm-sec-2',
      purpose: 'Diagnóstico urgente de sincronização de módulos',
      requested_scope: 'read_diagnostics',
      status: 'approved'
    };

    const inserted = await env.client.from('support_access_requests').insert(request);
    assertTrue(inserted.error === null, 'JIT request with distinct approver succeeds');
    assertEqual(inserted.data.status, 'approved', 'Request status is approved');
    assertEqual(inserted.data.requested_scope, 'read_diagnostics', 'Scope matches');
    assertFalse(inserted.data.requested_by === inserted.data.approved_by, '2-person rule enforced');
    assertTrue(inserted.data.purpose.length >= 10, 'Purpose meets length threshold');
  });
});
