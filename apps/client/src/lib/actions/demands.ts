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

const DEFAULT_ORG_ID = "a0000000-0000-0000-0000-000000000001";
const DEFAULT_WORKSPACE_ID = "c0000000-0000-0000-0000-000000000001";

/**
 * Cria ou busca cidadão e registra uma nova demanda no Supabase.
 */
export async function createDemandAction(input: DemandInput): Promise<DemandActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Caso haja dados de cidadão, registra ou localiza na tabela citizens
    let citizenId: string | null = null;
    if (input.citizen_name && input.citizen_name.trim().length > 0) {
      const { data: citizen, error: citizenErr } = await supabase
        .from("citizens")
        .insert({
          organization_id: DEFAULT_ORG_ID,
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

    // 2. Insere a demanda na tabela pública demands
    const { data: demand, error: demandErr } = await supabase
      .from("demands")
      .insert({
        organization_id: DEFAULT_ORG_ID,
        workspace_id: DEFAULT_WORKSPACE_ID,
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

    // 3. Registra evento de criação na trilha de auditoria
    if (demand) {
      await supabase.from("demand_events").insert({
        organization_id: DEFAULT_ORG_ID,
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
 * Busca demandas registradas no Supabase vinculadas à organização.
 */
export async function getDemandsAction() {
  try {
    const supabase = await createClient();
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
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}
