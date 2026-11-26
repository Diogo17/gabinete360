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

interface SavedInstanceRow {
  id: string;
  instance_name: string;
  instance_token: string | null;
  status: string;
  phone_number: string | null;
  qr_code: string | null;
  pairing_code: string | null;
}

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

/**
 * Persiste whatsapp_instances via SELECT + UPDATE/INSERT para não depender de constraint UNIQUE(gabinete_id).
 */
async function saveInstanceRecord(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: { from: (table: string) => any },
  gabineteId: string,
  instanceName: string,
  fields: Record<string, unknown>
): Promise<{ data: SavedInstanceRow | null; error: string | null }> {
  const selectCols = "id, instance_name, instance_token, status, phone_number, qr_code, pairing_code";

  const { data: byGabinete } = await db
    .from("whatsapp_instances")
    .select("id")
    .eq("gabinete_id", gabineteId)
    .limit(1)
    .maybeSingle();

  const existingId = byGabinete?.id
    ? (byGabinete.id as string)
    : (
        await db
          .from("whatsapp_instances")
          .select("id")
          .eq("instance_name", instanceName)
          .limit(1)
          .maybeSingle()
      ).data?.id;

  if (existingId) {
    const { data, error } = await db
      .from("whatsapp_instances")
      .update({
        gabinete_id: gabineteId,
        instance_name: instanceName,
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingId)
      .select(selectCols)
      .maybeSingle();
    return { data: (data as SavedInstanceRow | null) ?? null, error: error?.message ?? null };
  }

  const { data, error } = await db
    .from("whatsapp_instances")
    .insert({
      gabinete_id: gabineteId,
      instance_name: instanceName,
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .select(selectCols)
    .maybeSingle();
  return { data: (data as SavedInstanceRow | null) ?? null, error: error?.message ?? null };
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
      .limit(1)
      .maybeSingle();

    let inst = initialInst as SavedInstanceRow | null;

    // Se a instância existir no servidor Go mas não estiver salva ainda no Supabase, sincroniza automaticamente
    if (!inst || !inst.instance_token) {
      try {
        const remoteList = await whatsappClient.fetchInstances(nodeConfig);
        const remote = remoteList.find((item) => item.name === expectedName);
        if (remote?.Auth?.token) {
          const saved = await saveInstanceRecord(db, gabineteId, remote.name, {
            instance_token: remote.Auth.token,
            status: remote.connectionStatus === "online" ? "connected" : "disconnected",
            phone_number: extractPhoneFromJid(remote.ownerJid) || null,
          });
          if (saved.data) inst = saved.data;
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
      .limit(1)
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
      .limit(1)
      .maybeSingle();

    if (existingInst?.instance_token) {
      token = existingInst.instance_token;
    }

    // Verifica no servidor Go antes de tentar criar, evitando erro 500 de chave duplicada
    if (!token) {
      const remoteInstances = await whatsappClient.fetchInstances(selectedNode).catch(() => []);
      const remoteMatch = remoteInstances.find((i) => i.name === instanceName);
      if (remoteMatch?.Auth?.token) {
        token = remoteMatch.Auth.token;
      }
    }

    if (!token) {
      try {
        const created = await whatsappClient.createInstance(instanceName, selectedNode);
        token = created.Auth?.token ?? created.instance?.token;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("409") && !msg.includes("already exists") && !msg.includes("23505")) {
          throw err;
        }
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

    // Verifica estado atual; se já estiver conectado, retorna imediatamente sem tentar novo pareamento
    const currentState = await whatsappClient
      .getConnectionState(instanceName, token, selectedNode)
      .catch(() => null);

    if (currentState && mapApiConnectionToStatus(currentState) === "connected") {
      const phone = extractPhoneFromJid(currentState.ownerJid) || null;
      const saved = await saveInstanceRecord(db, gabineteId, instanceName, {
        instance_token: token,
        status: "connected",
        phone_number: phone,
        qr_code: null,
        pairing_code: null,
        last_connected_at: new Date().toISOString(),
      });
      if (saved.error) {
        throw new Error(`Erro ao salvar instância WhatsApp no banco: ${saved.error}`);
      }

      return NextResponse.json({
        instanceName,
        status: "connected",
        phoneNumber: phone,
        qrCodeBase64: null,
        pairingCode: null,
      });
    }

    let connectData: Awaited<ReturnType<typeof whatsappClient.connectInstance>> = {};
    try {
      connectData = await whatsappClient.connectInstance(
        instanceName,
        token,
        phoneNumber,
        selectedNode
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (
        msg.includes("409") ||
        msg.includes("already connected") ||
        msg.includes("connection in progress") ||
        msg.includes("conflito")
      ) {
        // Consulta o estado real e atualiza
        const recheck = await whatsappClient
          .getConnectionState(instanceName, token, selectedNode)
          .catch(() => null);
        const isNowConnected = Boolean(recheck && mapApiConnectionToStatus(recheck) === "connected");
        const phone = extractPhoneFromJid(recheck?.ownerJid) || null;

        // Se não estiver conectado, tenta resetar a sessão anterior e gerar novo QR
        if (!isNowConnected) {
          await whatsappClient.logoutInstance(instanceName, token, selectedNode).catch(() => null);
          try {
            connectData = await whatsappClient.connectInstance(
              instanceName,
              token,
              phoneNumber,
              selectedNode
            );
          } catch {
            // Se ainda assim persistir em pairing, retorna estado connecting sem erro
            connectData = { connectionStatus: "connecting" };
          }
        } else {
          connectData = { alreadyConnected: true, ownerJid: recheck?.ownerJid || undefined };
        }
      } else {
        throw err;
      }
    }

    const alreadyConnected = Boolean(connectData.alreadyConnected);
    const qrCodeBase64 = alreadyConnected ? null : (connectData.base64 ?? null);
    const pairingCode = alreadyConnected ? null : (connectData.pairingCode ?? null);
    const nextStatus = alreadyConnected ? "connected" : "connecting";
    const ownerPhone = extractPhoneFromJid(connectData.ownerJid) || null;

    const saved = await saveInstanceRecord(db, gabineteId, instanceName, {
      instance_token: token,
      status: nextStatus,
      ...(ownerPhone ? { phone_number: ownerPhone } : {}),
      qr_code: qrCodeBase64,
      pairing_code: pairingCode,
      ...(alreadyConnected ? { last_connected_at: new Date().toISOString() } : {}),
    });

    if (saved.error) {
      throw new Error(`Erro ao salvar instância WhatsApp no banco: ${saved.error}`);
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
