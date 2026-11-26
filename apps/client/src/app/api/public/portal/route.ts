import { NextRequest, NextResponse } from "next/server";
import { getPublicPortalData } from "@/lib/portal/public-portal";

/**
 * Portal Público de Transparência: expõe exclusivamente dados públicos
 * do perfil parlamentar, proposições marcadas como públicas e agenda pública.
 */
export async function GET(req: NextRequest) {
  const slug =
    req.nextUrl.searchParams.get("slug") || req.headers.get("x-tenant-slug") || undefined;
  const organizationId = req.nextUrl.searchParams.get("organizationId") || undefined;

  const data = await getPublicPortalData({
    slug,
    organizationId,
    legislativeLimit: 12,
    agendaLimit: 6,
  });

  return NextResponse.json({
    found: data.found,
    source: data.source,
    organizationId: data.profile?.organizationId || null,
    profile: data.profile,
    legislativeItems: data.legislativeItems,
    agendaEvents: data.agendaEvents,
  });
}
