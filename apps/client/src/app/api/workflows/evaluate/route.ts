import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const WorkflowEventSchema = z.object({
  event: z.enum(["demand.created", "sla.breached", "document.signed"]),
  organizationId: z.string().uuid("organizationId inválido.").optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Workflow Engine: avalia eventos do gabinete e retorna ações sugeridas.
 * Ações críticas exigem confirmação humana explícita.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = WorkflowEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Evento inválido.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { event, organizationId, payload } = parsed.data;

    let membershipQuery = supabase
      .from("memberships")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (organizationId) {
      membershipQuery = membershipQuery.eq("organization_id", organizationId);
    }

    const { data: membership } = await membershipQuery.limit(1).maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const rules: Record<
      "demand.created" | "sla.breached" | "document.signed",
      { action: string; requiresHumanApproval: boolean }
    > = {
      "demand.created": {
        action: "notify_triage_queue",
        requiresHumanApproval: false,
      },
      "sla.breached": {
        action: "escalate_to_chief_of_staff",
        requiresHumanApproval: true,
      },
      "document.signed": {
        action: "publish_verification_record",
        requiresHumanApproval: true,
      },
    };

    const matchedRule = rules[event];

    return NextResponse.json({
      success: true,
      organizationId: membership.organization_id,
      event,
      recommendedAction: matchedRule.action,
      requiresHumanApproval: matchedRule.requiresHumanApproval,
      evaluatedAt: new Date().toISOString(),
      payloadKeys: Object.keys(payload),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao avaliar workflow." },
      { status: 500 }
    );
  }
}
