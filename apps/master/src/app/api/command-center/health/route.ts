import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

/**
 * Command Center (MASTER): retorna visão consolidada de saúde da plataforma
 * exclusivamente para administradores ativos da plataforma.
 */
export async function GET() {
  try {
    const userClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const adminClient = await createAdminClient();
    const { data: adminRow } = await adminClient
      .from("platform_admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const [{ count: organizationsCount }, { count: activeAdminsCount }] = await Promise.all([
      adminClient.from("organizations").select("id", { count: "exact", head: true }),
      adminClient
        .from("platform_admins")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      metrics: {
        organizationsCount: organizationsCount ?? 0,
        activeAdminsCount: activeAdminsCount ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao consultar Command Center." },
      { status: 500 }
    );
  }
}
