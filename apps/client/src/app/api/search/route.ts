import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const SearchQuerySchema = z.object({
  q: z.string().trim().min(2, "Termo de busca deve ter ao menos 2 caracteres.").max(120),
  organizationId: z.string().uuid("organizationId inválido.").optional(),
});

/**
 * Busca Global permission-aware com isolamento estrito por organization_id.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const parsed = SearchQuerySchema.safeParse({
      q: req.nextUrl.searchParams.get("q") ?? "",
      organizationId: req.nextUrl.searchParams.get("organizationId") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { q, organizationId } = parsed.data;

    let membershipQuery = supabase
      .from("memberships")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (organizationId) {
      membershipQuery = membershipQuery.eq("organization_id", organizationId);
    }

    const { data: membership } = await membershipQuery.limit(1).maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const orgId = membership.organization_id;
    const pattern = `%${q}%`;

    const [{ data: demands }, { data: citizens }, { data: legislative }] = await Promise.all([
      supabase
        .from("demands")
        .select("id, title, protocol, status, priority")
        .eq("organization_id", orgId)
        .ilike("title", pattern)
        .limit(10),
      supabase
        .from("citizens")
        .select("id, name, neighborhood, phone")
        .eq("organization_id", orgId)
        .ilike("name", pattern)
        .limit(10),
      supabase
        .from("legislative_items")
        .select("id, kind, number, title, status")
        .eq("organization_id", orgId)
        .ilike("title", pattern)
        .limit(10),
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      organizationId: orgId,
      results: {
        demands: demands ?? [],
        citizens: citizens ?? [],
        legislative: legislative ?? [],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao executar busca global." },
      { status: 500 }
    );
  }
}
