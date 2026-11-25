import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

/**
 * Receptor de Webhooks do whatsapp-api-go.
 * Persiste eventos em tempo real no Supabase: QRCODE_UPDATED, CONNECTION_UPDATE, MESSAGES_UPSERT.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = payload?.event as string | undefined;
    const instanceName = payload?.instance as string | undefined;
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

    if (event === "QRCODE_UPDATED" && data) {
      const qrcode = (data.qrcode as Record<string, unknown> | undefined)?.base64 as string | undefined;
      if (qrcode) {
        await supabase
          .from("whatsapp_instances")
          .update({ qr_code: qrcode, status: "connecting", updated_at: new Date().toISOString() })
          .eq("id", instanceRow.id);
      }
    }

    if (event === "CONNECTION_UPDATE" && data) {
      const state = data.state as string | undefined;
      const mappedStatus =
        state === "open" ? "connected" : state === "close" ? "disconnected" : "connecting";
      await supabase
        .from("whatsapp_instances")
        .update({
          status: mappedStatus,
          ...(mappedStatus === "connected" ? { last_connected_at: new Date().toISOString(), qr_code: null } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", instanceRow.id);
    }

    if (event === "MESSAGES_UPSERT" && data) {
      const key = data.key as Record<string, unknown> | undefined;
      const remoteJid = key?.remoteJid as string | undefined;
      const fromMe = Boolean(key?.fromMe);
      const messageId = key?.id as string | undefined;
      const pushName = (data.pushName as string | undefined) || null;
      const msgObj = data.message as Record<string, unknown> | undefined;
      const textContent =
        (msgObj?.conversation as string | undefined) ||
        ((msgObj?.extendedTextMessage as Record<string, unknown> | undefined)?.text as string | undefined) ||
        "";

      if (remoteJid && !remoteJid.endsWith("@g.us")) {
        const phone = remoteJid.replace(/@s\.whatsapp\.net$/, "");
        const { data: contact } = await supabase
          .from("whatsapp_contacts")
          .upsert(
            {
              gabinete_id: instanceRow.gabinete_id,
              jid: remoteJid,
              phone,
              name: pushName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "gabinete_id,jid" }
          )
          .select("id")
          .single();

        if (contact) {
          await supabase.from("whatsapp_messages").insert({
            gabinete_id: instanceRow.gabinete_id,
            instance_id: instanceRow.id,
            contact_id: contact.id,
            message_id: messageId ?? null,
            direction: fromMe ? "outbound" : "inbound",
            type: "text",
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
