// Multi-Tenant Auth, Sessions, and Supabase RLS Simulation Probe
// Implements authoritative rules from TEST_MATRIX.md (CP-01 to CP-08, OP-01 to OP-10, INT-01 to INT-03)

export type ActorRole = 
  | 'anon' 
  | 'advisor' 
  | 'admin' 
  | 'owner' 
  | 'master_admin' 
  | 'whistleblower' 
  | 'jit_support';

export interface TenantSession {
  actor: ActorRole;
  organizationId?: string;
  userId?: string;
  membershipStatus?: 'active' | 'suspended' | 'revoked' | 'invited';
  mfaVerified?: boolean;
  jitExpiresAt?: number;
  permissions?: string[];
}

export interface MockRecord {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  [key: string]: any;
}

export class MockSupabaseClient {
  private tables: Map<string, MockRecord[]> = new Map();
  private session: TenantSession;

  constructor(session: TenantSession) {
    this.session = session;
  }

  setSession(session: TenantSession): void {
    this.session = session;
  }

  getSession(): TenantSession {
    return this.session;
  }

  seed(table: string, records: MockRecord[]): void {
    this.tables.set(table, [...records]);
  }

  getTable(table: string): MockRecord[] {
    return this.tables.get(table) || [];
  }

  from(table: string) {
    const records = this.tables.get(table) || [];
    const session = this.session;

    return {
      select: async (columns: string = '*', filter?: { where?: Record<string, any> }) => {
        // CP-01: Anon cannot query platform_tenants
        if (session.actor === 'anon' && table === 'platform_tenants') {
          throw new Error('RLS Violation: anon cannot read table platform_tenants (CP-01)');
        }

        // CP-02: Authenticated non-Master cannot query platform_audit_events
        if (session.actor !== 'master_admin' && session.actor !== 'jit_support' && table === 'platform_audit_events') {
          throw new Error('RLS Violation: authenticated cannot read table platform_audit_events (CP-02)');
        }

        // OP-08: Anon cannot read demands, reports, citizens, memberships, organizations
        if (session.actor === 'anon' && ['demands', 'reports', 'citizens', 'memberships', 'organizations'].includes(table)) {
          throw new Error(`RLS Violation: anon cannot read table ${table} (OP-08)`);
        }

        // OP-04: Suspended or revoked membership receives zero rows
        if (session.membershipStatus && session.membershipStatus !== 'active') {
          return { data: [], error: null, count: 0 };
        }

        // OP-05, OP-06, OP-07: Reports (Denúncias Segregadas)
        if (table === 'reports') {
          // Whistleblower intake mode or authorized grant check
          if (session.actor === 'whistleblower') {
            const filtered = records.filter(r => r.organization_id === session.organizationId);
            return { data: filtered, error: null, count: filtered.length };
          }

          // Check active grants in report_access_grants
          const grants = this.tables.get('report_access_grants') || [];
          const now = Date.now();
          const activeGrant = grants.find(g => 
            g.user_id === session.userId &&
            g.organization_id === session.organizationId &&
            (!g.expires_at || g.expires_at > now) &&
            !g.revoked_at
          );

          if (!activeGrant) {
            // OP-05 / OP-07: No active grant or expired grant -> 0 rows
            return { data: [], error: null, count: 0 };
          }

          // OP-06: Return only granted report
          const grantedReports = records.filter(r => r.id === activeGrant.report_id && r.organization_id === session.organizationId);
          return { data: grantedReports, error: null, count: grantedReports.length };
        }

        // CP-07: JIT support with expired grant receives 0 rows
        if (session.actor === 'jit_support' && session.jitExpiresAt && session.jitExpiresAt < Date.now()) {
          throw new Error('Access Denied: JIT support grant has expired (CP-07)');
        }

        // OP-01, OP-02: Organization isolation filter
        if (session.organizationId) {
          let filtered = records.filter(r => !r.organization_id || r.organization_id === session.organizationId);
          if (filter?.where) {
            for (const [key, val] of Object.entries(filter.where)) {
              filtered = filtered.filter(r => r[key] === val);
            }
          }
          return { data: filtered, error: null, count: filtered.length };
        }

        return { data: records, error: null, count: records.length };
      },

      insert: async (data: Record<string, any>) => {
        // OP-08: Anon cannot insert demands
        if (session.actor === 'anon' && table === 'demands') {
          throw new Error('RLS Violation: anon cannot insert demands directly (OP-08)');
        }

        // OP-08 / OP-09: Direct client insert on reports or report_access_grants is forbidden
        if (['anon', 'advisor', 'admin', 'owner'].includes(session.actor) && (table === 'reports' || table === 'report_access_grants')) {
          if (!data._serverActionContext) {
            throw new Error(`Grants Violation: direct insert into ${table} forbidden from client (OP-08/OP-09)`);
          }
        }

        // OP-03: Cross-tenant insert attempt fails RLS WITH CHECK
        if (session.organizationId && data.organization_id && data.organization_id !== session.organizationId) {
          throw new Error(`RLS Check Policy Violation: Cannot insert record with foreign organization_id ${data.organization_id} (OP-03)`);
        }

        // OP-10: Composite Foreign Key check: (organization_id, workspace_id)
        if (data.workspace_id && data.organization_id) {
          const workspaces = this.tables.get('workspaces') || [];
          const validWs = workspaces.find(w => w.id === data.workspace_id && w.organization_id === data.organization_id);
          if (!validWs) {
            throw new Error(`Composite FK Violation: workspace_id ${data.workspace_id} does not belong to organization_id ${data.organization_id} (OP-10)`);
          }
        }

        // Date validity constraint (starts_at < ends_at)
        if (data.starts_at && data.ends_at) {
          const start = new Date(data.starts_at).getTime();
          const end = new Date(data.ends_at).getTime();
          if (end <= start) {
            throw new Error('Check Constraint Violation: ends_at must be greater than starts_at');
          }
        }

        // CP-06 / INT-01: Provisioning job idempotency key check
        if (table === 'tenant_provisioning_jobs' && data.idempotency_key) {
          const existing = records.find(r => r.idempotency_key === data.idempotency_key);
          if (existing) {
            throw new Error(`Unique Constraint Violation: duplicate idempotency_key ${data.idempotency_key} (CP-06/INT-01)`);
          }
        }

        // JIT 2-Person Integrity: approved_by cannot equal requested_by
        if (table === 'support_access_requests' && data.requested_by && data.approved_by) {
          if (data.requested_by === data.approved_by) {
            throw new Error('Check Constraint Violation: support access cannot be self-approved (approved_by <> requested_by)');
          }
        }

        const newRecord = {
          id: data.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          organization_id: session.organizationId || data.organization_id,
          ...data
        };
        delete newRecord._serverActionContext;

        records.push(newRecord);
        this.tables.set(table, records);
        return { data: newRecord, error: null };
      },

      update: async (id: string, updates: Record<string, any>) => {
        const idx = records.findIndex(r => r.id === id);
        if (idx === -1) {
          return { data: null, error: new Error('Record not found') };
        }
        const current = records[idx];
        if (session.organizationId && current.organization_id && current.organization_id !== session.organizationId) {
          throw new Error('RLS Violation: Cannot update record belonging to another organization');
        }
        records[idx] = { ...current, ...updates };
        this.tables.set(table, records);
        return { data: records[idx], error: null };
      }
    };
  }
}

export function createMockEnvironment(session: TenantSession) {
  const client = new MockSupabaseClient(session);
  return {
    client,
    session,
    simulateRequest: (url: string, init?: RequestInit) => {
      const parsedUrl = new URL(url, 'http://localhost:3000');
      const isMasterHost = parsedUrl.hostname.includes('master') || parsedUrl.port === '3001';
      return {
        url: parsedUrl.toString(),
        isMaster: isMasterHost,
        status: 200,
        headers: new Headers(init?.headers)
      };
    }
  };
}
