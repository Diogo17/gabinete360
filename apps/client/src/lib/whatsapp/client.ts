/**
 * Cliente HTTP para comunicação server-side com o microserviço code-chat-br/whatsapp-api-go (v3.7.0) no Fly.io Sprites.
 */

export interface WhatsAppNodeConfig {
  baseUrl: string;
  globalToken: string;
}

const DEFAULT_NODE: WhatsAppNodeConfig = {
  baseUrl: process.env.WHATSAPP_API_URL || "https://gabinete-360-whatsapp-b6xo7.sprites.app",
  globalToken: process.env.WHATSAPP_API_GLOBAL_TOKEN || "gab360_global_tok3n_2026_prod",
};

/**
 * Resolve o nó WhatsApp ativo a partir de public.whatsapp_nodes, com fallback para variáveis de ambiente.
 * Evita dependência de FK node_id em whatsapp_instances.
 */
export async function resolveActiveWhatsAppNode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any } | null
): Promise<WhatsAppNodeConfig> {
  if (supabase) {
    try {
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
    } catch {
      // Tabela whatsapp_nodes pode estar bloqueada por RLS para usuário comum; usa fallback do servidor.
    }
  }

  return DEFAULT_NODE;
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
    if ((response!.status >= 502 && response!.status <= 504) || isHtml) {
      throw new Error(
        `Servidor WhatsApp temporariamente indisponível (${response!.status}). Aguarde alguns segundos e tente novamente.`
      );
    }
    throw new Error(`WhatsApp API error (${response!.status}): ${errorText}`);
  }

  if (response!.status === 204) {
    return {} as T;
  }

  return response!.json() as Promise<T>;
}

export interface WhatsAppConnectionStateResponse {
  state?: string;
  statusReason?: number;
  instanceName?: string;
  connectionStatus?: string;
  connected?: boolean;
  loggedIn?: boolean;
  ownerJid?: string | null;
  instance?: { state?: string };
}

export interface WhatsAppInstanceListItem {
  id: number;
  name: string;
  status: string;
  connectionStatus: string;
  ownerJid: string | null;
  profilePicUrl: string | null;
  Auth?: { id: number; token: string } | null;
  Webhook?: { id: number; url: string; enabled: boolean } | null;
}

export interface WhatsAppApiMessageRecord {
  id: number;
  keyId: string;
  keyRemoteJid: string | null;
  keyFromMe: boolean;
  pushName: string | null;
  messageType: string;
  content: Record<string, unknown> | null;
  messageTimestamp: number;
  isGroup: boolean | null;
}

export function mapApiConnectionToStatus(
  stateRes: WhatsAppConnectionStateResponse
): "connected" | "connecting" | "disconnected" {
  if (
    (stateRes.connected && stateRes.loggedIn) ||
    stateRes.state === "open" ||
    stateRes.connectionStatus === "online" ||
    stateRes.instance?.state === "open"
  ) {
    return "connected";
  }

  const connectingStates = new Set([
    "connecting",
    "qrcode",
    "pairing_code",
    "pairing",
    "reconnecting",
  ]);
  if (
    connectingStates.has(stateRes.state || "") ||
    connectingStates.has(stateRes.connectionStatus || "")
  ) {
    return "connecting";
  }

  return "disconnected";
}

export function extractPhoneFromJid(jid: string | null | undefined): string {
  if (!jid) return "";
  const userPart = (jid.split("@")[0] ?? "").split(":")[0] ?? "";
  return userPart.replace(/\D/g, "") || jid.replace(/@.*/, "");
}

export function extractTextFromApiContent(
  messageType: string | undefined,
  content: Record<string, unknown> | null | undefined
): string {
  if (!content) {
    return messageType && messageType !== "extendedTextMessage" && messageType !== "text"
      ? `[${messageType}]`
      : "";
  }
  const text =
    (typeof content.text === "string" && content.text) ||
    (typeof content.conversation === "string" && content.conversation) ||
    (typeof content.caption === "string" && content.caption) ||
    (typeof (content.extendedTextMessage as Record<string, unknown> | undefined)?.text === "string" &&
      ((content.extendedTextMessage as Record<string, unknown>).text as string)) ||
    (typeof (content.imageMessage as Record<string, unknown> | undefined)?.caption === "string" &&
      ((content.imageMessage as Record<string, unknown>).caption as string)) ||
    (typeof (content.documentMessage as Record<string, unknown> | undefined)?.caption === "string" &&
      ((content.documentMessage as Record<string, unknown>).caption as string));

  if (text) return text;
  if (messageType?.includes("audio")) return "[Áudio]";
  if (messageType?.includes("image")) return "[Imagem]";
  if (messageType?.includes("video")) return "[Vídeo]";
  if (messageType?.includes("document")) return "[Documento]";
  if (messageType?.includes("sticker")) return "[Figurinha]";
  return messageType ? `[${messageType}]` : "";
}

