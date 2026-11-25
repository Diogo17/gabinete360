"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
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

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "https";
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
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
