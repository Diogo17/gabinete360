import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import {
  whatsappClient,
  resolveActiveWhatsAppNode,
  mapApiConnectionToStatus,
  extractPhoneFromJid,
} from "@/lib/whatsapp/client";

const UuidSchema = z.string().uuid();

const ConnectSchema = z.object({
  gabineteId: z.string().uuid(),
  phoneNumber: z.string().optional(),
});

async function requireCabinetAccess(gabineteId: string) {
  if (!UuidSchema.safeParse(gabineteId).success) {
    return {
      denied: NextResponse.json({ error: "gabineteId inválido" }, { status: 400 }),
      userClient: null,
    };
  }
  const userClient = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return {
      denied: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
      userClient: null,
    };
  }

  const { data: membership } = await userClient
    .from("memberships")
    .select("id")
    .eq("organization_id", gabineteId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return {
      denied: NextResponse.json({ error: "Acesso negado a este gabinete." }, { status: 403 }),
      userClient: null,
    };
  }

  return { denied: null, userClient };
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

function buildWebhookUrl(origin: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/$/, "");
  const base = `${appUrl}/api/whatsapp/webhook`;
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  return secret ? `${base}?secret=${encodeURIComponent(secret)}` : base;
}

export async function GET(req: NextRequest) {
  try {
    const gabineteId = req.nextUrl.searchParams.get("gabineteId");
    const isPing = req.nextUrl.searchParams.get("ping") === "1";

    if (!gabineteId) {
      return NextResponse.json({ error: "gabineteId obrigatório" }, { status: 400 });
    }
    const { denied, userClient } = await requireCabinetAccess(gabineteId);
    if (denied || !userClient) return denied!;

    const adminSupabase = getAdminSupabase();
    const db = adminSupabase ?? userClient;
    const nodeConfig = await resolveActiveWhatsAppNode(adminSupabase);

    const startedAt = Date.now();
    let apiHealth: { ok: boolean; latencyMs: number; error?: string } | undefined;
    if (isPing) {
      try {
        await whatsappClient.health(nodeConfig);
        apiHealth = { ok: true, latencyMs: Date.now() - startedAt };
      } catch (err) {
        apiHealth = {
          ok: false,
          latencyMs: Date.now() - startedAt,
          error: err instanceof Error ? err.message : "Falha no ping",
        };
      }
    }

    const expectedName = `gabinete_${gabineteId.replace(/-/g, "").slice(0, 12)}`;
    const { data: initialInst } = await db
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token, status, phone_number, qr_code, pairing_code")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    let inst = initialInst;

    // Se a instância existir no servidor Go mas não estiver salva ainda no Supabase, sincroniza automaticamente
    if (!inst || !inst.instance_token) {
      try {
        const remoteList = await whatsappClient.fetchInstances(nodeConfig);
        const remote = remoteList.find((item) => item.name === expectedName);
        if (remote?.Auth?.token) {
          const { data: upserted } = await db
            .from("whatsapp_instances")
            .upsert(
              {
                gabinete_id: gabineteId,
                instance_name: remote.name,
                instance_token: remote.Auth.token,
                status: remote.connectionStatus === "online" ? "connected" : "disconnected",
                phone_number: extractPhoneFromJid(remote.ownerJid) || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "gabinete_id" }
            )
            .select("id, instance_name, instance_token, status, phone_number, qr_code, pairing_code")
            .maybeSingle();
          if (upserted) inst = upserted;
        }
      } catch {
        // Ignora erro de listagem na recuperação silenciosa
      }
    }

    if (!inst || !inst.instance_token) {
      return NextResponse.json({
        status: "disconnected",
        ...(apiHealth ? { ping: apiHealth, apiUrl: nodeConfig.baseUrl } : {}),
      });
    }

    const stateRes = await whatsappClient.getConnectionState(
      inst.instance_name,
      inst.instance_token,
      nodeConfig
    );
    const mappedStatus = mapApiConnectionToStatus(stateRes);
    const phoneNumber = extractPhoneFromJid(stateRes.ownerJid) || inst.phone_number || null;

    if (mappedStatus !== inst.status || (phoneNumber && phoneNumber !== inst.phone_number)) {
      await db
        .from("whatsapp_instances")
        .update({
          status: mappedStatus,
          ...(phoneNumber ? { phone_number: phoneNumber } : {}),
          ...(mappedStatus === "connected"
            ? { last_connected_at: new Date().toISOString(), qr_code: null, pairing_code: null }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inst.id);
    }

    return NextResponse.json({
      status: mappedStatus,
      instanceName: inst.instance_name,
      connectionStatus: stateRes.connectionStatus ?? null,
      connected: Boolean(stateRes.connected),
      loggedIn: Boolean(stateRes.loggedIn),
      ownerJid: stateRes.ownerJid ?? null,
      phoneNumber,
      qrCode: mappedStatus === "connected" ? null : inst.qr_code,
      pairingCode: mappedStatus === "connected" ? null : inst.pairing_code,
      ...(apiHealth ? { ping: apiHealth, apiUrl: nodeConfig.baseUrl } : {}),
    });
  } catch (error) {
    return NextResponse.json({
      status: "disconnected",
      error: error instanceof Error ? error.message : "Erro ao consultar instância",
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const gabineteId = req.nextUrl.searchParams.get("gabineteId");
    if (!gabineteId) {
      return NextResponse.json({ error: "gabineteId obrigatório" }, { status: 400 });
    }
    const { denied, userClient } = await requireCabinetAccess(gabineteId);
    if (denied || !userClient) return denied!;

    const adminSupabase = getAdminSupabase();
    const db = adminSupabase ?? userClient;
    const nodeConfig = await resolveActiveWhatsAppNode(adminSupabase);

    const { data: inst } = await db
      .from("whatsapp_instances")
      .select("id, instance_name, instance_token")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (inst?.instance_name && inst?.instance_token) {
      await whatsappClient
        .logoutInstance(inst.instance_name, inst.instance_token, nodeConfig)
        .catch(() => null);

      await db
        .from("whatsapp_instances")
        .update({
          status: "disconnected",
          qr_code: null,
          pairing_code: null,
          updated_at: new Date().toISOString(),
        })
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
    const { denied, userClient } = await requireCabinetAccess(gabineteId);
    if (denied || !userClient) return denied!;

    const instanceName = `gabinete_${gabineteId.replace(/-/g, "").slice(0, 12)}`;
    const webhookUrl = buildWebhookUrl(req.nextUrl.origin);

    const adminSupabase = getAdminSupabase();
    const db = adminSupabase ?? userClient;
    const selectedNode = await resolveActiveWhatsAppNode(adminSupabase);

    let token: string | undefined;

    const { data: existingInst } = await db
      .from("whatsapp_instances")
      .select("instance_token")
      .eq("gabinete_id", gabineteId)
      .maybeSingle();

    if (existingInst?.instance_token) {
      token = existingInst.instance_token;
    }

    if (!token) {
      try {
        const created = await whatsappClient.createInstance(instanceName, selectedNode);
        token = created.Auth?.token ?? created.instance?.token;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("(409)")) throw err;
        const instances = await whatsappClient.fetchInstances(selectedNode);
        const found = instances.find((i) => i.name === instanceName);
        token = found?.Auth?.token;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token da instância não encontrado na API do WhatsApp." },
        { status: 502 }
      );
    }

    // Configura o webhook oficial do whatsapp-api-go (PUT /webhook/set/:instanceName)
    await whatsappClient.setWebhook(instanceName, token, webhookUrl, selectedNode).catch((err) => {
      console.warn("[WhatsApp Instance] Falha ao configurar webhook:", err);
    });

    // Verifica estado atual; se já estiver conectado, retorna sem gerar novo QR
    const currentState = await whatsappClient
      .getConnectionState(instanceName, token, selectedNode)
      .catch(() => null);

    if (currentState && mapApiConnectionToStatus(currentState) === "connected") {
      const phone = extractPhoneFromJid(currentState.ownerJid) || null;
      await db.from("whatsapp_instances").upsert(
        {
          gabinete_id: gabineteId,
          instance_name: instanceName,
          instance_token: token,
          status: "connected",
          phone_number: phone,
          qr_code: null,
          pairing_code: null,
          last_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gabinete_id" }
      );

      return NextResponse.json({
        instanceName,
        status: "connected",
        phoneNumber: phone,
        qrCodeBase64: null,
        pairingCode: null,
      });
    }

    const connectData = await whatsappClient.connectInstance(
      instanceName,
      token,
      phoneNumber,
      selectedNode
    );

    const alreadyConnected = Boolean(connectData.alreadyConnected);
    const qrCodeBase64 = alreadyConnected ? null : (connectData.base64 ?? null);
    const pairingCode = alreadyConnected ? null : (connectData.pairingCode ?? null);
    const nextStatus = alreadyConnected ? "connected" : "connecting";
    const ownerPhone = extractPhoneFromJid(connectData.ownerJid) || null;

    const { error: upsertErr } = await db.from("whatsapp_instances").upsert(
      {
        gabinete_id: gabineteId,
        instance_name: instanceName,
        instance_token: token,
        status: nextStatus,
        ...(ownerPhone ? { phone_number: ownerPhone } : {}),
        qr_code: qrCodeBase64,
        pairing_code: pairingCode,
        ...(alreadyConnected ? { last_connected_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "gabinete_id" }
    );

    if (upsertErr) {
      throw new Error(`Erro ao salvar instância WhatsApp no banco: ${upsertErr.message}`);
    }

    return NextResponse.json({
      instanceName,
      status: nextStatus,
      phoneNumber: ownerPhone,
      qrCodeBase64,
      pairingCode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao conectar WhatsApp";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
