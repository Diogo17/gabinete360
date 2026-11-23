"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";

export interface UpdateMasterProfileInput {
  displayName: string;
  avatarUrl?: string;
}

export interface MasterProfileActionResult {
  success: boolean;
  error?: string | null;
  data?: any;
}

/**
 * Atualiza o nome de exibição e foto do administrador no Control Plane.
 */
export async function updateMasterAdminProfile(input: UpdateMasterProfileInput): Promise<MasterProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Administrador não autenticado." };
    }

    const { data, error } = await supabase
      .from("platform_admins")
      .update({
        display_name: input.displayName.trim(),
      })
      .eq("auth_user_id", user.id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Atualiza metadados do auth.users
    await supabase.auth.updateUser({
      data: {
        display_name: input.displayName.trim(),
        avatar_url: input.avatarUrl || null,
      },
    });

    revalidatePath("/administradores");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro inesperado ao atualizar perfil administrativo." };
  }
}
