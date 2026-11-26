import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  whatsappClient,
  resolveActiveWhatsAppNode,
  extractPhoneFromJid,
  extractTextFromApiContent,
} from "@/lib/whatsapp/client";

const UuidSchema = z.string().uuid("gabineteId inválido.");

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey);
}

/**
 * WhatsApp Omnichannel Inbox:
 * - Sincroniza mensagens recentes do servidor Go (whatsapp-api-go) quando ?sync=1
 * - Lista contatos e mensagens do gabinete autenticado a partir do Supabase
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
    const shouldSync = req.nextUrl.searchParams.get("sync") === "1";

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
    const adminSupabase = getAdminSupabase();
    const db = adminSupabase ?? supabase;
    let syncedCount = 0;

    if (shouldSync) {
      try {
        const { data: inst } = await db
          .from("whatsapp_instances")
          .select("id, instance_name, instance_token")
          .eq("gabinete_id", gabineteId)
          .maybeSingle();

        if (inst?.instance_name && inst?.instance_token) {
          const nodeConfig = await resolveActiveWhatsAppNode(adminSupabase);
          const firstPage = await whatsappClient.findMessages(
            inst.instance_name,
            inst.instance_token,
            { page: 1, offset: 50 },
            nodeConfig
          );

          const totalPages = firstPage.messages?.pages || 1;
          const records =
            totalPages > 1
              ? (
                  await whatsappClient.findMessages(
                    inst.instance_name,
                    inst.instance_token,
                    { page: totalPages, offset: 50 },
                    nodeConfig
                  )
                ).messages?.records ?? []
              : firstPage.messages?.records ?? [];

          const contactCache = new Map<string, string>();

          for (const rec of records) {
            const jid = rec.keyRemoteJid;
            if (
              !jid ||
              jid.endsWith("@g.us") ||
              jid.endsWith("@newsletter") ||
              jid === "status@broadcast"
            ) {
              continue;
            }

            let contactId = contactCache.get(jid);
            if (!contactId) {
              const phone = extractPhoneFromJid(jid);
              const { data: contactRow } = await db
                .from("whatsapp_contacts")
                .upsert(
                  {
                    gabinete_id: gabineteId,
                    jid,
                    phone,
                    ...(!rec.keyFromMe && rec.pushName ? { name: rec.pushName } : {}),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "gabinete_id,jid" }
                )
                .select("id")
                .single();

              if (contactRow?.id) {
                contactId = contactRow.id;
                contactCache.set(jid, contactRow.id);
              }
            }

            if (!contactId || !rec.keyId) continue;

            const { data: existingMsg } = await db
              .from("whatsapp_messages")
              .select("id")
              .eq("gabinete_id", gabineteId)
              .eq("message_id", rec.keyId)
              .maybeSingle();

            if (!existingMsg) {
              const text = extractTextFromApiContent(rec.messageType, rec.content);
              if (!text) continue;
              const createdAt = rec.messageTimestamp
                ? new Date(rec.messageTimestamp * 1000).toISOString()
                : new Date().toISOString();

              const { error: insertErr } = await db.from("whatsapp_messages").insert({
                gabinete_id: gabineteId,
                instance_id: inst.id,
                contact_id: contactId,
                message_id: rec.keyId,
                direction: rec.keyFromMe ? "outbound" : "inbound",
                type: rec.messageType || "text",
                content: text,
                status: rec.keyFromMe ? "sent" : "delivered",
                created_at: createdAt,
              });
              if (!insertErr) syncedCount += 1;
            }
          }
        }
      } catch (syncErr) {
        console.warn("[WhatsApp Inbox] Falha ao sincronizar mensagens com servidor Go:", syncErr);
      }
    }

    const [{ data: contacts }, { data: messages }] = await Promise.all([
      db
        .from("whatsapp_contacts")
        .select("id, jid, phone, name, profile_pic_url, updated_at")
        .eq("gabinete_id", gabineteId)
        .order("updated_at", { ascending: false })
        .limit(50),
      db
        .from("whatsapp_messages")
        .select("id, contact_id, direction, type, content, status, created_at")
        .eq("gabinete_id", gabineteId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return NextResponse.json({
      success: true,
      gabineteId,
      syncedCount,
      contacts: contacts ?? [],
      messages: messages ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao carregar inbox omnichannel.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
