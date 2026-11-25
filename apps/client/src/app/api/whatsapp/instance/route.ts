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
