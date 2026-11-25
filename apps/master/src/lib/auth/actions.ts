"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export interface MasterAuthResult {
  success: boolean;
  requiresMfa?: boolean;
  needsEnrollment?: boolean;
  error?: string | null;
  message?: string;
}

/**
 * Enroll a new TOTP MFA factor for the authenticated Master Admin.
 */
export async function enrollMasterMfa(): Promise<{
  success: boolean;
  qrCode?: string;
  secret?: string;
  factorId?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Sessão expirada. Faça login novamente." };
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Gabinete 360 Master",
  });

  if (error || !data) {
    return { success: false, error: error?.message || "Erro ao iniciar configuração MFA." };
  }

  return {
    success: true,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
  };
}

/**
 * Platform Master Admin login with email and password.
 */
export async function adminLogin(formData: FormData): Promise<MasterAuthResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Informe credenciais de administrador." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Acesso administrativo negado.",
    };
  }

  // All Master Admins require mandatory TOTP MFA step-up verification
  const cookieStore = await cookies();
  cookieStore.set("master_admin_auth", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600 * 8,
  });

  // Redirect to MFA step 2 challenge
  redirect("/mfa");
}

/**
 * Verify TOTP 6-digit MFA challenge code.
 */
export async function verifyMfa(code: string): Promise<MasterAuthResult> {
  const sanitizedCode = code.trim().replace(/\s+/g, "");

  if (!sanitizedCode || sanitizedCode.length !== 6 || !/^\d{6}$/.test(sanitizedCode)) {
    return { success: false, error: "Código TOTP inválido. Digite 6 dígitos numéricos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try verifying with Supabase MFA if factors exist
  if (user) {
    const { data: factors, error: listErr } = await supabase.auth.mfa.listFactors();
    if (listErr) {
      return { success: false, error: "Erro ao consultar fatores MFA do usuário." };
    }
    const totpFactor =
      factors?.totp?.find((f) => f.status === "verified") ||
      factors?.totp?.[0] ||
      factors?.all?.find((f) => f.factor_type === "totp");

    if (totpFactor) {
      const challenge = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challenge.error) {
        return { success: false, error: challenge.error.message || "Erro ao gerar desafio MFA." };
      }

      const verifyRes = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: sanitizedCode,
      });

      if (verifyRes.error) {
        return { success: false, error: "Código TOTP inválido ou expirado." };
      }
    } else {
      // Usuário autenticado sem fator TOTP cadastrado — precisa configurar QR Code
      return {
        success: false,
        needsEnrollment: true,
        error: "MFA ainda não configurado. Clique em 'Configurar Autenticador (QR Code)' abaixo para vincular seu aplicativo.",
      };
    }
  } else {
    // Sem sessão Supabase ativa — login necessário
    return { success: false, error: "Sessão expirada. Faça login novamente." };
  }

  // Set verified AAL2 cookie
  const cookieStore = await cookies();
  cookieStore.set("master_mfa_verified", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600 * 8,
  });

  redirect("/");
}

/**
 * Admin Sign Out.
 */
export async function adminSignOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("master_admin_auth");
  cookieStore.delete("master_mfa_verified");

  redirect("/login");
}

/**
 * Retrieve master admin session and verification state.
 */
export async function getMasterAdminSession() {
  const cookieStore = await cookies();
  const mfaVerified = cookieStore.get("master_mfa_verified")?.value === "true";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    mfaVerified,
  };
}
