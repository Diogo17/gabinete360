import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const UuidSchema = z.string().uuid("ID de cidadão inválido.");

/**
 * Perfil unificado CRM 360° do cidadão, isolado por organization_id do usuário autenticado.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const parsedId = UuidSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "ID de cidadão inválido." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const orgId = membership.organization_id;

    const { data: citizen, error: citizenError } = await supabase
      .from("citizens")
      .select("id, name, phone, email, neighborhood, created_at")
      .eq("id", parsedId.data)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (citizenError || !citizen) {
      return NextResponse.json({ error: "Cidadão não encontrado." }, { status: 404 });
    }

    const { data: demands } = await supabase
      .from("demands")
      .select("id, protocol, title, status, priority, created_at")
      .eq("organization_id", orgId)
      .eq("citizen_id", citizen.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      citizen,
      demands: demands ?? [],
      metrics: {
        totalDemands: demands?.length ?? 0,
        openDemands:
          demands?.filter((d) => d.status !== "resolved" && d.status !== "closed").length ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao carregar perfil CRM 360°." },
      { status: 500 }
    );
  }
}
