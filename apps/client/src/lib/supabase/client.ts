import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://efughosfkbirbjaqwyya.supabase.co";

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_ftto26963Xzb_0loxD0p2w_9PPeleUz";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
