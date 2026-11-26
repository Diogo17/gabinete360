import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import {
  whatsappClient,
  resolveActiveWhatsAppNode,
  extractPhoneFromJid,
} from "@/lib/whatsapp/client";

const SendMessageSchema = z.object({
  gabineteId: z.string().uuid(),
  number: z.string().min(8),
  contactName: z.string().max(120).optional(),
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
 * Envia mensagem via whatsapp-api-go (v3.7.0), persiste o contato e a mensagem no Supabase,
 * e retorna o registro salvo para atualização imediata da interface.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { gabineteId, number, contactName, text, mediaUrl, mediaType } = parsed.data;
    if (!mediaUrl && (!text || !text.trim())) {
      return NextResponse.json({ error: "Texto ou mídia é obrigatório." }, { status: 400 });
    }

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

    const adminSupabase = getAdminSupabase();
    const db = adminSupabase ?? userClient;
    const nodeConfig = await resolveActiveWhatsAppNode(adminSupabase);

    const { data: instanceRow, error: instErr } = await db
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (instErr || !instanceRow || !instanceRow.instance_token) {
      return NextResponse.json(
        { error: "Instância WhatsApp não encontrada para este gabinete." },
        { status: 404 }
      );
    }

    const normalizedPhone = number.includes("@") ? extractPhoneFromJid(number) : number.replace(/\D/g, "");
    const antiBanDelayMs = Math.floor(800 + Math.random() * 1200);

    const result =
      mediaUrl && mediaType
        ? await whatsappClient.sendMedia(
            instanceRow.instance_name,
            instanceRow.instance_token,
            {
              number: normalizedPhone,
              mediatype: mediaType,
              media: mediaUrl,
              caption: text,
              delayMs: antiBanDelayMs,
            },
            nodeConfig
          )
        : await whatsappClient.sendText(
            instanceRow.instance_name,
            instanceRow.instance_token,
            {
              number: normalizedPhone,
              text: text!.trim(),
              delayMs: antiBanDelayMs,
            },
            nodeConfig
          );

    const remoteJid = result.keyRemoteJid || `${normalizedPhone}@s.whatsapp.net`;
    const keyId = result.keyId ?? result.key?.id ?? null;

    const { data: contact } = await db
      .from("whatsapp_contacts")
      .upsert(
        {
          gabinete_id: gabineteId,
          jid: remoteJid,
          phone: normalizedPhone,
          ...(contactName ? { name: contactName } : {}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gabinete_id,jid" }
      )
      .select("id, phone, name")
      .maybeSingle();

    let savedMessage = null;
    if (contact?.id) {
      if (keyId) {
        const { data: existing } = await db
          .from("whatsapp_messages")
          .select("id, contact_id, direction, content, created_at")
          .eq("gabinete_id", gabineteId)
          .eq("message_id", keyId)
          .maybeSingle();
        if (existing) {
          savedMessage = existing;
        }
      }

      if (!savedMessage) {
        const { data: inserted } = await db
          .from("whatsapp_messages")
          .insert({
            gabinete_id: gabineteId,
            instance_id: instanceRow.id,
            contact_id: contact.id,
            message_id: keyId,
            direction: "outbound",
            type: mediaType ?? "text",
            content: text?.trim() || `[${mediaType}]`,
            media_url: mediaUrl ?? null,
            status: "sent",
          })
          .select("id, contact_id, direction, content, created_at")
          .maybeSingle();
        savedMessage = inserted;
      }
    }

    return NextResponse.json({
      ok: true,
      messageId: keyId,
      contact,
      savedMessage,
      appliedDelayMs: antiBanDelayMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar mensagem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
