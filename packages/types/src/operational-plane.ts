// ============================================================================
// @gabinete360/types - Operational Plane (Cabinet Workspace Portal)
// ============================================================================

import { UUID, ISODateString } from './common';

export type UserRole = 'owner' | 'admin' | 'advisor' | 'assistant' | 'intern' | 'citizen';
export type MembershipStatus = 'invited' | 'active' | 'suspended' | 'revoked';

export interface UserProfile {
  user_id: UUID;
  display_name: string;
  avatar_path?: string | null;
  phone?: string | null;
  locale: string;
  role_title?: string;
}

export interface Organization {
  id: UUID;
  platform_tenant_id: UUID;
  name: string;
  slug: string;
  kind: 'individual' | 'chamber';
  status: 'active' | 'read_only' | 'suspended' | 'closing' | 'archived';
  parliamentarian_name?: string;
  municipality?: string;
  state?: string;
  created_at: ISODateString;
}

export interface Workspace {
  id: UUID;
  organization_id: UUID;
  name: string;
  kind: string;
  status: 'active' | 'inactive';
  created_at: ISODateString;
}

export interface Department {
  id: UUID;
  organization_id: UUID;
  workspace_id?: UUID | null;
  name: string;
  kind: string;
  status: 'active' | 'inactive';
  created_at: ISODateString;
}

export interface Membership {
  id: UUID;
  organization_id: UUID;
  user_id: UUID;
  role: UserRole;
  status: MembershipStatus;
  joined_at?: ISODateString | null;
  created_at: ISODateString;
  profile?: UserProfile;
}

// ----------------------------------------------------------------------------
// CRM CITIZEN
// ----------------------------------------------------------------------------
export type PreferredChannel = 'whatsapp' | 'email' | 'phone' | 'in_person';
export type CitizenStatus = 'active' | 'inactive' | 'blocked';

