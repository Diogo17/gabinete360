"use client";

import { useState } from "react";
import { QrCode, Send, Smartphone, CheckCircle2, Loader2 } from "lucide-react";

export default function WhatsAppPage() {
  const [gabineteId, setGabineteId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetNumber, setTargetNumber] = useState("");
  const [messageText, setMessageText] = useState("");
  const [instanceToken, setInstanceToken] = useState("");
  const [sendResult, setSendResult] = useState<string | null>(null);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
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
      setInstanceName(data.instanceName);
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
    if (!instanceName) return;
    setSendResult(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName,
          instanceToken: instanceToken || "token",
          number: targetNumber,
          text: messageText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar");
      setSendResult(`Enviada com delay anti-ban de ${data.appliedDelayMs}ms (ID: ${data.messageId})`);
      setMessageText("");
    } catch (err) {
      setSendResult(err instanceof Error ? err.message : "Erro ao enviar");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conexão WhatsApp — Gabinete 360</h1>
        <p className="text-sm text-muted-foreground">
          Conecte o WhatsApp do gabinete via QR Code ou Código de Pareamento com proteção anti-ban.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleConnect} className="space-y-4 rounded-xl border p-5">
          <div className="flex items-center gap-2 font-semibold">
            <QrCode className="h-5 w-5" />
            <span>1. Conectar Instância</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">ID do Gabinete (UUID)</label>
            <input
              type="text"
              required
              placeholder="00000000-0000-0000-0000-000000000000"
              value={gabineteId}
              onChange={(e) => setGabineteId(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Telefone (opcional, para Pairing Code)</label>
            <input
              type="text"
              placeholder="5511999999999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            Gerar QR Code / Pareamento
          </button>

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

          {status === "connected" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Conectado ({instanceName})
            </div>
          )}
        </form>

        <form onSubmit={handleSend} className="space-y-4 rounded-xl border p-5">
          <div className="flex items-center gap-2 font-semibold">
            <Send className="h-5 w-5" />
            <span>2. Teste de Envio Anti-Ban</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Token da Instância (JWT)</label>
            <input
              type="text"
              placeholder="Bearer token da instância"
              value={instanceToken}
              onChange={(e) => setInstanceToken(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Número Destino</label>
            <input
              type="text"
              required
              placeholder="5511999999999"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Mensagem</label>
            <textarea
              rows={3}
              required
              placeholder="Olá! Como o gabinete pode ajudar?"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!instanceName}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Enviar com Presença + Delay
          </button>

          {sendResult && <p className="text-xs text-muted-foreground">{sendResult}</p>}
        </form>
      </div>
    </div>
  );
}
