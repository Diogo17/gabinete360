"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "../supabase/server";

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

/**
 * Cria ou atualiza uma conexão/organização a partir do Painel Master,
 * incluindo foto (avatar_url), descrição e URL de sincronização da agenda.
 */
export async function upsertConnectionConfig(input: ConnectionConfigInput) {
  try {
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
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("legislative_items")
      .insert({
        organization_id: input.organizationId,
        kind: input.kind,
        number: input.number,
        title: input.title,
        description: input.description || null,
        external_url: input.externalUrl || null,
        author_name: input.authorName || null,
        status: "filed",
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