export interface Citizen {
  id: UUID;
  organization_id: UUID;
  name: string;
  cpf?: string | null;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  address_line?: string | null;
  preferred_channel: PreferredChannel;
  tags: string[];
  notes?: string | null;
  status: CitizenStatus;
  demands_count?: number;
  created_by?: UUID | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ----------------------------------------------------------------------------
// DEMANDS
// ----------------------------------------------------------------------------
export type DemandStatus =
  | 'received'
  | 'triage'
  | 'in_progress'
  | 'waiting'
  | 'resolved'
  | 'closed';

export type DemandPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DemandCategory {
  id: UUID;
  organization_id?: UUID | null;
  name: string;
  category_key: string;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  created_at?: ISODateString;
}

export interface Demand {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  citizen_id?: UUID | null;
  category_id?: UUID | null;
  protocol?: string | null;
  title: string;
  description?: string | null;
  status: DemandStatus;
  priority: DemandPriority;
  classification: 'public' | 'internal' | 'confidential';
  location_text?: string | null;
  created_by: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  // Relationships
  citizen?: Citizen | null;
  category?: DemandCategory | null;
  assignments?: DemandAssignment[];
  events?: DemandEvent[];
}

export interface DemandAssignment {
  id: UUID;
  organization_id: UUID;
  demand_id: UUID;
  membership_id: UUID;
  assigned_by: UUID;
  assigned_at: ISODateString;
  ended_at?: ISODateString | null;
  notes?: string | null;
  membership?: Membership;
}

export interface DemandEvent {
  id: UUID;
  organization_id: UUID;
  demand_id: UUID;
  event_type:
    | 'created'
    | 'status_changed'
    | 'assigned'
    | 'comment_added'
    | 'forwarded'
    | 'responded'
    | 'closed'
    | 'reopened';
  from_status?: string | null;
  to_status?: string | null;
  note?: string | null;
  metadata: Record<string, unknown>;
  actor_user_id: UUID;
  actor_name?: string;
  created_at: ISODateString;
}

export interface DemandAttachment {
  id: UUID;
  organization_id: UUID;
  demand_id: UUID;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  classification: 'public' | 'internal' | 'confidential';
  uploaded_by: UUID;
  created_at: ISODateString;
}

// ----------------------------------------------------------------------------
// AGENDA
// ----------------------------------------------------------------------------
export type AgendaEventType = 'meeting' | 'session' | 'hearing' | 'visit' | 'event' | 'other';
export type AgendaStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

export interface AgendaEvent {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  title: string;
  description?: string | null;
  starts_at: ISODateString;
  ends_at: ISODateString;
  location?: string | null;
  event_type: AgendaEventType;
  visibility: 'public' | 'internal' | 'confidential';
  status: AgendaStatus;
  created_by: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ----------------------------------------------------------------------------
// LEGISLATIVE ITEMS
// ----------------------------------------------------------------------------
export type LegislativeType =
  | 'bill_project'
  | 'motion'
  | 'indication'
  | 'requirement'
  | 'amendment'
  | 'decree'
  | 'resolution';

export type LegislativeStatus =
  | 'draft'
  | 'protocolled'
  | 'in_commission'
  | 'floor_vote'
  | 'approved'
  | 'rejected'
  | 'sanctioned'
  | 'vetoed'
  | 'promulgated';

export interface LegislativeItem {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  type: LegislativeType;
  number: string;
  year: number;
  title: string;
  summary: string;
  status: LegislativeStatus;
  protocol_date?: string | null;
  protocol_number?: string | null;
  official_source_url?: string | null;
  authorship?: string | null;
  content?: string | null;
  created_by: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ----------------------------------------------------------------------------
// INSPECTION CASES (Fiscalização)
// ----------------------------------------------------------------------------
export type InspectionStatus =
  | 'draft'
  | 'planned'
  | 'in_progress'
  | 'report_pending'
  | 'referred'
  | 'concluded'
  | 'archived';

export interface InspectionCase {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  case_number: string;
  title: string;
  scope: string;
  target_entity: string;
  location_text?: string | null;
  status: InspectionStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  findings?: string | null;
  action_taken?: string | null;
  opened_at: ISODateString;
  closed_at?: ISODateString | null;
  created_by: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ----------------------------------------------------------------------------
// POPULAR PARTICIPATION
// ----------------------------------------------------------------------------
export type ParticipationCategory =
  | 'health'
  | 'education'
  | 'infrastructure'
  | 'security'
  | 'transport'
  | 'culture'
  | 'environment'
  | 'social'
  | 'other';

export type ParticipationStatus =
  | 'submitted'
  | 'in_analysis'
  | 'accepted'
  | 'converted_to_proposal'
  | 'rejected'
  | 'archived';

export interface PopularParticipation {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  citizen_id?: UUID | null;
  title: string;
  description: string;
  category: ParticipationCategory;
  status: ParticipationStatus;
  converted_legislative_id?: UUID | null;
  votes_count: number;
  submitted_at: ISODateString;
  created_at: ISODateString;
  citizen?: Citizen | null;
}

// ----------------------------------------------------------------------------
// REPORTS (Denúncias - Domínio Isolado)
// ----------------------------------------------------------------------------
export type ReportIntakeMode = 'identified' | 'anonymous';
export type ReportStatus = 'received' | 'triage' | 'under_review' | 'referred' | 'closed';

export interface Report {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  protocol_code: string;
  intake_mode: ReportIntakeMode;
  status: ReportStatus;
  restricted_payload: Record<string, unknown>;
  created_at: ISODateString;
}

export interface ReportAccessGrant {
  id: UUID;
  organization_id: UUID;
  report_id: UUID;
  user_id: UUID;
  purpose: string;
  granted_by: UUID;
  granted_at: ISODateString;
  expires_at?: ISODateString | null;
  revoked_at?: ISODateString | null;
}

// ----------------------------------------------------------------------------
// TASKS
// ----------------------------------------------------------------------------
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: UUID;
  organization_id: UUID;
  workspace_id: UUID;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at?: ISODateString | null;
  demand_id?: UUID | null;
  created_by: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  assignments?: Membership[];
}
