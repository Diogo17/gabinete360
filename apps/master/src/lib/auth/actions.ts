"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export interface MasterAuthResult {
  success: boolean;
  requiresMfa?: boolean;
  error?: string | null;
  message?: string;
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

  // Verificação de ambiente: credenciais de demonstração são expressamente proibidas em produção
  const isProduction = process.env.NODE_ENV === "production";
  const demoModeAllowed = !isProduction && process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const DEMO_MASTER_CREDENTIALS: Record<string, string> = {
    "admin@dmiastudio.com": "Master@2026",
    "suporte@dmiastudio.com": "Suporte@2026",
  };

  const isDemoAdmin = demoModeAllowed && DEMO_MASTER_CREDENTIALS[email.toLowerCase()] === password;

  if (!isDemoAdmin) {
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
    const totpFactor = factors?.totp?.find((f) => f.status === "verified") || factors?.totp?.[0];

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
      // Usuário autenticado sem fator TOTP cadastrado
      const isProduction = process.env.NODE_ENV === "production";
      if (isProduction) {
        return { success: false, error: "MFA obrigatório não configurado para este administrador em produção." };
      }
      // Em desenvolvimento/homologação com demo code
      if (sanitizedCode !== "123456") {
        return { success: false, error: "Código TOTP de teste inválido." };
      }
    }
  } else {
    // Se não há sessão Supabase ativa, só permite bypass se estiver explicitamente em DEMO não-produção
    const isProduction = process.env.NODE_ENV === "production";
    const demoModeAllowed = !isProduction && process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    if (!demoModeAllowed || sanitizedCode !== "123456") {
      return { success: false, error: "Sessão inválida ou código TOTP incorreto." };
    }
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
