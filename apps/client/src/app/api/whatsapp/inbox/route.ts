import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const UuidSchema = z.string().uuid("gabineteId inválido.");

/**
 * WhatsApp Omnichannel Inbox: lista contatos e mensagens recentes do gabinete autenticado.
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

    const gabineteIdParam = req.nextUrl.searchParams.get("gabineteId");
    if (gabineteIdParam && !UuidSchema.safeParse(gabineteIdParam).success) {
      return NextResponse.json({ error: "gabineteId inválido." }, { status: 400 });
    }

    let membershipQuery = supabase
      .from("memberships")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (gabineteIdParam) {
      membershipQuery = membershipQuery.eq("organization_id", gabineteIdParam);
    }

    const { data: membership } = await membershipQuery.limit(1).maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const gabineteId = membership.organization_id;

    const [{ data: contacts }, { data: messages }] = await Promise.all([
      supabase
        .from("whatsapp_contacts")
        .select("id, phone, push_name, updated_at")
        .eq("gabinete_id", gabineteId)
        .order("updated_at", { ascending: false })
        .limit(30),
      supabase
        .from("whatsapp_messages")
        .select("id, contact_id, direction, msg_type, content, created_at")
        .eq("gabinete_id", gabineteId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return NextResponse.json({
      success: true,
      gabineteId,
      contacts: contacts ?? [],
      messages: messages ?? [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao carregar inbox omnichannel." },
      { status: 500 }
    );
  }
}
