import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export interface PublicPortalProfile {
  organizationId: string;
  defaultWorkspaceId: string | null;
  portalSlug: string;
  cabinetName: string;
  jurisdiction: "municipal" | "state" | "federal";
  institutionType: "city_council" | "state_assembly" | "house" | "senate";
  parliamentaryRole: "vereador" | "deputado_estadual" | "deputado_federal" | "senador";
  legislatorName: string;
  fullName: string | null;
  party: string | null;
  state: string;
  municipality: string;
  district: string | null;
  legislatureNumber: string | null;
  officeAddress: string | null;
  officialEmail: string | null;
  officialPhone: string | null;
  officialSite: string | null;
  avatarUrl: string | null;
  bioHeadline: string | null;
  biography: string | null;
  highlights: string[];
  chamberName: string;
  chamberAddress: string | null;
  chamberCep: string | null;
  agendaSyncUrl: string | null;
  portalEnabled: boolean;
  portalCtaLabel: string;
  neighborhoodPlaceholder: string;
}

export interface PublicLegislativeItem {
  id: string;
  type: string;
  number: string;
  year: number;
  title: string;
  summary: string | null;
  status: string;
  protocol_date: string | null;
  official_source_url: string | null;
  authorship: string | null;
  is_featured?: boolean;
}

export interface PublicAgendaEvent {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  location: string | null;
  event_type: string | null;
}

export interface PublicPortalPayload {
  found: boolean;
  source: "database" | "organization_fallback" | "unconfigured";
  profile: PublicPortalProfile | null;
  legislativeItems: PublicLegislativeItem[];
  agendaEvents: PublicAgendaEvent[];
}

function getSupabaseReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return { client: createSupabaseClient(url, serviceKey), isAdmin: true };
  }
  return null;
}

function formatRoleTitle(role?: string | null): string {
  switch (role) {
    case "deputado_estadual":
      return "Deputado Estadual";
    case "deputado_federal":
      return "Deputado Federal";
    case "senador":
      return "Senador";
    default:
      return "Vereador";
  }
}

function mapProfileRow(
  row: Record<string, any>,
  org?: Record<string, any> | null
): PublicPortalProfile {
  const roleLabel = formatRoleTitle(row.parliamentary_role);
  const legislatorName =
    row.legislator_name || org?.parliamentarian_name || org?.name || "Parlamentar";
  const municipality = row.municipality || org?.municipality || "";
  const state = row.state || org?.state || "";
  const chamberName =
    row.chamber_name ||
    (municipality ? `Câmara Municipal de ${municipality}` : "Câmara Municipal");

  return {
    organizationId: row.organization_id,
    defaultWorkspaceId: row.default_workspace_id || null,
    portalSlug: row.portal_slug || org?.slug || row.organization_id,
    cabinetName: row.cabinet_name || org?.name || `Gabinete ${roleLabel} ${legislatorName}`,
    jurisdiction: row.jurisdiction || "municipal",
    institutionType: row.institution_type || "city_council",
    parliamentaryRole: row.parliamentary_role || "vereador",
    legislatorName,
    fullName: row.full_name || null,
    party: row.party || null,
    state,
    municipality,
    district: row.district || null,
    legislatureNumber: row.legislature_number || null,
    officeAddress: row.office_address || null,
    officialEmail: row.official_email || null,
    officialPhone: row.official_phone || null,
    officialSite: row.official_site || null,
    avatarUrl: row.avatar_url || org?.avatar_url || null,
    bioHeadline: row.bio_headline || null,
    biography: row.biography || org?.description || null,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    chamberName,
    chamberAddress: row.chamber_address || null,
    chamberCep: row.chamber_cep || null,
    agendaSyncUrl: org?.agenda_sync_url || null,
    portalEnabled: row.portal_enabled ?? true,
    portalCtaLabel:
      row.portal_cta_label || `Enviar ao Gabinete do ${roleLabel} ${legislatorName}`,
    neighborhoodPlaceholder:
      row.neighborhood_placeholder ||
      (municipality ? `Ex.: Bairro / Comunidade · ${municipality}` : "Ex.: Bairro / Comunidade"),
  };
}

/**
 * Carrega dados públicos reais para o Portal de Transparência, resolvendo o tenant por
 * slug, header x-tenant-slug ou organizationId, com fallback seguro sem expor dados fictícios.
 */
