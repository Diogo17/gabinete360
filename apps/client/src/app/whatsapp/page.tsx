"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  QrCode,
  Send,
  Smartphone,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Wifi,
  Plus,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/lib/tenant/context";
import { ClientShell } from "@/components/client-shell";

interface Contact {
  id: string;
  phone: string;
  name: string | null;
}

interface Message {
  id: string;
  contact_id: string;
  direction: "inbound" | "outbound";
  content: string | null;
  created_at: string;
}

interface PingInfo {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

export default function WhatsAppPage() {
  const { organization } = useOrganization();
  const [gabineteId, setGabineteId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<PingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");

  const selectedContactRef = useRef<Contact | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadInbox = useCallback(async (targetGabineteId: string, syncRemote = false) => {
    setSyncing(true);
    try {
      const res = await fetch(
        `/api/whatsapp/inbox?gabineteId=${encodeURIComponent(targetGabineteId)}${
          syncRemote ? "&sync=1" : ""
        }`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.contacts)) {
        setContacts(data.contacts);
        if (selectedContactRef.current) {
          const updated = data.contacts.find(
            (c: Contact) => c.id === selectedContactRef.current?.id
          );
          if (updated) setSelectedContact(updated);
        }
      }
      if (selectedContactRef.current && Array.isArray(data.messages)) {
        const contactMsgs = (data.messages as Message[])
          .filter((m) => m.contact_id === selectedContactRef.current?.id)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(contactMsgs);
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  const checkStatus = useCallback(
    async (targetGabineteId: string, withPing = false) => {
      if (withPing) setPinging(true);
      try {
        const res = await fetch(
          `/api/whatsapp/instance?gabineteId=${encodeURIComponent(targetGabineteId)}${
            withPing ? "&ping=1" : ""
          }`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.ping) setPingResult(data.ping as PingInfo);
        if (data.phoneNumber) setConnectedPhone(data.phoneNumber);
        if (data.status === "connected") {
          setStatus((prev) => {
            if (prev !== "connected") {
              loadInbox(targetGabineteId, true);
            }
            return "connected";
          });
          setQrCode(null);
          setPairingCode(null);
        } else if (data.status === "connecting") {
          setStatus("connecting");
          if (data.qrCode) setQrCode(data.qrCode);
          if (data.pairingCode) setPairingCode(data.pairingCode);
        } else {
          setStatus("disconnected");
        }
      } catch {
        // Ignora erro transitório de polling
      } finally {
        if (withPing) setPinging(false);
      }
    },
    [loadInbox]
  );

  // Resolve gabineteId (do contexto ou da membership) e carrega estado inicial + Realtime
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function init() {
      let gabId = organization?.id ?? null;
      if (!gabId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        gabId = (user.user_metadata?.gabinete_id as string | undefined) || null;
        if (!gabId) {
          const { data: membership } = await supabase
            .from("memberships")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          gabId = membership?.organization_id ?? null;
        }
      }

      if (!active || !gabId) return;
      setGabineteId(gabId);

      await checkStatus(gabId, true);
      await loadInbox(gabId, true);
    }

    init();

    const channel = supabase
      .channel("whatsapp-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_instances" },
        (payload) => {
          const row = payload.new as {
            gabinete_id?: string;
            status?: string;
            phone_number?: string | null;
            qr_code?: string | null;
            pairing_code?: string | null;
          };
          if (row.gabinete_id && row.gabinete_id !== gabineteId) return;
          if (row.phone_number) setConnectedPhone(row.phone_number);
          if (row.status) {
            setStatus(row.status as "disconnected" | "connecting" | "connected");
          }
          if (row.qr_code !== undefined) setQrCode(row.qr_code);
          if (row.pairing_code !== undefined) setPairingCode(row.pairing_code);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_contacts" },
        (payload) => {
          const c = payload.new as Contact & { gabinete_id?: string };
          if (!c?.id) return;
          setContacts((prev) => {
            const exists = prev.some((item) => item.id === c.id);
            const next = exists
              ? prev.map((item) => (item.id === c.id ? { id: c.id, phone: c.phone, name: c.name } : item))
              : [{ id: c.id, phone: c.phone, name: c.name }, ...prev];
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "whatsapp_messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (selectedContactRef.current?.id === msg.contact_id) {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [organization?.id, gabineteId, checkStatus, loadInbox]);

  // Polling frequente enquanto estiver pareando (2.5s) e heartbeat leve quando conectado (25s)
  useEffect(() => {
    if (!gabineteId || status === "disconnected") return;
    const intervalMs = status === "connecting" ? 2500 : 25000;
    const timer = setInterval(() => {
      checkStatus(gabineteId, false);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [gabineteId, status, checkStatus]);

  // Carrega mensagens ao selecionar uma conversa
  useEffect(() => {
    if (!selectedContact || selectedContact.id.startsWith("temp-")) {
      if (selectedContact?.id.startsWith("temp-")) setMessages([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("whatsapp_messages")
      .select("id, contact_id, direction, content, created_at")
      .eq("contact_id", selectedContact.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });
  }, [selectedContact]);

  async function handleConnect(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!gabineteId) {
      setError("Faça login para conectar o WhatsApp do seu gabinete.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gabineteId,
          ...(phoneNumber.trim() ? { phoneNumber: phoneNumber.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao conectar");
      if (data.status === "connected") {
        setStatus("connected");
        setConnectedPhone(data.phoneNumber || null);
        setQrCode(null);
        setPairingCode(null);
        await loadInbox(gabineteId, true);
      } else {
        setQrCode(data.qrCodeBase64 || null);
        setPairingCode(data.pairingCode || null);
        setStatus("connecting");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartNewChat(e: React.FormEvent) {
    e.preventDefault();
    const digits = newChatPhone.replace(/\D/g, "");
    if (digits.length < 10) return;
    const formatted = digits.startsWith("55") ? digits : `55${digits}`;
    const existing = contacts.find((c) => c.phone.replace(/\D/g, "") === formatted);
    if (existing) {
      setSelectedContact(existing);
    } else {
      const tempContact: Contact = {
        id: `temp-${formatted}`,
        phone: formatted,
        name: newChatName.trim() || null,
      };
      setContacts((prev) => [tempContact, ...prev]);
      setSelectedContact(tempContact);
    }
    setNewChatPhone("");
    setNewChatName("");
    setShowNewChat(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!gabineteId || !selectedContact || !messageText.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gabineteId,
          number: selectedContact.phone,
          contactName: selectedContact.name || undefined,
          text: messageText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao enviar mensagem.");
      }
      setMessageText("");

      if (data.contact?.id && selectedContact.id.startsWith("temp-")) {
        const realContact = data.contact as Contact;
        setContacts((prev) =>
          prev.map((c) => (c.id === selectedContact.id ? realContact : c))
        );
        setSelectedContact(realContact);
      }
      if (data.savedMessage) {
        const saved = data.savedMessage as Message;
        setMessages((prev) =>
          prev.some((m) => m.id === saved.id) ? prev : [...prev, saved]
        );
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "WhatsApp Inbox", current: true },
      ]}
      topbarActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!gabineteId || pinging}
            onClick={() => gabineteId && checkStatus(gabineteId, true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
          >
            {pinging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5 text-green" />}
            Testar Ping
          </button>
          <button
            type="button"
            disabled={!gabineteId || syncing}
            onClick={() => gabineteId && loadInbox(gabineteId, true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-paper disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
              Central WhatsApp — Gabinete 360°
            </h1>
            <p className="text-xs text-muted">
              Atendimento em tempo real com conexão isolada por gabinete, sincronização de conversas e proteção anti-ban.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pingResult && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  pingResult.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {pingResult.ok ? `API OK (${pingResult.latencyMs}ms)` : "API Offline"}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "connected"
                    ? "bg-emerald-500"
                    : status === "connecting"
                    ? "bg-amber-500"
                    : "bg-zinc-400"
                }`}
              />
              {status === "connected"
                ? `Conectado${connectedPhone ? ` (${connectedPhone})` : ""}`
                : status === "connecting"
                ? "Aguardando Pareamento"
                : "Desconectado"}
            </span>
          </div>
        </div>

        {status !== "connected" && (
          <form onSubmit={handleConnect} className="space-y-4 rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <QrCode className="h-5 w-5 text-green" />
                <span>Conectar WhatsApp do Gabinete</span>
              </div>
              {status === "connecting" && (
                <button
                  type="button"
                  onClick={() => handleConnect()}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green hover:underline"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Atualizar QR Code
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Telefone opcional para código (ex.: 5538999999999)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                {status === "connecting" ? "Gerar Novo QR / Código" : "Conectar WhatsApp"}
              </button>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            {qrCode && (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-line bg-paper/50 p-4">
                <img src={qrCode} alt="WhatsApp QR Code" className="h-52 w-52 rounded bg-white p-1" />
                <span className="text-xs font-medium text-ink">
                  Escaneie em WhatsApp &gt; Dispositivos conectados &gt; Conectar dispositivo
                </span>
                <span className="text-[11px] text-muted">
                  Mantenha esta tela aberta — o status muda para Conectado automaticamente após a leitura.
                </span>
              </div>
            )}

            {pairingCode && (
              <div className="rounded-lg border border-line bg-paper p-3 text-center">
                <p className="text-xs text-muted">Código de Pareamento:</p>
                <p className="font-mono text-xl font-bold tracking-widest text-ink">{pairingCode}</p>
              </div>
            )}
          </form>
        )}

        {status === "connected" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              WhatsApp conectado{connectedPhone ? ` (${connectedPhone})` : ""} e pronto para atendimento.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewChat((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-600/30 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Nova conversa
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!gabineteId) return;
                  await fetch(`/api/whatsapp/instance?gabineteId=${encodeURIComponent(gabineteId)}`, {
                    method: "DELETE",
                  });
                  setStatus("disconnected");
                  setConnectedPhone(null);
                  setQrCode(null);
                  setPairingCode(null);
                }}
                className="rounded-md border border-red-500/30 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Desconectar
              </button>
            </div>
          </div>
        )}

        {showNewChat && (
          <form
            onSubmit={handleStartNewChat}
            className="flex flex-col gap-2 rounded-xl border border-line bg-white p-4 sm:flex-row"
          >
            <input
              type="text"
              placeholder="WhatsApp com DDD (ex.: 38999999999)"
              value={newChatPhone}
              onChange={(e) => setNewChatPhone(e.target.value)}
              className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Nome do cidadão (opcional)"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Iniciar chat
            </button>
          </form>
        )}

        <div className="grid h-[520px] grid-cols-1 overflow-hidden rounded-xl border border-line bg-white md:grid-cols-3">
          <div className="overflow-y-auto border-r border-line">
            <div className="flex items-center justify-between border-b border-line p-3 text-xs font-semibold uppercase text-muted">
              <span>Conversas ({contacts.length})</span>
              {syncing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </div>
            {contacts.length === 0 ? (
              <div className="p-4 text-xs text-muted">
                Nenhuma conversa sincronizada ainda. Clique em &ldquo;Sincronizar&rdquo; ou inicie uma &ldquo;Nova conversa&rdquo;.
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedContact(c)}
                  className={`flex w-full items-center gap-3 border-b border-line p-3 text-left text-sm hover:bg-paper/70 ${
                    selectedContact?.id === c.id ? "bg-mint/30" : ""
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-green" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{c.name || c.phone}</p>
                    <p className="truncate text-xs text-muted">{c.phone}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="flex flex-col md:col-span-2">
            <div className="border-b border-line p-3 text-sm font-semibold text-ink">
              {selectedContact
                ? `${selectedContact.name || selectedContact.phone} (${selectedContact.phone})`
                : "Selecione ou inicie uma conversa"}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto bg-paper/40 p-4">
              {selectedContact && messages.length === 0 && (
                <p className="text-center text-xs text-muted">
                  Nenhuma mensagem registrada nesta conversa ainda.
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-xs ${
                    m.direction === "outbound"
                      ? "ml-auto bg-emerald-600 text-white"
                      : "border border-line bg-white text-ink"
                  }`}
                >
                  <div>{m.content}</div>
                  <div
                    className={`mt-1 text-[10px] ${
                      m.direction === "outbound" ? "text-emerald-100" : "text-muted"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {sendError && (
              <div className="border-t border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                {sendError}
              </div>
            )}
            {selectedContact && (
              <form onSubmit={handleSend} className="flex gap-2 border-t border-line bg-white p-3">
                <input
                  type="text"
                  placeholder="Digite sua resposta..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || status !== "connected"}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ClientShell>
  );
}
