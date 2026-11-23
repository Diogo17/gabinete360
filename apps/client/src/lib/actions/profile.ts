"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";

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

/**
 * Atualiza os dados de perfil (nome, cargo, telefone, foto) do usuário autenticado no Operational Plane.
 */
export async function updateClientUserProfile(input: UpdateProfileInput): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

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
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro inesperado ao atualizar perfil." };
  }
}
