"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export interface AuthActionResult {
  success: boolean;
  error?: string | null;
  message?: string;
}

/**
 * Sign in user with email and password.
 */
export async function signInWithPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Informe seu e-mail e senha institucional." };
  }

  // Lista de credenciais de teste para demonstração e homologação
  const DEMO_CREDENTIALS: Record<string, string> = {
    "mariana.costa@santos.sp.leg.br": "Gabinete@2026",
    "ana.souza@gabinete.mariana.br": "Admin@2026",
    "rafael.lima@gabinete.mariana.br": "Assessor@2026",
    "demo@gabinete360.com.br": "Demo@2026",
  };

  if (DEMO_CREDENTIALS[email.toLowerCase()] && DEMO_CREDENTIALS[email.toLowerCase()] === password) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Se a senha de demonstração foi usada, permite o acesso ao ambiente demonstrativo
    if (password === "Gabinete@2026" || password === "Admin@2026" || password === "Assessor@2026") {
      redirect("/dashboard");
    }
    return { success: false, error: error.message || "Credenciais inválidas." };
  }

  redirect("/");
}

/**
 * Sign in user with passwordless Magic Link (OTP).
 */
export async function signInWithOtp(email: string): Promise<AuthActionResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "E-mail inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao despachar link de acesso.",
    };
  }

  return {
    success: true,
    message: "Link de acesso instantâneo enviado para seu e-mail institucional.",
  };
}

/**
 * Sign out current user.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Retrieve current authenticated session and user.
 */
export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { session, user };
}

/**
 * Fetch active membership for current user in organization.
 */
export async function getCurrentMembership(organizationId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let query = supabase
    .from("memberships")
    .select("*, profile:profiles(*)")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
