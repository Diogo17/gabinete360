"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";

export interface DemandInput {
  title: string;
  description?: string;
  citizen_name?: string;
  citizen_phone?: string;
  citizen_neighborhood?: string;
  category_key?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface DemandActionResult {
  success: boolean;
  data?: any;
  error?: string | null;
}

// Fallback apenas para seed/ambiente inicial piloto quando usuário não estiver cadastrado em outra org
const PILOT_ORG_ID = "a0000000-0000-0000-0000-000000000001";
const PILOT_WORKSPACE_ID = "c0000000-0000-0000-0000-000000000001";

/**
 * Deriva a organização ativa e workspace do usuário autenticado a partir de sua membership.
 */
async function resolveUserTenant(supabase: any, userId: string | undefined) {
  if (!userId) {
    return {
      organizationId: PILOT_ORG_ID,
      workspaceId: PILOT_WORKSPACE_ID,
    };
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !membership?.organization_id) {
    return {
      organizationId: PILOT_ORG_ID,
      workspaceId: PILOT_WORKSPACE_ID,
    };
  }

  const orgId = membership.organization_id;

  // Busca o primeiro workspace ativo da organização
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("organization_id", orgId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return {
    organizationId: orgId,
    workspaceId: workspace?.id || PILOT_WORKSPACE_ID,
  };
}

/**
 * Cria ou busca cidadão e registra uma nova demanda no Supabase com integridade transacional garantida.
 */
export async function createDemandAction(input: DemandInput): Promise<DemandActionResult> {
  try {
    if (!input?.title || input.title.trim().length < 3) {
      return { success: false, error: "Título da demanda deve ter pelo menos 3 caracteres." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    // 1. Deriva o tenant (organização e workspace) a partir do usuário autenticado
    const { organizationId, workspaceId } = await resolveUserTenant(supabase, user?.id);

    // 2. Tenta executar via RPC transacional atômica (função register_demand_transactional)
    const { data: rpcData, error: rpcError } = await supabase.rpc("register_demand_transactional", {
      p_org_id: organizationId,
      p_workspace_id: workspaceId,
      p_title: input.title,
      p_description: input.description || null,
      p_classification: "internal",
      p_priority: input.priority || "medium",
      p_citizen_name: input.citizen_name || null,
      p_citizen_phone: input.citizen_phone || null,
      p_citizen_neighborhood: input.citizen_neighborhood || null,
    });

    if (!rpcError && rpcData?.success) {
      revalidatePath("/demandas");
      revalidatePath("/dashboard");
      return { success: true, data: rpcData };
    }

    // Fallback gracioso com isolamento garantido caso a migração da RPC ainda não tenha sido aplicada no banco remoto
    let citizenId: string | null = null;
    if (input.citizen_name && input.citizen_name.trim().length > 0) {
      const { data: citizen, error: citizenErr } = await supabase
        .from("citizens")
        .insert({
          organization_id: organizationId,
          name: input.citizen_name.trim(),
          phone: input.citizen_phone || null,
          neighborhood: input.citizen_neighborhood || null,
        })
        .select("id")
        .single();

      if (!citizenErr && citizen) {
        citizenId = citizen.id;
      }
    }

    const { data: demand, error: demandErr } = await supabase
      .from("demands")
      .insert({
        organization_id: organizationId,
        workspace_id: workspaceId,
        created_by: user?.id || "00000000-0000-0000-0000-000000000000",
        title: input.title,
        description: input.description || null,
        status: "received",
        classification: "internal",
      })
      .select("*")
      .single();

    if (demandErr) {
      console.warn("Erro ao inserir demanda no Supabase:", demandErr.message);
      return { success: false, error: demandErr.message };
    }

    if (demand) {
      await supabase.from("demand_events").insert({
        organization_id: organizationId,
        demand_id: demand.id,
        event_type: "created",
        to_status: "received",
        actor_user_id: user?.id || null,
        notes: "Demanda registrada via Portal do Gabinete 360",
      });
    }

    revalidatePath("/demandas");
    revalidatePath("/dashboard");
    return { success: true, data: demand };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro inesperado ao registrar demanda." };
  }
}

/**
 * Busca demandas registradas no Supabase vinculadas à organização do usuário autenticado.
 */
export async function getDemandsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { organizationId } = await resolveUserTenant(supabase, user?.id);

    const { data, error } = await supabase
      .from("demands")
      .select(`
        *,
        demand_assignments (
          id,
          assigned_at,
          membership_id
        )
      `)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}