export async function getPublicPortalData(options?: {
  slug?: string | null;
  organizationId?: string | null;
  legislativeLimit?: number;
  agendaLimit?: number;
}): Promise<PublicPortalPayload> {
  const { slug, organizationId, legislativeLimit = 6, agendaLimit = 6 } = options || {};

  try {
    const adminWrap = getSupabaseReadClient();
    const supabase = adminWrap ? adminWrap.client : await createServerSupabase();

    // 1. Tenta localizar registro oficial em parliamentary_profiles
    let profileRow: Record<string, any> | null = null;

    if (organizationId) {
      const { data } = await supabase
        .from("parliamentary_profiles")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .maybeSingle();
      profileRow = data;
    } else if (slug) {
      const { data } = await supabase
        .from("parliamentary_profiles")
        .select("*")
        .eq("portal_slug", slug.toLowerCase())
        .eq("status", "active")
        .maybeSingle();
      profileRow = data;
    } else {
      const { data } = await supabase
        .from("parliamentary_profiles")
        .select("*")
        .eq("portal_enabled", true)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      profileRow = data;
    }

    // 2. Caso parliamentary_profiles ainda não tenha sido populado (ex.: antes da Migration 008),
    // tenta buscar metadados mínimos da organização via admin client se disponível
    let orgRow: Record<string, any> | null = null;
    if (profileRow?.organization_id && adminWrap) {
      const { data } = await adminWrap.client
        .from("organizations")
        .select("id, name, slug, kind, status, avatar_url, description, agenda_sync_url")
        .eq("id", profileRow.organization_id)
        .maybeSingle();
      orgRow = data;
    } else if (!profileRow && adminWrap) {
      let orgQuery = adminWrap.client
        .from("organizations")
        .select("id, name, slug, kind, status, avatar_url, description, agenda_sync_url")
        .eq("status", "active")
        .eq("kind", "individual");
      if (organizationId) {
        orgQuery = orgQuery.eq("id", organizationId);
      } else if (slug) {
        orgQuery = orgQuery.eq("slug", slug.toLowerCase());
      } else {
        orgQuery = orgQuery.order("created_at", { ascending: true }).limit(1);
      }
      const { data } = await orgQuery.maybeSingle();
      orgRow = data;
    }

    if (profileRow && profileRow.portal_enabled === false) {
      return {
        found: false,
        source: "database",
        profile: null,
        legislativeItems: [],
        agendaEvents: [],
      };
    }

    const resolvedOrgId = profileRow?.organization_id || orgRow?.id || null;
    if (!resolvedOrgId) {
      return {
        found: false,
        source: "unconfigured",
        profile: null,
        legislativeItems: [],
        agendaEvents: [],
      };
    }

    const resolvedProfile: PublicPortalProfile = profileRow
      ? mapProfileRow(profileRow, orgRow)
      : {
          organizationId: orgRow!.id,
          defaultWorkspaceId: null,
          portalSlug: orgRow!.slug,
          cabinetName: orgRow!.name,
          jurisdiction: "municipal",
          institutionType: "city_council",
          parliamentaryRole: "vereador",
          legislatorName: orgRow!.name,
          fullName: null,
          party: null,
          state: "",
          municipality: "",
          district: null,
          legislatureNumber: null,
          officeAddress: null,
          officialEmail: null,
          officialPhone: null,
          officialSite: null,
          avatarUrl: orgRow!.avatar_url || null,
          bioHeadline: null,
          biography: orgRow!.description || null,
          highlights: [],
          chamberName: orgRow!.name,
          chamberAddress: null,
          chamberCep: null,
          agendaSyncUrl: orgRow!.agenda_sync_url || null,
          portalEnabled: true,
          portalCtaLabel: `Enviar ao ${orgRow!.name}`,
          neighborhoodPlaceholder: "Ex.: Bairro / Comunidade",
        };

    // 3. Consulta proposições legislativas públicas (compatível pré e pós-Migration 008)
    let legislativeItems: PublicLegislativeItem[] = [];
    const legQueryWithFlags = await supabase
      .from("legislative_items")
      .select(
        "id, type, number, year, title, summary, status, protocol_date, official_source_url, authorship, is_featured"
      )
      .eq("organization_id", resolvedOrgId)
      .eq("is_public", true)
      .not("status", "in", "(draft,archived,cancelled)")
      .order("is_featured", { ascending: false })
      .order("year", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(legislativeLimit);

    if (!legQueryWithFlags.error && legQueryWithFlags.data) {
      legislativeItems = legQueryWithFlags.data as PublicLegislativeItem[];
    } else if (legQueryWithFlags.error?.code === "42703") {
      // Coluna is_public ainda não existe no banco (pré-Migration 008): lê apenas não-rascunhos
      const fallbackLeg = await supabase
        .from("legislative_items")
        .select(
          "id, type, number, year, title, summary, status, protocol_date, official_source_url, authorship"
        )
        .eq("organization_id", resolvedOrgId)
        .not("status", "in", "(draft,archived,cancelled)")
        .order("year", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(legislativeLimit);
      legislativeItems = (fallbackLeg.data as PublicLegislativeItem[]) ?? [];
    }

    // 4. Consulta agenda pública parlamentar (apenas visibility = 'public')
    const { data: agendaData } = await supabase
      .from("agenda_events")
      .select("id, title, description, starts_at, ends_at, location, event_type")
      .eq("organization_id", resolvedOrgId)
      .eq("visibility", "public")
      .neq("status", "cancelled")
      .gte("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(agendaLimit);

    return {
      found: true,
      source: profileRow ? "database" : "organization_fallback",
      profile: resolvedProfile,
      legislativeItems,
      agendaEvents: (agendaData as PublicAgendaEvent[]) ?? [],
    };
  } catch {
    return {
      found: false,
      source: "unconfigured",
      profile: null,
      legislativeItems: [],
      agendaEvents: [],
    };
  }
}
