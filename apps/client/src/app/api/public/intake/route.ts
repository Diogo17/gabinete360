import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";

const PublicIntakeSchema = z.object({
  organization_id: z.string().uuid("organization_id inválido."),
  citizen_name: z.string().trim().min(2, "Nome é obrigatório.").max(120),
  citizen_phone: z.string().trim().max(30).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  title: z.string().trim().min(3, "Assunto é obrigatório.").max(200),
  description: z.string().trim().min(5, "Descrição é obrigatória.").max(4000),
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (ipHits.get(ip) || []).filter((ts) => ts > windowStart);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Muitas solicitações enviadas em sequência. Aguarde alguns minutos." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = PublicIntakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { organization_id, citizen_name, citizen_phone, neighborhood, title, description } =
      parsed.data;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isAdmin = Boolean(url && serviceKey);
    const supabase = isAdmin
      ? createAdminClient(url!, serviceKey!)
      : await createClient();

    // 1. Confirma que o portal público da organização está ativo e obtém workspace padrão
    const { data: portalProfile } = await supabase
      .from("parliamentary_profiles")
      .select("organization_id, default_workspace_id, portal_enabled, status")
      .eq("organization_id", organization_id)
      .eq("portal_enabled", true)
      .eq("status", "active")
      .maybeSingle();

    let workspaceId = portalProfile?.default_workspace_id || null;

    if (!workspaceId && isAdmin) {
      const { data: org } = await supabase
        .from("organizations")
        .select("id, status")
        .eq("id", organization_id)
        .eq("status", "active")
        .maybeSingle();

      if (!org) {
        return NextResponse.json(
          { error: "Organização não encontrada ou inativa." },
          { status: 404 }
        );
      }

      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("organization_id", organization_id)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      workspaceId = workspace?.id || null;
    }

    if (!portalProfile && !isAdmin) {
      return NextResponse.json(
        { error: "Portal público não habilitado para este gabinete." },
        { status: 403 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace operacional do gabinete não localizado." },
        { status: 400 }
      );
    }

    const protocol = `#AT-${randomInt(100000, 999999)}`;
    const locationText = neighborhood || "Não informado";

    // 2. Quando houver service_role, também registra/vincula o cidadão e cria evento na trilha
    let citizenId: string | null = null;
    if (isAdmin) {
      const { data: citizen } = await supabase
        .from("citizens")
        .insert({
          organization_id,
          name: citizen_name,
          phone: citizen_phone || null,
          neighborhood: neighborhood || null,
          preferred_channel: citizen_phone ? "whatsapp" : "in_person",
        })
        .select("id")
        .maybeSingle();
      citizenId = citizen?.id || null;
    }

    const insertPayload = {
      organization_id,
      workspace_id: workspaceId,
      created_by: null,
      ...(citizenId ? { citizen_id: citizenId } : {}),
      title,
      description,
      location_text: locationText,
      priority: "medium",
      status: "received",
      classification: "public",
      protocol,
      requester_name: citizen_name,
      requester_phone: citizen_phone || null,
      source_channel: "portal",
    };

    const { error } = await supabase.from("demands").insert(insertPayload);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Não foi possível registrar a solicitação." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      protocol,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao registrar solicitação pública." },
      { status: 500 }
    );
  }
}
