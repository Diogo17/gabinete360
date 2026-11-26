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
  return { success: true };
}

/**
 * CRUD de Indicações, Projetos e Projetos de Lei (com links) no painel do cliente.
 */
export async function upsertLegislativeItem(
  organizationId: string,
  item: {
    id?: string;
    kind: "indicacao" | "projeto_lei" | "requerimento" | "mocao" | "emenda";
    number: string;
    title: string;
    description?: string;
    status?: string;
    external_url?: string;
  }
) {
  const supabase = await createClient();
  if (!(await requireAuthenticatedUser(supabase))) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const payload = {
    organization_id: organizationId,
    kind: item.kind,
    number: item.number,
    title: item.title,
    description: item.description || null,
    status: item.status || "draft",
    external_url: item.external_url || null,
  };

  const { data, error } = item.id
    ? await supabase.from("legislative_items").update(payload).eq("id", item.id).eq("organization_id", organizationId).select().single()
    : await supabase.from("legislative_items").insert(payload).select().single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/legislativo");
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
  return { success: true };
}

/**
 * Atualiza papel/acesso ou remove membro da equipe no painel do cliente.
 */
export async function updateTeamMemberRole(
  organizationId: string,
  membershipId: string,
  role: "admin" | "advisor" | "assistant" | "attendant" | "intern"
) {
  const supabase = await createClient();
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
 * CRUD de Agenda (agenda_events)
 */
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
  return { success: true };
}

/**
 * CRUD de Tarefas (tasks)
 */
export async function toggleTaskStatus(organizationId: string, taskId: string, status: string) {
  const supabase = await createClient();
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
  const { error } = await supabase
    .from("citizens")
    .delete()
    .eq("id", citizenId)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/cidadaos");
  return { success: true };
}
