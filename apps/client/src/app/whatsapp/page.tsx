"use client";

import React, { useState } from "react";
import { ClientShell } from "../../components/client-shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  FilterChip,
  Button,
  Avatar,
  Input,
  Modal,
} from "@gabinete360/ui";
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  CheckCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FileCheck2,
  AlertCircle,
  Radio,
} from "lucide-react";

interface ChatConversation {
  id: string;
  citizen_name: string;
  phone: string;
  neighborhood: string;
  protocol?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: "open" | "converted" | "waiting";
  messages: {
    id: string;
    sender: "citizen" | "agent";
    text: string;
    time: string;
  }[];
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "chat-01",
    citizen_name: "Dona Maria de Lourdes",
    phone: "+55 13 98877-6655",
    neighborhood: "Jardim das Flores",
    protocol: "#AT-0248",
    last_message: "Bom dia gabinete, o caminhão da coleta passou hoje?",
    last_message_time: "10:14",
    unread_count: 1,
    status: "open",
    messages: [
      { id: "m-1", sender: "citizen", text: "Bom dia, gostaria de agradecer a resposta do ofício sobre o posto.", time: "10:10" },
      { id: "m-2", sender: "agent", text: "Bom dia, Dona Maria! O mandato está sempre à disposição do Jardim das Flores.", time: "10:12" },
      { id: "m-3", sender: "citizen", text: "Bom dia gabinete, o caminhão da coleta passou hoje?", time: "10:14" },
    ],
  },
  {
    id: "chat-02",
    citizen_name: "João Pereira da Silva",
    phone: "+55 13 98765-4321",
    neighborhood: "Vila Mariana",
    protocol: "#AT-0246",
    last_message: "Perfeito, levarei os documentos na quinta-feira.",
    last_message_time: "Ontem",
    unread_count: 0,
    status: "converted",
    messages: [
      { id: "m-4", sender: "agent", text: "Seu protocolo é o #AT-0246. Agendamos seu atendimento presencial.", time: "16:40" },
      { id: "m-5", sender: "citizen", text: "Perfeito, levarei os documentos na quinta-feira.", time: "16:42" },
    ],
  },
  {
    id: "chat-03",
    citizen_name: "Carlos Alberto Rocha",
    phone: "+55 13 97123-4567",
    neighborhood: "Gonzaga",
    last_message: "A calçada da escola precisa de reparo urgente.",
    last_message_time: "09:30",
    unread_count: 2,
    status: "open",
    messages: [
      { id: "m-6", sender: "citizen", text: "A calçada da escola municipal está intransitável para cadeirantes.", time: "09:28" },
      { id: "m-7", sender: "citizen", text: "A calçada da escola precisa de reparo urgente.", time: "09:30" },
    ],
  },
];

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedChat, setSelectedChat] = useState<ChatConversation>(INITIAL_CONVERSATIONS[0]!);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "agent" as const,
      text,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = {
      ...selectedChat,
      last_message: text,
      last_message_time: newMsg.time,
      messages: [...selectedChat.messages, newMsg],
    };

    setSelectedChat(updated);
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setInputText("");
  };

  const handleConvertToDemand = () => {
    const protocolNumber = `#AT-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = {
      ...selectedChat,
      protocol: protocolNumber,
      status: "converted" as const,
    };
    setSelectedChat(updated);
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    
    // Envia mensagem automática no chat informando o protocolo
    handleSendMessage(`🏛️ Olá, ${selectedChat.citizen_name}! Sua solicitação foi formalizada como atendimento oficial do mandato sob o protocolo ${protocolNumber}. Nossa assessoria acompanhará o caso!`);
    showToast(`Atendimento formalizado com sucesso! Protocolo ${protocolNumber} gerado.`);
  };

  const handleSendTemplate = (templateTitle: string, templateBody: string) => {
    handleSendMessage(`[MENSAGEM OFICIAL]: ${templateBody}`);
    setIsTemplateModalOpen(false);
    showToast(`Template "${templateTitle}" disparado com sucesso via WhatsApp Cloud API!`);
  };

  const handleSimulateIncoming = () => {
    const incomingText = "Olá, gostaria de saber como agendo uma reunião com a vereadora para falar do bairro.";
    const newMsg = {
      id: `m-in-${Date.now()}`,
      sender: "citizen" as const,
      text: incomingText,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = {
      ...selectedChat,
      last_message: incomingText,
      last_message_time: newMsg.time,
      unread_count: selectedChat.unread_count + 1,
      messages: [...selectedChat.messages, newMsg],
    };

    setSelectedChat(updated);
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast("Nova mensagem recebida via Webhook do WhatsApp!");
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "WhatsApp Inbox Integrado", current: true },
      ]}
      topbarActions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSimulateIncoming}>
            <Radio className="h-3.5 w-3.5 mr-1 text-green animate-pulse" /> Simular Chegada de Mensagem
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsTemplateModalOpen(true)}>
            <Send className="h-3.5 w-3.5 mr-1" /> Disparar Template Oficial
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Toast Notifier */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border border-green">
            <CheckCheck className="h-4 w-4 text-green" /> {toastMessage}
          </div>
        )}

        {/* Card de Status da Integração Oficial (Meta Cloud API) */}
        <div className="bg-white border border-line rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-mint grid place-items-center text-green">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-ink">
                  WhatsApp Business Platform (Cloud API v20.0)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint text-green border border-green/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-green" /> Conectado &amp; Homologado
                </span>
              </div>
              <div className="text-xs text-muted flex items-center gap-3 mt-0.5">
                <span>Número Oficial: <strong>+55 (13) 3219-9000</strong></span>
                <span>•</span>
                <span>WABA ID: <code>waba_8492048102</code></span>
                <span>•</span>
                <span>Webhook: <strong>Ativo (200 OK)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <Badge variant="green">Sincronização em Tempo Real</Badge>
          </div>
        </div>

        {/* Janela Principal de Mensagens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[620px] border border-line rounded-xl overflow-hidden bg-white shadow-xs">
          {/* Coluna Esquerda: Lista de Conversas */}
          <div className="md:col-span-1 border-r border-line flex flex-col h-full bg-paper/20">
            <div className="p-3 border-b border-line bg-white">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Pesquisar munícipe ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-line rounded text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-line">
              {conversations
                .filter((c) => c.citizen_name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 cursor-pointer hover:bg-paper/50 transition-colors ${
                      selectedChat.id === chat.id ? "bg-mint/40 border-l-4 border-green font-medium" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={chat.citizen_name} size="xs" />
                        <div>
                          <div className="font-semibold text-ink text-xs">{chat.citizen_name}</div>
                          <div className="text-[10px] text-muted">{chat.neighborhood}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted font-mono">{chat.last_message_time}</span>
                    </div>

                    <div className="text-[11px] text-muted mt-1.5 line-clamp-1 truncate">
                      {chat.last_message}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-line/60">
                      {chat.protocol ? (
                        <span className="text-[9px] font-mono font-bold text-green bg-mint px-1.5 py-0.2 rounded">
                          {chat.protocol}
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                          Pendente de protocolo
                        </span>
                      )}
                      <span className="text-[9px] text-muted font-mono">{chat.phone}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Coluna Direita: Janela de Chat */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            {/* Header do Chat */}
            <div className="p-3 border-b border-line flex items-center justify-between bg-paper/30">
              <div className="flex items-center gap-2.5">
                <Avatar name={selectedChat.citizen_name} size="sm" />
                <div>
                  <div className="font-semibold text-ink text-sm flex items-center gap-2">
                    {selectedChat.citizen_name}
                    {selectedChat.protocol && (
                      <Badge variant="green" className="font-mono text-[10px]">
                        {selectedChat.protocol}
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted font-mono flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-muted" /> {selectedChat.phone} · {selectedChat.neighborhood}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs border-green/30 text-green hover:bg-mint"
                  onClick={handleConvertToDemand}
                >
                  <FileCheck2 className="h-3.5 w-3.5 mr-1" />
                  {selectedChat.protocol ? "Atualizar Protocolo" : "Converter em Atendimento #AT"}
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8faf8]">
              {selectedChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "agent" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg text-xs leading-relaxed shadow-xs ${
                      m.sender === "agent"
                        ? "bg-green text-white rounded-br-none"
                        : "bg-white text-ink border border-line rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-muted mt-0.5 px-1 font-mono">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Sugestão Rápida da IA */}
            <div className="px-3 py-1.5 bg-mint/30 border-t border-green/20 flex items-center justify-between text-xs text-green">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="h-3.5 w-3.5 text-green shrink-0" />
                <span className="truncate text-[11px]">
                  <strong>Sugestão da IA:</strong> "Olá, confirmamos o recebimento e abriremos averiguação com a CET."
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage("Olá, confirmamos o recebimento de sua solicitação e já abrimos averiguação com os órgãos competentes. Protocolo em acompanhamento.")}
                className="text-[11px] font-bold text-green hover:underline ml-2 shrink-0"
              >
                Usar Resposta
              </button>
            </div>

            {/* Caixa de Digitação */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-line flex items-center gap-2 bg-white"
            >
              <input
                type="text"
                placeholder="Digite uma mensagem para o munícipe..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 border border-line rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green"
              />
              <Button type="submit" variant="primary" size="sm">
                <Send className="h-3.5 w-3.5 mr-1" /> Enviar
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Disparo de Templates Oficiais Meta */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Disparar Template de Notificação Oficial (WhatsApp HSM)"
      >
        <div className="space-y-4 text-xs">
          <p className="text-muted leading-relaxed">
            Selecione uma mensagem pré-homologada pela Meta para notificar o cidadão diretamente em seu WhatsApp:
          </p>

          <div className="space-y-2.5">
            <div
              onClick={() =>
                handleSendTemplate(
                  "Abertura de Protocolo",
                  `Olá, ${selectedChat.citizen_name}! Seu protocolo de atendimento foi aberto no gabinete sob o número ${selectedChat.protocol || "#AT-0248"}. Acompanhe pelo canal oficial.`
                )
              }
              className="p-3 border border-line hover:border-green rounded-lg cursor-pointer transition-colors bg-paper/20 hover:bg-mint/20 space-y-1"
            >
              <div className="font-bold text-ink flex items-center justify-between">
                <span>📋 Confirmação de Abertura de Protocolo</span>
                <Badge variant="green">Aprovado Meta</Badge>
              </div>
              <p className="text-muted text-[11px]">
                Notifica o cidadão com número do protocolo e prazo de resposta.
              </p>
            </div>

            <div
              onClick={() =>
                handleSendTemplate(
                  "Convocação para Audiência",
                  `Olá, ${selectedChat.citizen_name}! Convidamos você para a Audiência Pública sobre o Plano Diretor nesta quinta-feira às 19h no Plenário da Câmara.`
                )
              }
              className="p-3 border border-line hover:border-green rounded-lg cursor-pointer transition-colors bg-paper/20 hover:bg-mint/20 space-y-1"
            >
              <div className="font-bold text-ink flex items-center justify-between">
                <span>📢 Convocação para Audiência Pública</span>
                <Badge variant="green">Aprovado Meta</Badge>
              </div>
              <p className="text-muted text-[11px]">
                Convite formal da comissão parlamentar com data, horário e pauta.
              </p>
            </div>

            <div
              onClick={() =>
                handleSendTemplate(
                  "Conclusão de Serviço",
                  `Notícia boa, ${selectedChat.citizen_name}! A solicitação de zeladoria de sua rua foi executada pela Prefeitura conforme cobrança do mandato.`
                )
              }
              className="p-3 border border-line hover:border-green rounded-lg cursor-pointer transition-colors bg-paper/20 hover:bg-mint/20 space-y-1"
            >
              <div className="font-bold text-ink flex items-center justify-between">
                <span>✅ Conclusão de Serviço de Zeladoria</span>
                <Badge variant="green">Aprovado Meta</Badge>
              </div>
              <p className="text-muted text-[11px]">
                Avisa o munícipe sobre a resolução da demanda com fotos e ofício.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-line">
            <Button variant="ghost" onClick={() => setIsTemplateModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </ClientShell>
  );
}
