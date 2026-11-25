/**
 * Cliente HTTP para comunicação server-side com o microserviço whatsapp-api-go no Fly.io Sprites.
 */

export interface WhatsAppNodeConfig {
  baseUrl: string;
  globalToken: string;
}

const DEFAULT_NODE: WhatsAppNodeConfig = {
  baseUrl:
    process.env.WHATSAPP_API_URL || "https://gabinete-360-whatsapp-b6xo7.sprites.app",
  globalToken:
    process.env.WHATSAPP_API_GLOBAL_TOKEN || "gab360_global_tok3n_2026_prod",
};

interface RequestOptions extends RequestInit {
  instanceToken?: string;
  node?: WhatsAppNodeConfig;
}

async function whatsappFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { instanceToken, node = DEFAULT_NODE, headers, ...rest } = options;

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: node.globalToken,
    ...(instanceToken ? { Authorization: `Bearer ${instanceToken}` } : {}),
  };

  const response = await fetch(`${node.baseUrl}${path}`, {
    ...rest,
    headers: {
      ...authHeaders,
      ...(headers as Record<string, string>),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
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
};
