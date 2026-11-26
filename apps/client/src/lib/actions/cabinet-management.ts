"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";

async function requireAuthenticatedUser(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

async function resolveDefaultWorkspaceId(supabase: any, organizationId: string) {
  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

/**
 * Atualiza foto (avatar_url), descrição e link de agenda do gabinete.
 */
export async function updateCabinetProfile(
  organizationId: string,
  data: { avatar_url?: string; description?: string; agenda_sync_url?: string }
) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("organizations")
    .update({
      avatar_url: data.avatar_url ?? null,
      description: data.description ?? null,
      agenda_sync_url: data.agenda_sync_url ?? null,
    })
    .eq("id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/portal");
  return { success: true };
}

export type DbLegislativeType =
  | "bill_project"
  | "motion"
  | "indication"
  | "requirement"
  | "amendment"
  | "decree"
  | "resolution";

/**
 * CRUD real de Proposituras Legislativas (esquema oficial `public.legislative_items`).
 */
export async function upsertLegislativeItem(
  organizationId: string,
  item: {
    id?: string;
    type: DbLegislativeType;
    number: string;
    year?: number;
    title: string;
    summary: string;
    status?: string;
    protocol_date?: string | null;
    official_source_url?: string | null;
    authorship?: string | null;
    is_public?: boolean;
    is_featured?: boolean;
  }
) {
  const supabase = await createClient();
  const user = await requireAuthenticatedUser(supabase);
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const workspaceId = await resolveDefaultWorkspaceId(supabase, organizationId);
  if (!workspaceId) {
    return { success: false, error: "Nenhum workspace ativo encontrado para a organização." };
  }

  const extractedYear =
    item.year ||
    (item.number.match(/\b(20\d{2})\b/)?.[1]
      ? Number(item.number.match(/\b(20\d{2})\b/)![1])
      : new Date().getFullYear());

  const payload = {
    organization_id: organizationId,
    workspace_id: workspaceId,
    type: item.type,
    number: item.number.trim(),
    year: extractedYear,
    title: item.title.trim(),
    summary: item.summary.trim() || item.title.trim(),
    status: item.status || "protocol_submitted",
    protocol_date: item.protocol_date || null,
    official_source_url: item.official_source_url || null,
    authorship: item.authorship || null,
    is_public: item.is_public ?? false,
    is_featured: item.is_featured ?? false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = item.id
    ? await supabase
        .from("legislative_items")
        .update(payload)
        .eq("id", item.id)
        .eq("organization_id", organizationId)
        .select("*")
        .single()
    : await supabase
        .from("legislative_items")
        .insert({ ...payload, created_by: user.id })
        .select("*")
        .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/legislativo");
  revalidatePath("/portal");
  revalidatePath("/portal/legislativo");
  return { success: true, data };
}

export async function toggleLegislativePortalVisibility(
  organizationId: string,
  itemId: string,
  isPublic: boolean,
  isFeatured?: boolean
) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const updatePayload: Record<string, unknown> = {
    is_public: isPublic,
    updated_at: new Date().toISOString(),
  };
  if (typeof isFeatured === "boolean") {
    updatePayload.is_featured = isFeatured;
  }

  const { data, error } = await supabase
    .from("legislative_items")
    .update(updatePayload)
    .eq("id", itemId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/legislativo");
  revalidatePath("/portal");
  revalidatePath("/portal/legislativo");
  return { success: true, data };
}

export async function deleteLegislativeItem(organizationId: string, itemId: string) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("legislative_items")
    .delete()
    .eq("id", itemId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/legislativo");
  revalidatePath("/portal");
  revalidatePath("/portal/legislativo");
  return { success: true };
}

/**
 * Atualiza papel/acesso ou remove membro da equipe no painel do cliente.
 */
export async function updateTeamMemberRole(
  organizationId: string,
  membershipId: string,
  role: "parliamentarian" | "chief_of_staff" | "staff" | "advisor" | "intern"
) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("id", membershipId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/equipe");
  return { success: true };
}

export async function removeTeamMember(organizationId: string, membershipId: string) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("memberships")
    .update({ status: "revoked" })
    .eq("id", membershipId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/equipe");
  return { success: true };
}

/**
 * CRUD de Agenda (`public.agenda_events`) com visibilidade pública/interna.
 */
export async function createAgendaEventAction(
  organizationId: string,
  event: {
    title: string;
    description?: string;
    event_type: "meeting" | "session" | "hearing" | "visit" | "event" | "other";
    visibility: "public" | "internal" | "confidential";
    starts_at: string;
    ends_at: string;
    location: string;
  }
) {
  const supabase = await createClient();
  const user = await requireAuthenticatedUser(supabase);
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const workspaceId = await resolveDefaultWorkspaceId(supabase, organizationId);
  if (!workspaceId) {
    return { success: false, error: "Nenhum workspace ativo encontrado para a organização." };
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .insert({
      organization_id: organizationId,
      workspace_id: workspaceId,
      title: event.title.trim(),
      description: event.description?.trim() || null,
      event_type: event.event_type,
      visibility: event.visibility,
      status: "scheduled",
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      location: event.location.trim(),
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/agenda");
  revalidatePath("/");
  revalidatePath("/portal");
  return { success: true, data };
}

export async function deleteAgendaEvent(organizationId: string, eventId: string) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("agenda_events")
    .delete()
    .eq("id", eventId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/agenda");
  revalidatePath("/portal");
  return { success: true };
}

/**
 * CRUD de Tarefas (tasks)
 */
export async function toggleTaskStatus(organizationId: string, taskId: string, status: string) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/tarefas");
  return { success: true };
}

export async function deleteTask(organizationId: string, taskId: string) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/tarefas");
  return { success: true };
}

/**
 * CRUD de Cidadãos (citizens)
 */
export async function deleteCitizen(organizationId: string, citizenId: string) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const { error } = await supabase
    .from("citizens")
    .delete()
    .eq("id", citizenId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/cidadaos");
  return { success: true };
}
