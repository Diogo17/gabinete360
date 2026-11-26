"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "../supabase/server";

async function requireMasterAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const userClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Não autorizado. Faça login no Painel Master." };
  }

  const adminClient = await createAdminClient();
  const { data: adminRow } = await adminClient
    .from("platform_admins")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminRow) {
    return { ok: false, error: "Acesso negado. Usuário não é administrador ativo da plataforma." };
  }

  return { ok: true, userId: user.id };
}

export interface ConnectionConfigInput {
  organizationId?: string;
  name: string;
  slug: string;
  kind: "individual" | "chamber";
  municipality: string;
  state: string;
  parliamentarianName?: string;
  avatarUrl?: string;
  description?: string;
  agendaSyncUrl?: string;
}

export interface LegislativeLinkInput {
  organizationId: string;
  kind: "indicacao" | "projeto_lei" | "requerimento" | "mocao" | "emenda";
  number: string;
  title: string;
  description?: string;
  externalUrl?: string;
  authorName?: string;
}

const KIND_TO_DB_TYPE: Record<LegislativeLinkInput["kind"], string> = {
  indicacao: "indication",
  projeto_lei: "bill_project",
  requerimento: "requirement",
  mocao: "motion",
  emenda: "amendment",
};

/**
 * Cria ou atualiza uma conexão/organização a partir do Painel Master,
 * incluindo foto (avatar_url), descrição e URL de sincronização da agenda.
 */
export async function upsertConnectionConfig(input: ConnectionConfigInput) {
  try {
    const auth = await requireMasterAdmin();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const supabase = await createAdminClient();

    const payload = {
      name: input.name,
      slug: input.slug,
      kind: input.kind,
      municipality: input.municipality,
      state: input.state,
      parliamentarian_name: input.parliamentarianName || null,
      avatar_url: input.avatarUrl || null,
      description: input.description || null,
      agenda_sync_url: input.agendaSyncUrl || null,
      status: "active",
    };

    const query = input.organizationId
      ? supabase.from("organizations").update(payload).eq("id", input.organizationId).select().single()
      : supabase.from("organizations").insert(payload).select().single();

    const { data, error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/organizacoes");
    revalidatePath("/clientes");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao salvar configuração da conexão." };
  }
}

/**
 * Adiciona uma indicação, projeto ou projeto de lei com link externo a partir do Painel Master.
 */
export async function addLegislativeItemFromMaster(input: LegislativeLinkInput) {
  try {
    const auth = await requireMasterAdmin();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const supabase = await createAdminClient();
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!workspace?.id) {
      return { success: false, error: "Organização sem workspace ativo." };
    }

    const yearMatch = input.number.match(/\b(20\d{2})\b/)?.[1];

    const { data, error } = await supabase
      .from("legislative_items")
      .insert({
        organization_id: input.organizationId,
        workspace_id: workspace.id,
        type: KIND_TO_DB_TYPE[input.kind] || "bill_project",
        number: input.number,
        year: yearMatch ? Number(yearMatch) : new Date().getFullYear(),
        title: input.title,
        summary: input.description || input.title,
        official_source_url: input.externalUrl || null,
        authorship: input.authorName || null,
        status: "protocol_submitted",
        is_public: true,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/organizacoes");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao adicionar item legislativo." };
  }
}
