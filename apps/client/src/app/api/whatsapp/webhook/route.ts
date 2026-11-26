import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractPhoneFromJid, extractTextFromApiContent } from "@/lib/whatsapp/client";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

/**
 * Receptor de Webhooks do code-chat-br/whatsapp-api-go (v3.7.0).
 * Suporta qrcode.update, connection.update, contacts.upsert, contacts.update, messages.upsert e send.message.
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret =
        req.nextUrl.searchParams.get("secret") ||
        req.headers.get("x-webhook-secret") ||
        req.headers.get("apikey");
      if (providedSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
      }
    }

    const payload = await req.json();
    const event = (payload?.event as string | undefined) || "";
    const instanceField = payload?.instance;
    const instanceName =
      typeof instanceField === "string"
        ? instanceField
        : (instanceField?.name as string | undefined);
    const data = payload?.data as Record<string, unknown> | undefined;

    if (!event || !instanceName) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: true, warning: "SUPABASE_SERVICE_ROLE_KEY não configurada" });
    }

    const { data: instanceRow } = await supabase
      .from("whatsapp_instances")
      .select("id, gabinete_id")
      .eq("instance_name", instanceName)
      .maybeSingle();

    if (!instanceRow) {
      return NextResponse.json({ ok: true, ignored: "instance_not_found" });
    }

    // 1. Atualização de QR Code (qrcode.update / QRCODE_UPDATED)
    if ((event === "qrcode.update" || event === "QRCODE_UPDATED") && data) {
      const qrcode =
        (data.base64 as string | undefined) ||
        ((data.qrcode as Record<string, unknown> | undefined)?.base64 as string | undefined);
      if (qrcode) {
        await supabase
          .from("whatsapp_instances")
          .update({ qr_code: qrcode, status: "connecting", updated_at: new Date().toISOString() })
          .eq("id", instanceRow.id);
      }
    }

    // 2. Atualização de Conexão (connection.update / CONNECTION_UPDATE)
    if ((event === "connection.update" || event === "CONNECTION_UPDATE") && data) {
      const rawConn =
        (data.connection as string | undefined) || (data.state as string | undefined) || "";
      const instanceConnStatus =
        typeof instanceField === "object" && instanceField !== null
          ? (instanceField.connectionStatus as string | undefined)
          : undefined;

      const mappedStatus =
        rawConn === "open" || instanceConnStatus === "online"
          ? "connected"
          : rawConn === "close" || rawConn === "replaced" || rawConn === "timeout"
          ? "disconnected"
          : "connecting";

      const ownerJid =
        typeof instanceField === "object" && instanceField !== null
          ? (instanceField.ownerJid as string | undefined)
          : undefined;
      const phone = extractPhoneFromJid(ownerJid);

      await supabase
        .from("whatsapp_instances")
        .update({
          status: mappedStatus,
          ...(phone ? { phone_number: phone } : {}),
          ...(mappedStatus === "connected"
            ? { last_connected_at: new Date().toISOString(), qr_code: null, pairing_code: null }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", instanceRow.id);
    }

    // 3. Sincronização de Contatos (contacts.upsert / contacts.update)
    if ((event === "contacts.upsert" || event === "contacts.update") && data) {
      const remoteJid = data.remoteJid as string | undefined;
      const pushName = (data.pushName as string | undefined) || null;
      const profilePicUrl = (data.profilePicUrl as string | undefined) || null;

      if (
        remoteJid &&
        !remoteJid.endsWith("@g.us") &&
        !remoteJid.endsWith("@newsletter") &&
        remoteJid !== "status@broadcast"
      ) {
        const phone = extractPhoneFromJid(remoteJid);
        await supabase.from("whatsapp_contacts").upsert(
          {
            gabinete_id: instanceRow.gabinete_id,
            jid: remoteJid,
            phone,
            ...(pushName ? { name: pushName } : {}),
            ...(profilePicUrl ? { profile_pic_url: profilePicUrl } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "gabinete_id,jid" }
        );
      }
    }

    // 4. Mensagens recebidas e enviadas (messages.upsert / send.message / MESSAGES_UPSERT)
    if (
      (event === "messages.upsert" || event === "send.message" || event === "MESSAGES_UPSERT") &&
      data
    ) {
      // Suporta formato whatsapp-api-go v3.7.0 e fallback legado
      const key = data.key as Record<string, unknown> | undefined;
      const remoteJid =
        (data.keyRemoteJid as string | undefined) || (key?.remoteJid as string | undefined);
      const fromMe =
        data.keyFromMe !== undefined ? Boolean(data.keyFromMe) : Boolean(key?.fromMe);
      const messageId =
        (data.keyId as string | undefined) || (key?.id as string | undefined);
      const pushName = (data.pushName as string | undefined) || null;
      const messageType = (data.messageType as string | undefined) || "text";
      const contentObj =
        (data.content as Record<string, unknown> | undefined) ||
        (data.message as Record<string, unknown> | undefined);

      const textContent = extractTextFromApiContent(messageType, contentObj);

      if (
        remoteJid &&
        !remoteJid.endsWith("@g.us") &&
        !remoteJid.endsWith("@newsletter") &&
        remoteJid !== "status@broadcast"
      ) {
        const phone = extractPhoneFromJid(remoteJid);
        const { data: contact } = await supabase
          .from("whatsapp_contacts")
          .upsert(
            {
              gabinete_id: instanceRow.gabinete_id,
              jid: remoteJid,
              phone,
              ...(!fromMe && pushName ? { name: pushName } : {}),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "gabinete_id,jid" }
          )
          .select("id")
          .single();

        if (contact && textContent) {
          if (messageId) {
            const { data: existingMsg } = await supabase
              .from("whatsapp_messages")
              .select("id")
              .eq("gabinete_id", instanceRow.gabinete_id)
              .eq("message_id", messageId)
              .maybeSingle();
            if (existingMsg) {
              return NextResponse.json({
                ok: true,
                event,
                instance: instanceName,
                deduplicated: true,
              });
            }
          }

          await supabase.from("whatsapp_messages").insert({
            gabinete_id: instanceRow.gabinete_id,
            instance_id: instanceRow.id,
            contact_id: contact.id,
            message_id: messageId ?? null,
            direction: fromMe ? "outbound" : "inbound",
            type: messageType,
            content: textContent,
            status: fromMe ? "sent" : "delivered",
          });
        }
      }
    }

    return NextResponse.json({ ok: true, event, instance: instanceName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
