/**
 * Cliente HTTP para comunicação server-side com o microserviço whatsapp-api-go no Fly.io Sprites.
 */

export interface WhatsAppNodeConfig {
  baseUrl: string;
  globalToken: string;
}

const DEFAULT_NODE: WhatsAppNodeConfig = {
  baseUrl: process.env.WHATSAPP_API_URL || "",
  globalToken: process.env.WHATSAPP_API_GLOBAL_TOKEN || "",
};

/**
 * Resolve o nó WhatsApp ativo a partir de public.whatsapp_nodes, com fallback para variáveis de ambiente.
 * Evita dependência de FK node_id em whatsapp_instances.
 */
export async function resolveActiveWhatsAppNode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any } | null
): Promise<WhatsAppNodeConfig | undefined> {
  if (supabase) {
    const { data: nodeRow } = await supabase
      .from("whatsapp_nodes")
      .select("base_url, global_token")
      .eq("status", "active")
      .order("active_instances", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nodeRow?.base_url && nodeRow?.global_token) {
      return { baseUrl: nodeRow.base_url, globalToken: nodeRow.global_token };
    }
  }

  if (DEFAULT_NODE.baseUrl && DEFAULT_NODE.globalToken) {
    return DEFAULT_NODE;
  }

  return undefined;
}

interface RequestOptions extends RequestInit {
  instanceToken?: string;
  node?: WhatsAppNodeConfig;
}

async function whatsappFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { instanceToken, node = DEFAULT_NODE, headers, ...rest } = options;

  if (!node.baseUrl) {
    throw new Error("Servidor WhatsApp não configurado (base_url ausente).");
  }

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: node.globalToken,
    ...(instanceToken ? { Authorization: `Bearer ${instanceToken}` } : {}),
  };

  let response: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    response = await fetch(`${node.baseUrl}${path}`, {
      ...rest,
      headers: {
        ...authHeaders,
        ...(headers as Record<string, string>),
      },
      cache: "no-store",
    });

    if (response.status !== 502 && response.status !== 503 && response.status !== 504) {
      break;
    }

    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!response!.ok) {
    const errorText = await response!.text();
    const isHtml = errorText.trimStart().startsWith("<");
    if (response!.status >= 502 && response!.status <= 504 || isHtml) {
      throw new Error(
        `Servidor WhatsApp temporariamente indisponível (${response!.status}). Aguarde alguns segundos e tente novamente.`
      );
    }
    throw new Error(`WhatsApp API error (${response!.status}): ${errorText}`);
  }

  return response!.json() as Promise<T>;
}

export const whatsappClient = {
  createInstance(instanceName: string, webhookUrl?: string, node?: WhatsAppNodeConfig) {
    return whatsappFetch<{
      id?: number;
      name?: string;
      Auth?: { id: number; token: string };
      instance?: { instanceName: string; token: string; status: string };
      qrcode?: { base64?: string; code?: string };
    }>("/instance/create", {
      method: "POST",
      node,
      body: JSON.stringify({
        instanceName,
        ...(webhookUrl
          ? {
              webhook: {
                url: webhookUrl,
                enabled: true,
                events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
              },
            }
          : {}),
      }),
    });
  },

  connectInstance(
    instanceName: string,
    instanceToken: string,
    phoneNumber?: string,
    node?: WhatsAppNodeConfig
  ) {
    const query = phoneNumber ? `?number=${encodeURIComponent(phoneNumber)}` : "";
    return whatsappFetch<{
      base64?: string;
      code?: string;
      pairingCode?: string;
    }>(`/instance/connect/${encodeURIComponent(instanceName)}${query}`, {
      method: "GET",
      instanceToken,
      node,
    });
  },

  getConnectionState(instanceName: string, instanceToken: string, node?: WhatsAppNodeConfig) {
    return whatsappFetch<{ instance: { state: string } }>(
      `/instance/connectionState/${encodeURIComponent(instanceName)}`,
      { method: "GET", instanceToken, node }
    );
  },

  sendText(
    instanceName: string,
    instanceToken: string,
    params: { number: string; text: string; delayMs?: number },
    node?: WhatsAppNodeConfig
  ) {
    return whatsappFetch<{ key: { id: string } }>(
      `/message/sendText/${encodeURIComponent(instanceName)}`,
      {
        method: "POST",
        instanceToken,
        node,
        body: JSON.stringify({
          number: params.number,
          text: params.text,
          options: {
            delay: params.delayMs ?? 2500,
            presence: "composing",
          },
        }),
      }
    );
  },

  sendMedia(
    instanceName: string,
    instanceToken: string,
    params: {
      number: string;
      mediatype: "image" | "audio" | "document";
      media: string;
      caption?: string;
      delayMs?: number;
    },
    node?: WhatsAppNodeConfig
  ) {
    return whatsappFetch<{ key: { id: string } }>(
      `/message/sendMedia/${encodeURIComponent(instanceName)}`,
      {
        method: "POST",
        instanceToken,
        node,
        body: JSON.stringify({
          number: params.number,
          mediatype: params.mediatype,
          media: params.media,
          ...(params.caption ? { caption: params.caption } : {}),
          options: {
            delay: params.delayMs ?? 2500,
            presence: params.mediatype === "audio" ? "recording" : "composing",
          },
        }),
      }
    );
  },
};
