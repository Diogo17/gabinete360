import { createClient } from "./client";

const BUCKET_NAME = "cabinet-assets";

/**
 * Faz upload de foto de perfil, anexo de demanda ou documento legislativo
 * para o bucket `cabinet-assets` no Supabase Storage.
 */
export async function uploadCabinetAsset(
  file: File,
  organizationId: string,
  folder: "avatars" | "demands" | "legislative" = "avatars"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "bin";
    const filePath = `${organizationId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return { success: true, url: data.publicUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao enviar arquivo." };
  }
}
