import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://efughosfkbirbjaqwyya.supabase.co";

  const supabaseKey =
    process.env.NEXT_PUBLIC_MASTER_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_ftto26963Xzb_0loxD0p2w_9PPeleUz";

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored when called from Server Component
        }
      },
    },
  });
}

/**
 * Server-only privileged client for Control Plane operations.
 * CRITICAL: NEVER expose this client to the browser or in client components.
 */
export async function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY_VIOLATION: createAdminClient cannot be called in client-side code."
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for Control Plane admin operations on the server."
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://efughosfkbirbjaqwyya.supabase.co";

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
