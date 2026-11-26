"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import {
  parliamentaryProfileSchema,
  type ParliamentaryProfileFormData,
} from "../validation/schemas";

export interface UpdateProfileInput {
  displayName: string;
  roleTitle?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ProfileActionResult {
  success: boolean;
  error?: string | null;
  data?: any;
}

const ADMIN_ROLES = new Set(["parliamentarian", "chief_of_staff", "owner", "admin"]);

/**
 * Atualiza os dados de perfil (nome, cargo, telefone, foto) do usuário autenticado no Operational Plane.
 */
export async function updateClientUserProfile(input: UpdateProfileInput): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        display_name: input.displayName.trim(),
        avatar_path: input.avatarUrl || null,
        phone: input.phone || null,
        institutional_role: input.roleTitle || null,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/equipe");
    revalidatePath("/dashboard");
    revalidatePath("/configuracoes");
    revalidatePath("/portal");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro inesperado ao atualizar perfil." };
  }
}

/**
 * Salva o Perfil Parlamentar e configurações do Portal Público, sincronizando
 * `parliamentary_profiles`, `organizations` e `profiles` para reflexão imediata no `/portal`.
 */
export async function saveParliamentaryPortalProfile(
  rawInput: ParliamentaryProfileFormData
): Promise<ProfileActionResult> {
  try {
    const parsed = parliamentaryProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Dados do perfil parlamentar inválidos.",
      };
    }

    const input = parsed.data;
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const { data: membership, error: memErr } = await supabase
      .from("memberships")
      .select("id, role, status")
      .eq("organization_id", input.organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memErr || !membership) {
      return { success: false, error: "Acesso negado a esta organização." };
    }

    if (!ADMIN_ROLES.has(membership.role)) {
      return {
        success: false,
        error: "Apenas o parlamentar titular ou chefia de gabinete podem editar o perfil público.",
      };
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const nowIso = new Date().toISOString();
    const cleanHighlights = input.highlights.map((h) => h.trim()).filter(Boolean);

    const profilePayload = {
      organization_id: input.organizationId,
      default_workspace_id: workspace?.id || null,
      portal_slug: input.portalSlug,
      cabinet_name: input.cabinetName,
      jurisdiction: input.jurisdiction,
      institution_type: input.institutionType,
      parliamentary_role: input.parliamentaryRole,
      legislator_name: input.legislatorName,
      full_name: input.fullName || null,
      party: input.party || null,
      state: input.state.toUpperCase(),
      municipality: input.municipality,
      district: input.district || null,
      legislature_number: input.legislatureNumber || null,
      office_address: input.officeAddress || null,
      official_email: input.officialEmail || null,
      official_phone: input.officialPhone || null,
      official_site: input.officialSite || null,
      avatar_url: input.avatarUrl || null,
      bio_headline: input.bioHeadline || null,
      biography: input.biography || null,
      highlights: cleanHighlights,
      chamber_name: input.chamberName,
      chamber_address: input.chamberAddress || null,
      chamber_cep: input.chamberCep || null,
      portal_enabled: input.portalEnabled,
      portal_cta_label: input.portalCtaLabel || null,
      neighborhood_placeholder: input.neighborhoodPlaceholder || null,
      status: "active",
      updated_at: nowIso,
    };

    // Verifica se já existe registro para atualizar ou inserir
    const { data: existingProfile } = await supabase
      .from("parliamentary_profiles")
      .select("id")
      .eq("organization_id", input.organizationId)
      .maybeSingle();

    const { data: savedProfile, error: saveErr } = existingProfile?.id
      ? await supabase
          .from("parliamentary_profiles")
          .update(profilePayload)
          .eq("id", existingProfile.id)
          .select("*")
          .single()
      : await supabase
          .from("parliamentary_profiles")
          .insert(profilePayload)
          .select("*")
          .single();

    if (saveErr) {
      return { success: false, error: saveErr.message };
    }

    // Sincroniza campos públicos/identitários em organizations (melhor esforço sem bloquear caso policy restrita)
    await supabase
      .from("organizations")
      .update({
        name: `${input.cabinetName} - ${input.municipality}/${input.state.toUpperCase()}`,
        parliamentarian_name: input.legislatorName,
        municipality: input.municipality,
        state: input.state.toUpperCase(),
        avatar_url: input.avatarUrl || null,
        description: input.bioHeadline || input.biography?.slice(0, 220) || null,
        agenda_sync_url: input.agendaSyncUrl || null,
      })
      .eq("id", input.organizationId);

    // Sincroniza perfil pessoal quando o usuário logado é o titular
    if (membership.role === "parliamentarian" || membership.role === "owner") {
      const displayName = input.fullName
        ? `${input.fullName} (${input.legislatorName})`
        : input.legislatorName;
      await supabase.from("profiles").upsert({
        user_id: user.id,
        display_name: displayName,
        avatar_path: input.avatarUrl || null,
        phone: input.officialPhone || null,
        institutional_role: input.legislatureNumber
          ? `${input.parliamentaryRole === "vereador" ? "Vereador" : "Parlamentar"} (${input.legislatureNumber})`
          : "Parlamentar",
        updated_at: nowIso,
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/configuracoes");
    revalidatePath("/portal");
    revalidatePath(`/portal/${input.portalSlug}`);
    revalidatePath("/portal/legislativo");
    revalidatePath(`/portal/${input.portalSlug}/legislativo`);

    return { success: true, data: savedProfile };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Erro inesperado ao salvar perfil parlamentar.",
    };
  }
}
