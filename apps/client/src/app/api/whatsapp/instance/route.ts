import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { whatsappClient, resolveActiveWhatsAppNode } from "@/lib/whatsapp/client";

const UuidSchema = z.string().uuid();

const ConnectSchema = z.object({
  gabineteId: z.string().uuid(),
  phoneNumber: z.string().optional(),
});

async function requireCabinetAccess(gabineteId: string): Promise<NextResponse | null> {
  if (!UuidSchema.safeParse(gabineteId).success) {
    return NextResponse.json({ error: "gabineteId inválido" }, { status: 400 });
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

  return null;
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export async function GET(req: NextRequest) {
  try {
    const gabineteId = req.nextUrl.searchParams.get("gabineteId");
    if (!gabineteId) {
      return NextResponse.json({ error: "gabineteId obrigatório" }, { status: 400 });
    }
    const denied = await requireCabinetAccess(gabineteId);
    if (denied) return denied;

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ status: "disconnected" });
    }

    const { data: inst } = await supabase
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token, status")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (!inst || !inst.instance_token) {
      return NextResponse.json({ status: "disconnected" });
    }

    const nodeConfig = await resolveActiveWhatsAppNode(supabase);

    const stateRes = await whatsappClient.getConnectionState(
      inst.instance_name,
      inst.instance_token,
      nodeConfig
    );
    const rawState = stateRes?.instance?.state;
    const mappedStatus =
      rawState === "open" ? "connected" : rawState === "close" ? "disconnected" : "connecting";

    if (mappedStatus !== inst.status) {
      await supabase
        .from("whatsapp_instances")
        .update({
          status: mappedStatus,
          ...(mappedStatus === "connected" ? { last_connected_at: new Date().toISOString(), qr_code: null } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inst.id);
    }

    return NextResponse.json({ status: mappedStatus });
  } catch {
    return NextResponse.json({ status: "connecting" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const gabineteId = req.nextUrl.searchParams.get("gabineteId");
    if (!gabineteId) {
      return NextResponse.json({ error: "gabineteId obrigatório" }, { status: 400 });
    }
    const denied = await requireCabinetAccess(gabineteId);
    if (denied) return denied;

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada" }, { status: 500 });
    }

    const { data: inst } = await supabase
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (inst?.instance_name && inst?.instance_token) {
      const nodeConfig = await resolveActiveWhatsAppNode(supabase);
      const baseUrl = nodeConfig?.baseUrl || process.env.WHATSAPP_API_URL || "https://gabinete-360-whatsapp-b6xo7.sprites.app";
      const globalToken = nodeConfig?.globalToken || process.env.WHATSAPP_API_GLOBAL_TOKEN || "gab360_global_tok3n_2026_prod";

      await fetch(`${baseUrl}/instance/logout/${encodeURIComponent(inst.instance_name)}`, {
        method: "DELETE",
        headers: {
          apikey: globalToken,
          Authorization: `Bearer ${inst.instance_token}`,
        },
        cache: "no-store",
      }).catch(() => null);

      await supabase
        .from("whatsapp_instances")
        .update({ status: "disconnected", qr_code: null, pairing_code: null, updated_at: new Date().toISOString() })
        .eq("id", inst.id);
    }

    return NextResponse.json({ ok: true, status: "disconnected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao desconectar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ConnectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { gabineteId, phoneNumber } = parsed.data;
    const denied = await requireCabinetAccess(gabineteId);
    if (denied) return denied;
    const instanceName = `gabinete_${gabineteId.replace(/-/g, "").slice(0, 12)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const webhookUrl = `${appUrl}/api/whatsapp/webhook`;

    const supabase = getAdminSupabase();
    const selectedNode = await resolveActiveWhatsAppNode(supabase);

    let token: string | undefined;

    if (supabase) {
      const { data: existingInst } = await supabase
        .from("whatsapp_instances")
        .select("instance_token")
        .eq("gabinete_id", gabineteId)
        .maybeSingle();
      if (existingInst?.instance_token) {
        token = existingInst.instance_token;
      }
    }

    if (!token) {
      try {
        const created = await whatsappClient.createInstance(instanceName, webhookUrl, selectedNode);
        token = created.Auth?.token ?? created.instance?.token;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("(409)")) throw err;
        // Instância já existe no Sprite (ex.: tentativa anterior); busca token ou recria
        const listRes = await fetch(
          `${(selectedNode?.baseUrl || process.env.WHATSAPP_API_URL || "https://gabinete-360-whatsapp-b6xo7.sprites.app")}/instance/fetchInstances`,
          {
            headers: {
              apikey: selectedNode?.globalToken || process.env.WHATSAPP_API_GLOBAL_TOKEN || "gab360_global_tok3n_2026_prod",
            },
            cache: "no-store",
          }
        );
        if (listRes.ok) {
          const instances = (await listRes.json()) as Array<{ name?: string; Auth?: { token?: string } }>;
          const found = instances.find((i) => i.name === instanceName);
          token = found?.Auth?.token;
        }
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token da instância não encontrado na API do WhatsApp." },
        { status: 502 }
      );
    }

    const connectData = await whatsappClient.connectInstance(
      instanceName,
      token,
      phoneNumber,
      selectedNode
    );

    const qrCodeBase64 = connectData.base64 ?? null;
    const pairingCode = connectData.pairingCode ?? null;

    if (supabase) {
      const { error: upsertErr } = await supabase.from("whatsapp_instances").upsert(
        {
          gabinete_id: gabineteId,
          instance_name: instanceName,
          instance_token: token,
          status: "connecting",
          qr_code: qrCodeBase64,
          pairing_code: pairingCode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gabinete_id" }
      );
      if (upsertErr) {
        console.error("[WhatsApp Instance] Erro ao persistir instância no Supabase:", upsertErr.message);
      }
    }

    return NextResponse.json({
      instanceName,
      instanceToken: token,
      status: "connecting",
      qrCodeBase64,
      pairingCode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao conectar WhatsApp";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
