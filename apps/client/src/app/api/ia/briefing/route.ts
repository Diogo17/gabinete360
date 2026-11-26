import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const BriefingSchema = z.object({
  organizationId: z.string().uuid("organizationId inválido.").optional(),
  period: z.enum(["daily", "weekly"]).default("daily"),
});

/**
 * Gera Smart Briefing permission-aware (diário ou semanal) com isolamento estrito por tenant.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para acessar o Smart Briefing." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BriefingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { organizationId, period } = parsed.data;

    let membershipQuery = supabase
      .from("memberships")
      .select("id, organization_id, role")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (organizationId) {
      membershipQuery = membershipQuery.eq("organization_id", organizationId);
    }

    const { data: membership } = await membershipQuery.limit(1).maybeSingle();
    if (!membership) {
      return NextResponse.json(
        { error: "Acesso negado. Usuário sem vínculo ativo com o gabinete." },
        { status: 403 }
      );
    }

    const orgId = membership.organization_id;
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(now.getDate() + (period === "weekly" ? 7 : 1));

    const [{ data: demands }, { data: events }, { data: legislative }] = await Promise.all([
      supabase
        .from("demands")
        .select("id, title, priority, status, created_at")
        .eq("organization_id", orgId)
        .in("status", ["received", "in_progress", "pending"])
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("agenda_events")
        .select("id, title, starts_at, location")
        .eq("organization_id", orgId)
        .gte("starts_at", now.toISOString())
        .lte("starts_at", horizon.toISOString())
        .order("starts_at", { ascending: true })
        .limit(10),
      supabase
        .from("legislative_items")
        .select("id, type, number, title, status")
        .eq("organization_id", orgId)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const summaryData = {
      period,
      organizationId: orgId,
      role: membership.role,
      openDemandsCount: demands?.length ?? 0,
      urgentDemandsCount: demands?.filter((d) => d.priority === "urgent" || d.priority === "high").length ?? 0,
      upcomingEventsCount: events?.length ?? 0,
      activeLegislativeCount: legislative?.length ?? 0,
      demands: demands ?? [],
      events: events ?? [],
      legislative: legislative ?? [],
    };

    const apiKey = process.env.GEMINI_API_KEY;
    let aiBriefing: string | null = null;

    if (apiKey) {
      const prompt = `Gere um Smart Briefing ${period === "weekly" ? "semanal" : "diário"} objetivo em português para um gabinete parlamentar com base exclusivamente nos dados JSON abaixo:\n${JSON.stringify({
        openDemandsCount: summaryData.openDemandsCount,
        urgentDemandsCount: summaryData.urgentDemandsCount,
        upcomingEventsCount: summaryData.upcomingEventsCount,
        activeLegislativeCount: summaryData.activeLegislativeCount,
        topDemands: summaryData.demands.slice(0, 5).map((d) => ({ title: d.title, priority: d.priority, status: d.status })),
        nextEvents: summaryData.events.slice(0, 5).map((e) => ({ title: e.title, starts_at: e.starts_at })),
      })}`;

      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: "Você é o Gabinete Copilot. Seja conciso, institucional e acionável." }],
            },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
          }),
        }
      );

      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        aiBriefing = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      }
    }

    return NextResponse.json({
      success: true,
      briefing: aiBriefing,
      metrics: {
        openDemandsCount: summaryData.openDemandsCount,
        urgentDemandsCount: summaryData.urgentDemandsCount,
        upcomingEventsCount: summaryData.upcomingEventsCount,
        activeLegislativeCount: summaryData.activeLegislativeCount,
      },
      items: {
        demands: summaryData.demands,
        events: summaryData.events,
        legislative: summaryData.legislative,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro interno ao gerar Smart Briefing." },
      { status: 500 }
    );
  }
}