export const whatsappClient = {
  health(node?: WhatsAppNodeConfig) {
    return whatsappFetch<{ status: string }>("/health", { method: "GET", node });
  },

  ready(node?: WhatsAppNodeConfig) {
    return whatsappFetch<{ status: string }>("/ready", { method: "GET", node });
  },

  fetchInstances(node?: WhatsAppNodeConfig) {
    return whatsappFetch<WhatsAppInstanceListItem[]>("/instance/fetchInstances", {
      method: "GET",
      node,
    });
  },

  createInstance(instanceName: string, node?: WhatsAppNodeConfig) {
    return whatsappFetch<{
      id?: number;
      name?: string;
      Auth?: { id: number; token: string };
      instance?: { instanceName: string; token: string; status: string };
    }>("/instance/create", {
      method: "POST",
      node,
      body: JSON.stringify({ instanceName }),
    });
  },

  setWebhook(
    instanceName: string,
    instanceToken: string,
    webhookUrl: string,
    node?: WhatsAppNodeConfig
  ) {
    return whatsappFetch<{ id: number; url: string; enabled: boolean }>(
      `/webhook/set/${encodeURIComponent(instanceName)}`,
      {
        method: "PUT",
        instanceToken,
        node,
        body: JSON.stringify({
          enabled: true,
          url: webhookUrl,
          events: {
            connectionUpdated: true,
            qrcodeUpdated: true,
            messagesUpsert: true,
            messagesUpdated: true,
            sendMessage: true,
            contactsUpsert: true,
            contactsUpdated: true,
            chatsUpdated: true,
          },
        }),
      }
    );
  },

  async connectInstance(
    instanceName: string,
    instanceToken: string,
    phoneNumber?: string,
    node?: WhatsAppNodeConfig
  ): Promise<{
    base64?: string;
    code?: string;
    pairingCode?: string;
    alreadyConnected?: boolean;
    connectionStatus?: string;
    ownerJid?: string | null;
  }> {
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const res = await whatsappFetch<{ code?: string }>(
        `/instance/connect/${encodeURIComponent(instanceName)}/code/${encodeURIComponent(cleanPhone)}`,
        {
          method: "GET",
          instanceToken,
          node,
        }
      );
      return { pairingCode: res.code, code: res.code };
    }

    return whatsappFetch<{
      count?: number;
      base64?: string;
      code?: string;
      connectionStatus?: string;
      alreadyConnected?: boolean;
      alreadyConnecting?: boolean;
      ownerJid?: string | null;
    }>(`/instance/connect/${encodeURIComponent(instanceName)}`, {
      method: "GET",
      instanceToken,
      node,
    });
  },

  getConnectionState(instanceName: string, instanceToken: string, node?: WhatsAppNodeConfig) {
    return whatsappFetch<WhatsAppConnectionStateResponse>(
      `/instance/connectionState/${encodeURIComponent(instanceName)}`,
      { method: "GET", instanceToken, node }
    );
  },

  logoutInstance(instanceName: string, instanceToken: string, node?: WhatsAppNodeConfig) {
    return whatsappFetch<{
      instanceName: string;
      state: string;
      connectionStatus: string;
      message: string;
    }>(`/instance/logout/${encodeURIComponent(instanceName)}`, {
      method: "DELETE",
      instanceToken,
      node,
    });
  },

  findMessages(
    instanceName: string,
    instanceToken: string,
    params: { page?: number; offset?: number; remoteJid?: string } = {},
    node?: WhatsAppNodeConfig
  ) {
    return whatsappFetch<{
      messages: {
        total: number;
        pages: number;
        currentPage: number;
        records: WhatsAppApiMessageRecord[];
      };
    }>(`/chat/findMessages/${encodeURIComponent(instanceName)}`, {
      method: "POST",
      instanceToken,
      node,
      body: JSON.stringify({
        where: params.remoteJid ? { keyRemoteJid: params.remoteJid } : {},
        page: params.page ?? 1,
        offset: params.offset ?? 50,
      }),
    });
  },

  sendText(
    instanceName: string,
    instanceToken: string,
    params: { number: string; text: string; delayMs?: number },
    node?: WhatsAppNodeConfig
  ) {
    return whatsappFetch<{
      id?: number;
      keyId?: string;
      keyRemoteJid?: string | null;
      key?: { id: string };
    }>(`/message/sendText/${encodeURIComponent(instanceName)}`, {
      method: "POST",
      instanceToken,
      node,
      body: JSON.stringify({
        number: params.number,
        textMessage: {
          text: params.text,
        },
        options: {
          delay: params.delayMs ?? 1200,
          presence: "composing",
        },
      }),
    });
  },

  sendMedia(
    instanceName: string,
    instanceToken: string,
    params: {
      number: string;
      mediatype: "image" | "audio" | "document";
      media: string;
      caption?: string;
      fileName?: string;
      delayMs?: number;
    },
    node?: WhatsAppNodeConfig
  ) {
    return whatsappFetch<{
      id?: number;
      keyId?: string;
      keyRemoteJid?: string | null;
      key?: { id: string };
    }>(`/message/sendMedia/${encodeURIComponent(instanceName)}`, {
      method: "POST",
      instanceToken,
      node,
      body: JSON.stringify({
        number: params.number,
        mediaMessage: {
          mediatype: params.mediatype,
          media: params.media,
          ...(params.caption ? { caption: params.caption } : {}),
          ...(params.fileName ? { fileName: params.fileName } : {}),
        },
        options: {
          delay: params.delayMs ?? 1200,
          presence: params.mediatype === "audio" ? "recording" : "composing",
        },
      }),
    });
  },
};
