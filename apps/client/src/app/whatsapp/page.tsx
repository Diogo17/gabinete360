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
} from "@gabinete360/ui";
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  UserCheck,
  CheckCheck,
  Clock,
  Sparkles,
} from "lucide-react";

interface ChatConversation {
  id: string;
  citizen_name: string;
  phone: string;
  neighborhood: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: "open" | "assigned" | "waiting";
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
    last_message: "Perfeito, levarei os documentos na quinta-feira.",
    last_message_time: "Ontem",
    unread_count: 0,
    status: "assigned",
    messages: [
      { id: "m-4", sender: "agent", text: "Seu protocolo é o #AT-0248. Agendamos seu atendimento presencial.", time: "16:40" },
      { id: "m-5", sender: "citizen", text: "Perfeito, levarei os documentos na quinta-feira.", time: "16:42" },
    ],
  },
];

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedChat, setSelectedChat] = useState<ChatConversation>(INITIAL_CONVERSATIONS[0]!);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "agent" as const,
      text: inputText,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = {
      ...selectedChat,
      last_message: inputText,
      last_message_time: newMsg.time,
      messages: [...selectedChat.messages, newMsg],
    };

    setSelectedChat(updated);
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setInputText("");
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "WhatsApp Inbox Integrado", current: true },
      ]}
      topbarActions={
        <div className="flex items-center gap-1 text-xs text-green font-semibold bg-mint/60 px-2.5 py-1 rounded">
          <MessageCircle className="h-4 w-4" /> WhatsApp Business Oficial
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>
              <strong>Caixa de Entrada Unificada do WhatsApp</strong> — Atendimento direto a munícipes, triagem com IA e conversão automática de mensagens em demandas.
            </span>
          </div>
          <Badge variant="green">Ambiente Demonstração</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] border border-line rounded-xl overflow-hidden bg-white">
          {/* Coluna Esquerda: Lista de Conversas */}
          <div className="md:col-span-1 border-r border-line flex flex-col h-full bg-paper/20">
            <div className="p-3 border-b border-line bg-white">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Pesquisar conversa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-line rounded text-xs bg-paper focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-line">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 cursor-pointer hover:bg-paper/50 transition-colors ${
                    selectedChat.id === chat.id ? "bg-mint/40 border-l-4 border-green" : ""
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
                    <span className="text-[10px] text-muted">{chat.last_message_time}</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1.5 line-clamp-1 truncate">
                    {chat.last_message}
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
                  <div className="font-semibold text-ink text-sm">{selectedChat.citizen_name}</div>
                  <div className="text-[11px] text-muted font-mono">{selectedChat.phone}</div>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="text-xs">
                Converter em Atendimento #AT
              </Button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8faf8]">
              {selectedChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "agent" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg text-xs leading-relaxed shadow-sm ${
                      m.sender === "agent"
                        ? "bg-green text-white rounded-br-none"
                        : "bg-white text-ink border border-line rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-muted mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Caixa de Digitação */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-line flex items-center gap-2 bg-white">
              <input
                type="text"
                placeholder="Digite uma mensagem ou use IA para sugerir resposta..."
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
    </ClientShell>
  );
}
