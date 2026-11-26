import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { whatsappClient, type WhatsAppNodeConfig } from "@/lib/whatsapp/client";

const SendMessageSchema = z.object({
  gabineteId: z.string().uuid(),
  number: z.string().min(8),
  text: z.string().max(4096).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "audio", "document"]).optional(),
});

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

/**
 * Envia mensagem buscando automaticamente instance_name, instance_token e node no Supabase,
 * aplicando delay randômico anti-ban (2.5s a 5.5s) e presença "composing".
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { gabineteId, number, text, mediaUrl, mediaType } = parsed.data;

    const userClient = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { data: membership } = await userClient
      .from("memberships")
      .select("id")
      .eq("organization_id", gabineteId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Acesso negado a este gabinete." }, { status: 403 });
    }

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada" }, { status: 500 });
    }

    const { data: instanceRow, error: instErr } = await supabase
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token, whatsapp_nodes(base_url, global_token)")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (instErr || !instanceRow || !instanceRow.instance_token) {
      return NextResponse.json({ error: "Instância WhatsApp não encontrada para este gabinete." }, { status: 404 });
    }

    const nodeData = Array.isArray(instanceRow.whatsapp_nodes)
      ? instanceRow.whatsapp_nodes[0]
      : instanceRow.whatsapp_nodes;

    const nodeConfig: WhatsAppNodeConfig | undefined = nodeData
      ? { baseUrl: nodeData.base_url, globalToken: nodeData.global_token }
      : undefined;

    const antiBanDelayMs = Math.floor(2500 + Math.random() * 3000);

    const result =
      mediaUrl && mediaType
        ? await whatsappClient.sendMedia(
            instanceRow.instance_name,
            instanceRow.instance_token,
            { number, mediatype: mediaType, media: mediaUrl, caption: text, delayMs: antiBanDelayMs },
            nodeConfig
          )
        : await whatsappClient.sendText(
            instanceRow.instance_name,
            instanceRow.instance_token,
            { number, text: text ?? "", delayMs: antiBanDelayMs },
            nodeConfig
          );

    return NextResponse.json({
      ok: true,
      messageId: result.key?.id ?? null,
      appliedDelayMs: antiBanDelayMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar mensagem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
