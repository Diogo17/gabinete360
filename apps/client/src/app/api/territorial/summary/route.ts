import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Inteligência Territorial: agregação de demandas por bairro/região no tenant ativo.
 * Sem segmentação política, eleitoral ou perfilamento sensível.
 */
export async function GET() {
  try {
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

    const { data: demands, error } = await supabase
      .from("demands")
      .select("location_text, priority, status")
      .eq("organization_id", membership.organization_id)
      .limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const byNeighborhood: Record<string, { total: number; urgent: number; open: number }> = {};
    for (const row of demands ?? []) {
      const key = row.location_text || "Não informado";
      if (!byNeighborhood[key]) {
        byNeighborhood[key] = { total: 0, urgent: 0, open: 0 };
      }
      byNeighborhood[key].total += 1;
      if (row.priority === "urgent" || row.priority === "high") {
        byNeighborhood[key].urgent += 1;
      }
      if (row.status !== "resolved" && row.status !== "closed") {
        byNeighborhood[key].open += 1;
      }
    }

    return NextResponse.json({
      success: true,
      organizationId: membership.organization_id,
      neighborhoods: Object.entries(byNeighborhood).map(([neighborhood, stats]) => ({
        neighborhood,
        ...stats,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao gerar resumo territorial." },
      { status: 500 }
    );
  }
}
