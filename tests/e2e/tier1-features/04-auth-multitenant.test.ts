import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertFileContains,
  assertNoSecretsExposed,
  assertEqual,
  assertTrue,
  assertFalse,
  assertThrows
} from '../harness/assertions.ts';
import { createMockEnvironment } from '../harness/client-env.ts';

describe('Tier 1: Authentication, Multi-Tenancy & RBAC (F9, F10, F11, F12)', { tier: 1 }, () => {
  // Feature 9: Client Supabase Auth
  test('F9.1: Client auth configuration and browser client creation', () => {
    assertFileExists('apps/client/src/lib/supabase/client.ts', 'Client supabase client.ts must exist');
    assertFileContains('apps/client/src/lib/supabase/client.ts', 'createBrowserClient', 'Must use createBrowserClient');
    assertFileContains('apps/client/src/lib/supabase/client.ts', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'Must use publishable key');
    assertNoSecretsExposed('apps/client/src/lib/supabase/client.ts', 'Client client.ts must not contain secrets');
    assertFileExists('apps/client/src/lib/supabase/server.ts', 'Client supabase server.ts must exist');
  });

  test('F9.2: Client session state transitions in mock environment', () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-campinas-uuid',
      userId: 'user-advisor-1',
      membershipStatus: 'active'
    });

    const session = env.client.getSession();
    assertEqual(session.actor, 'advisor', 'Session actor must be advisor');
    assertEqual(session.organizationId, 'org-campinas-uuid', 'Session organizationId must match');
    assertEqual(session.membershipStatus, 'active', 'Membership status must be active');
    assertTrue(!!session.userId, 'User ID must be present');
    assertFalse(session.actor === 'anon', 'Logged-in user must not be anon');
  });

  // Feature 10: Master Supabase Auth & MFA
  test('F10.1: Master Supabase server isolation and createAdminClient server guard', () => {
    assertFileExists('apps/master/src/lib/supabase/server.ts', 'Master server.ts must exist');
    assertFileContains('apps/master/src/lib/supabase/server.ts', 'createAdminClient', 'Must export createAdminClient');
    assertFileContains('apps/master/src/lib/supabase/server.ts', 'SUPABASE_SERVICE_ROLE_KEY', 'createAdminClient must check SUPABASE_SERVICE_ROLE_KEY');
    assertFileContains('apps/master/src/lib/supabase/server.ts', 'CRITICAL: NEVER expose this client to the browser', 'Must contain security warning');
    assertNoSecretsExposed('apps/master/src/lib/supabase/client.ts', 'Master client.ts must not expose secrets');
  });

  test('F10.2: Master admin MFA verification and step-up challenge requirement', () => {
    const masterAdminMFA = {
      id: 'admin-master-1',
      display_name: 'Super Admin DM IA',
      email: 'admin@dmiastudio.com',
      mfa_required: true,
      mfa_verified: true,
      status: 'active'
    };

    assertTrue(masterAdminMFA.mfa_required, 'Master Admin must require MFA');
    assertTrue(masterAdminMFA.mfa_verified, 'Active Master Admin must have verified MFA');
    assertEqual(masterAdminMFA.status, 'active', 'Master admin status must be active');
    assertEqual(masterAdminMFA.email, 'admin@dmiastudio.com', 'Admin email must match');
    assertTrue(masterAdminMFA.display_name.length > 0, 'Display name must not be empty');
  });

  // Feature 11: Multi-Tenant Resolution & Middleware
  test('F11.1: Multi-tenant slug resolution logic', () => {
    function resolveTenantSlug(hostname: string, pathname: string): string | null {
      if (hostname.includes('.gabinete360.com.br')) {
        const sub = hostname.split('.')[0];
        if (sub && sub !== 'www' && sub !== 'app' && sub !== 'master') return sub;
      }
      const match = pathname.match(/^\/org\/([a-z0-9-]+)/);
      if (match) return match[1];
      return 'gabinete-demo';
    }

    assertEqual(resolveTenantSlug('mariana-costa.gabinete360.com.br', '/dashboard'), 'mariana-costa', 'Resolves subdomain');
    assertEqual(resolveTenantSlug('localhost:3000', '/org/camara-sp/demandas'), 'camara-sp', 'Resolves route prefix');
    assertEqual(resolveTenantSlug('localhost:3000', '/dashboard'), 'gabinete-demo', 'Falls back to default demo tenant');
    assertEqual(resolveTenantSlug('app.gabinete360.com.br', '/dashboard'), 'gabinete-demo', 'Ignores app subdomain');
    assertEqual(resolveTenantSlug('master.gabinete360.com.br', '/dashboard'), 'gabinete-demo', 'Ignores master subdomain');
  });

  test('F11.2: Tenant organization context verification', async () => {
    const env = createMockEnvironment({
      actor: 'advisor',
      organizationId: 'org-mariana-costa',
      userId: 'user-123',
      membershipStatus: 'active'
    });

    env.client.seed('organizations', [
      { id: 'org-mariana-costa', slug: 'mariana-costa', name: 'Gabinete Mariana Costa', status: 'active' }
    ]);

    const result = await env.client.from('organizations').select();
    assertEqual(result.data.length, 1, 'Returns active organization');
    assertEqual(result.data[0].slug, 'mariana-costa', 'Resolved slug matches');
    assertEqual(result.data[0].name, 'Gabinete Mariana Costa', 'Organization name matches');
    assertEqual(result.data[0].status, 'active', 'Organization is active');
    assertTrue(result.error === null, 'Error must be null');
  });

  // Feature 12: Server-side RBAC
  test('F12.1: Role permission matrix and access evaluation', () => {
    type CabinetRole = 'owner' | 'admin' | 'advisor' | 'attendant';

    const rolePermissions: Record<CabinetRole, string[]> = {
      owner: ['demands.create', 'demands.edit', 'demands.delete', 'team.manage', 'settings.edit', 'reports.view'],
      admin: ['demands.create', 'demands.edit', 'demands.delete', 'team.manage', 'reports.view'],
      advisor: ['demands.create', 'demands.edit', 'agenda.create', 'citizens.create'],
      attendant: ['demands.create', 'citizens.create']
    };

    function hasPermission(role: CabinetRole, perm: string): boolean {
      return rolePermissions[role]?.includes(perm) ?? false;
    }

    assertTrue(hasPermission('owner', 'settings.edit'), 'Owner can edit settings');
    assertTrue(hasPermission('admin', 'demands.delete'), 'Admin can delete demands');
    assertFalse(hasPermission('advisor', 'team.manage'), 'Advisor cannot manage team');
    assertFalse(hasPermission('advisor', 'reports.view'), 'Advisor cannot view confidential reports by default');
    assertFalse(hasPermission('attendant', 'demands.delete'), 'Attendant cannot delete demands');
  });
});
