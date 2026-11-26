import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { whatsappClient, type WhatsAppNodeConfig } from "@/lib/whatsapp/client";

const ConnectSchema = z.object({
  gabineteId: z.string().uuid(),
  phoneNumber: z.string().optional(),
});

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

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ status: "disconnected" });
    }

    const { data: inst } = await supabase
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token, status, whatsapp_nodes(base_url, global_token)")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (!inst || !inst.instance_token) {
      return NextResponse.json({ status: "disconnected" });
    }

    const nodeData = Array.isArray(inst.whatsapp_nodes)
      ? inst.whatsapp_nodes[0]
      : inst.whatsapp_nodes;
    const nodeConfig: WhatsAppNodeConfig | undefined = nodeData
      ? { baseUrl: nodeData.base_url, globalToken: nodeData.global_token }
      : undefined;

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

    const supabase = getAdminSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada" }, { status: 500 });
    }

    const { data: inst } = await supabase
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token, whatsapp_nodes(base_url, global_token)")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (inst?.instance_name && inst?.instance_token) {
      const nodeData = Array.isArray(inst.whatsapp_nodes)
        ? inst.whatsapp_nodes[0]
        : inst.whatsapp_nodes;
      const baseUrl = nodeData?.base_url || process.env.WHATSAPP_API_URL || "https://gabinete-360-whatsapp-b6xo7.sprites.app";
      const globalToken = nodeData?.global_token || process.env.WHATSAPP_API_GLOBAL_TOKEN || "gab360_global_tok3n_2026_prod";

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
    const instanceName = `gabinete_${gabineteId.replace(/-/g, "").slice(0, 12)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const webhookUrl = `${appUrl}/api/whatsapp/webhook`;

    const supabase = getAdminSupabase();
    let selectedNode: WhatsAppNodeConfig | undefined;
    let nodeId: string | null = null;

    if (supabase) {
      const { data: nodeRow } = await supabase
        .from("whatsapp_nodes")
        .select("id, base_url, global_token")
        .eq("status", "active")
        .order("active_instances", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nodeRow) {
        nodeId = nodeRow.id;
        selectedNode = { baseUrl: nodeRow.base_url, globalToken: nodeRow.global_token };
      }
    }

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
      await supabase.from("whatsapp_instances").upsert(
        {
          gabinete_id: gabineteId,
          node_id: nodeId,
          instance_name: instanceName,
          instance_token: token,
          status: "connecting",
          qr_code: qrCodeBase64,
          pairing_code: pairingCode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gabinete_id" }
      );
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
