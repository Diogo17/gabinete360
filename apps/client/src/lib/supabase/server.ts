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
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://efughosfkbirbjaqwyya.supabase.co";

  const supabaseKey =
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
