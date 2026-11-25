"use client";

import { useEffect, useState } from "react";
import { QrCode, Send, Smartphone, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function WhatsAppPage() {
  const [gabineteId, setGabineteId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const gabId = (user?.user_metadata?.gabinete_id as string | undefined) || user?.id || null;
      setGabineteId(gabId);
      if (!gabId) return;

      const { data: inst } = await supabase
        .from("whatsapp_instances")
        .select("status, qr_code, pairing_code")
        .eq("gabinete_id", gabId)
        .maybeSingle();

      if (inst) {
        setStatus(inst.status as "disconnected" | "connecting" | "connected");
        setQrCode(inst.qr_code);
        setPairingCode(inst.pairing_code);
      }

      const { data: contactList } = await supabase
        .from("whatsapp_contacts")
        .select("id, phone, name")
        .eq("gabinete_id", gabId)
        .order("updated_at", { ascending: false });

      if (contactList) setContacts(contactList);
    }

    init();

    const channel = supabase
      .channel("whatsapp-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_instances" }, (payload) => {
        const row = payload.new as { status?: string; qr_code?: string | null; pairing_code?: string | null };
        if (row.status) setStatus(row.status as "disconnected" | "connecting" | "connected");
        if (row.qr_code !== undefined) setQrCode(row.qr_code);
        if (row.pairing_code !== undefined) setPairingCode(row.pairing_code);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "whatsapp_messages" }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => [...prev, msg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!gabineteId || status !== "connecting") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/whatsapp/instance?gabineteId=${encodeURIComponent(gabineteId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "connected") {
            setStatus("connected");
            setQrCode(null);
            setPairingCode(null);
          }
        }
      } catch {
        // ignore transient polling errors
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [gabineteId, status]);

  useEffect(() => {
    if (!selectedContact) return;
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

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
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
      setQrCode(data.qrCodeBase64);
      setPairingCode(data.pairingCode);
      setStatus("connecting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!gabineteId || !selectedContact || !messageText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gabineteId,
          number: selectedContact.phone,
          text: messageText,
        }),
      });
      if (res.ok) setMessageText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central WhatsApp — Gabinete 360</h1>
          <p className="text-sm text-muted-foreground">
            Atendimento em tempo real com conexão isolada por gabinete e proteção anti-ban.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "connected" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-500" : "bg-zinc-400"
            }`}
          />
          {status === "connected" ? "Conectado" : status === "connecting" ? "Aguardando QR Code" : "Desconectado"}
        </span>
      </div>

      {status !== "connected" && (
        <form onSubmit={handleConnect} className="space-y-4 rounded-xl border p-5">
          <div className="flex items-center gap-2 font-semibold">
            <QrCode className="h-5 w-5" />
            <span>Conectar WhatsApp do Gabinete</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Telefone (opcional, para Código de Pareamento: 5511999999999)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              Conectar WhatsApp
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {qrCode && (
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
              <img src={qrCode} alt="WhatsApp QR Code" className="h-48 w-48 rounded" />
              <span className="text-xs text-muted-foreground">
                Escaneie no WhatsApp &gt; Aparelhos conectados
              </span>
            </div>
          )}

          {pairingCode && (
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Código de Pareamento:</p>
              <p className="font-mono text-xl font-bold tracking-widest">{pairingCode}</p>
            </div>
          )}
        </form>
      )}

      {status === "connected" && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> WhatsApp conectado e pronto para atendimento.
        </div>
      )}

      <div className="grid h-[500px] grid-cols-1 overflow-hidden rounded-xl border md:grid-cols-3">
        <div className="overflow-y-auto border-r">
          <div className="border-b p-3 text-xs font-semibold uppercase text-muted-foreground">
            Conversas ({contacts.length})
          </div>
          {contacts.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">Nenhuma conversa recebida ainda.</div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedContact(c)}
                className={`flex w-full items-center gap-3 border-b p-3 text-left text-sm hover:bg-muted/50 ${
                  selectedContact?.id === c.id ? "bg-muted" : ""
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name || c.phone}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex flex-col md:col-span-2">
          <div className="border-b p-3 text-sm font-semibold">
            {selectedContact ? selectedContact.name || selectedContact.phone : "Selecione uma conversa"}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  m.direction === "outbound"
                    ? "ml-auto bg-emerald-600 text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          {selectedContact && (
            <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
              <input
                type="text"
                placeholder="Digite sua resposta..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
