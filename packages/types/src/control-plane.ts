// ============================================================================
// @gabinete360/types - Control Plane (Master Admin Portal)
// ============================================================================

import { UUID, ISODateString, HealthStatus, SeverityLevel } from './common';

export type CustomerType = 'individual_cabinet' | 'municipal_chamber';
export type TenantStatus = 'pending' | 'active' | 'read_only' | 'suspended' | 'closing' | 'archived';
export type LifecycleState =
  | 'draft'
  | 'pending_provisioning'
  | 'provisioning'
  | 'provisioning_failed'
  | 'ready'
  | 'active'
  | 'closing'
  | 'archived';

export type AdminStatus = 'invited' | 'active' | 'suspended' | 'revoked';

export interface PlatformAdmin {
  id: UUID;
  auth_user_id: UUID;
  display_name: string;
  email: string;
  status: AdminStatus;
  mfa_required: boolean;
  mfa_enabled?: boolean;
  role?: string;
  created_at: ISODateString;
  last_login_at?: ISODateString | null;
}

export interface PlatformRole {
  id: UUID;
  code: string;
  name: string;
  description?: string | null;
  is_system: boolean;
}

export interface PlatformTenant {
  id: UUID;
  name: string;
  slug: string;
  customer_type: CustomerType;
  status: TenantStatus;
  lifecycle_state: LifecycleState;
  legal_name?: string | null;
  cnpj?: string | null;
  city?: string | null;
  state?: string | null;
  external_runtime_org_id?: UUID | null;
  runtime_project_ref?: string | null;
  plan_key?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
  contacts?: PlatformTenantContact[];
}

export interface PlatformTenantContact {
  id: UUID;
  tenant_id: UUID;
  contact_type: 'primary' | 'billing' | 'technical' | 'legal';
  name: string;
  email: string;
  phone?: string | null;
  created_at: ISODateString;
}

export interface PlatformPlan {
  id: UUID;
  plan_key: string;
  name: string;
  description?: string | null;
  status: 'active' | 'retired';
  billing_period: 'monthly' | 'annual' | 'custom';
  price_cents: number;
  limits: {
    max_members: number;
    max_citizens?: number;
    max_demands_month?: number;
    storage_gb?: number;
  };
  created_at?: ISODateString;
}

export interface PlatformModule {
  id: UUID;
  module_key: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive' | 'retired';
  release_channel: 'stable' | 'beta' | 'internal';
  is_core: boolean;
  is_billable: boolean;
}

export interface TenantSubscription {
  id: UUID;
  tenant_id: UUID;
  plan_id: UUID;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  started_at: ISODateString;
  expires_at?: ISODateString | null;
  created_at: ISODateString;
}

export interface TenantModuleEntitlement {
  id: UUID;
  tenant_id: UUID;
  module_id: UUID;
  is_enabled: boolean;
  custom_limits?: Record<string, unknown>;
  enabled_at: ISODateString;
}

export interface PlatformProvisioningJob {
  id: UUID;
  tenant_id: UUID;
  job_type: 'initial_setup' | 'upgrade' | 'deprovision';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  current_step?: string;
  attempts: number;
  max_attempts: number;
  idempotency_key: string;
  error_message?: string | null;
  started_at?: ISODateString | null;
  completed_at?: ISODateString | null;
  created_at: ISODateString;
  steps?: PlatformProvisioningStep[];
}

export interface PlatformProvisioningStep {
  id: UUID;
  job_id: UUID;
  step_number: number;
  step_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  error_details?: string | null;
  started_at?: ISODateString | null;
  completed_at?: ISODateString | null;
}

export interface PlatformAuditEvent {
  id: UUID;
  actor_admin_id?: UUID | null;
  actor_name?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  tenant_id?: UUID | null;
  tenant_name?: string | null;
  request_id?: string | null;
  occurred_at: ISODateString;
  result: 'success' | 'denied' | 'failure';
  reason?: string | null;
  metadata_minimized: Record<string, unknown>;
}

export interface PlatformService {
  id: UUID;
  service_key: string;
  name: string;
  criticality: SeverityLevel;
  current_status: HealthStatus;
  last_checked_at: ISODateString;
}

export interface ServiceHealthSnapshot {
  id: UUID;
  service_id: UUID;
  service_name?: string;
  status: HealthStatus;
  latency_ms: number;
  checked_at: ISODateString;
  error_message?: string | null;
}

export interface PlatformIncident {
  id: UUID;
  service_id?: UUID | null;
  title: string;
  severity: SeverityLevel;
  status: 'open' | 'investigating' | 'mitigating' | 'resolved' | 'closed';
  summary: string;
  opened_at: ISODateString;
  resolved_at?: ISODateString | null;
}

export interface SupportAccessRequest {
  id: UUID;
  tenant_id: UUID;
  tenant_name?: string;
  requested_by: UUID;
  requester_name?: string;
  purpose: string;
  requested_scope: string;
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'revoked' | 'used';
  requested_at: ISODateString;
  expires_at: ISODateString;
  approved_by?: UUID | null;
  approved_at?: ISODateString | null;
}
