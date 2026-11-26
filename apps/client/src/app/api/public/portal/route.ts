import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PORTAL_ORG_ID = "11111111-1111-4111-8111-111111110001";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

/**
 * Portal Público de Transparência: expõe apenas dados públicos (proposições legislativas e agenda pública).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({
        organizationId: DEFAULT_PORTAL_ORG_ID,
        legislativeItems: [],
        agendaEvents: [],
      });
    }

    const orgId = req.nextUrl.searchParams.get("organizationId") || DEFAULT_PORTAL_ORG_ID;

    const [{ data: legislativeItems }, { data: agendaEvents }] = await Promise.all([
      supabase
        .from("legislative_items")
        .select("id, type, number, year, title, summary, status")
        .eq("organization_id", orgId)
        .order("year", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("agenda_events")
        .select("id, title, starts_at, location, event_type")
        .eq("organization_id", orgId)
        .eq("visibility", "public")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(6),
    ]);

    return NextResponse.json({
      organizationId: orgId,
      legislativeItems: legislativeItems ?? [],
      agendaEvents: agendaEvents ?? [],
    });
  } catch {
    return NextResponse.json({
      organizationId: DEFAULT_PORTAL_ORG_ID,
      legislativeItems: [],
      agendaEvents: [],
    });
  }
}
