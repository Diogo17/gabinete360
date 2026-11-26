import type {
  PreferredChannel,
  CitizenStatus,
  DemandStatus,
  AgendaEventType,
  AgendaStatus,
} from "@gabinete360/types";

export interface DemoCitizen {
  id: string;
  organization_id: string;
  name: string;
  display_name: string;
  cpf?: string | null;
  email?: string | null;
  phone: string;
  preferred_channel: PreferredChannel;
  neighborhood: string;
  city: string;
  state: string;
  address_line?: string | null;
  tags: string[];
  notes?: string | null;
  status: CitizenStatus;
  demands_count: number;
  created_at: string;
  updated_at: string;
}

export interface DemoDemandEvent {
  id: string;
  demand_id: string;
  event_type: "created" | "assigned" | "status_changed" | "forwarded" | "responded" | "closed";
  actor_name: string;
  note: string;
  created_at: string;
}

export interface DemoDemand {
  id: string;
  organization_id: string;
  workspace_id: string;
  protocol: string;
  citizen_id?: string | null;
  citizen_name: string;
  citizen_phone?: string;
  preferred_channel: PreferredChannel;
  title: string;
  description: string;
  category: "iluminacao" | "saude" | "educacao" | "zeladoria" | "seguranca" | "saneamento" | "transporte" | "outros";
  priority: "low" | "normal" | "medium" | "high" | "urgent";
  status: DemandStatus;
  classification: "public" | "internal" | "confidential";
  neighborhood: string;
  location_text: string;
  assigned_to: string;
  assigned_name: string;
  due_at: string;
  created_at: string;
  updated_at: string;
  events: DemoDemandEvent[];
}

export interface DemoAgendaEvent {
  id: string;
  organization_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  location: string;
  event_type: AgendaEventType;
  visibility: "public" | "internal" | "confidential" | "private";
  status: AgendaStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DemoTeamMember {
  id: string;
  organization_id: string;
  name: string;
  role: "owner" | "admin" | "advisor" | "assistant" | "attendant" | "intern";
  role_title: string;
  email: string;
  phone: string;
  avatar_initials: string;
  status: "active" | "invited" | "suspended" | "revoked";
  active_demands: number;
  active_tasks: number;
  joined_at: string;
}

export interface DemoTask {
  id: string;
  organization_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "review" | "completed" | "cancelled";
  priority: "low" | "normal" | "medium" | "high" | "urgent";
  assigned_to: string;
  assigned_name: string;
  due_at: string;
  demand_id?: string | null;
  demand_protocol?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemoTerritorialStat {
  neighborhood: string;
  count: number;
  percentage: number;
  highlightColor: string;
}
