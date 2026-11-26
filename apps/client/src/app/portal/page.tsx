"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Avatar,
  Input,
  Textarea,
} from "@gabinete360/ui";
import {
  Building2,
  Calendar,
  FileSpreadsheet,
  HelpCircle,
  Newspaper,
  Send,
  CheckCircle,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  Globe,
} from "lucide-react";

interface PublicLegislativeItem {
  id: string;
  type: string;
  number: string;
  year: number;
  title: string;
  summary: string | null;
  status: string;
}

interface PublicAgendaEvent {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  event_type: string | null;
}

export default function PortalPublicoPage() {
  const [organizationId, setOrganizationId] = useState("11111111-1111-4111-8111-111111110001");
  const [legislativeItems, setLegislativeItems] = useState<PublicLegislativeItem[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<PublicAgendaEvent[]>([]);
  const [formSent, setFormSent] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [citizenName, setCitizenName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/public/portal")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.organizationId) setOrganizationId(data.organizationId);
        if (Array.isArray(data.legislativeItems)) setLegislativeItems(data.legislativeItems);
        if (Array.isArray(data.agendaEvents)) setAgendaEvents(data.agendaEvents);
      })
      .catch(() => null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !message) return;
    try {
      const res = await fetch("/api/public/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organizationId,
          citizen_name: citizenName,
          neighborhood,
          title: message.slice(0, 80),
          description: message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProtocol(data.protocol);
        setFormSent(true);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#172B27] flex flex-col font-sans">
      {/* Topo Institucional de Transparência */}
      <header className="bg-white border-b border-[#E8EEEA] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#176B52] grid place-items-center text-white font-heading font-extrabold text-sm">
              360°
            </div>
            <div>
              <div className="font-heading font-extrabold text-sm text-[#172B27]">
                Gabinete Vereador Bill do Barreiro do Alegre
              </div>
              <div className="text-[10px] text-[#77847F]">
                Câmara Municipal de Januária · MG · Portal de Transparência
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <nav className="hidden md:flex items-center gap-5 text-[#77847F] font-semibold">
              <a href="#biografia" className="hover:text-[#176B52]">Biografia</a>
              <a href="#projetos" className="hover:text-[#176B52]">Projetos de Lei</a>
              <a href="#agenda" className="hover:text-[#176B52]">Agenda Pública</a>
              <a href="#participacao" className="hover:text-[#176B52]">Participe</a>
            </nav>
            <Link href="/login">
              <Button variant="secondary" size="sm" className="text-xs">
                Acesso Restrito
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero do Parlamentar */}
      <section className="bg-gradient-to-b from-[#E8F3ED]/60 to-transparent py-12 px-4 border-b border-[#E8EEEA]" id="biografia">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <img
              src="/vereador-bill.jpg"
              alt="Vereador Bill do Barreiro do Alegre"
              className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-md"
            />
            <h1 className="mt-4 font-heading text-2xl font-extrabold text-[#172B27]">
              Bill do Barreiro do Alegre
            </h1>
            <p className="text-xs font-semibold text-[#176B52] uppercase tracking-wider">
              Edilson Alves dos Santos · Vereador (2025–2028)
            </p>
            <div className="mt-2 text-xs text-[#77847F] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Januária, Minas Gerais
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 text-xs md:text-sm text-[#172B27]/80 leading-relaxed">
            <h2 className="font-heading font-bold text-lg text-[#172B27]">
              Raízes no Campo, Representatividade Quilombola e Compromisso com Januária
            </h2>
            <p>
              Nascido na Comunidade Quilombola de Barreiro do Alegre (distrito de Riacho da Cruz), filho e neto de trabalhadores rurais, Edilson Alves dos Santos — <strong>Bill do Barreiro do Alegre</strong> — foi presidente da associação comunitária por três mandatos, chefiou o Departamento Hídrico da Prefeitura de Januária e exerce seu mandato na Câmara Municipal (2025–2028) pelo União Brasil.
            </p>
            <p>
              O mandato utiliza o <strong>Gabinete Digital 360°</strong> para assegurar que as demandas das comunidades rurais e urbanas de Januária sejam registradas com protocolo formal e acompanhadas até a resolução junto ao Poder Executivo.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#E8EEEA] text-[#176B52]">
                ✓ 849 Votos (Eleição 2024)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#E8EEEA] text-[#176B52]">
                ✓ R$ 302.540,00 em Emendas Impositivas 2026
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#E8EEEA] text-[#176B52]">
                ✓ Comunidades Rurais e Quilombolas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Projetos em Destaque */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full space-y-6" id="projetos">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B52]">
              Atuação Legislativa
            </span>
            <h2 className="font-heading text-xl font-bold text-[#172B27]">
              Projetos de Lei e Ações em Tramitação
            </h2>
          </div>
          <Link href="/legislativo">
            <span className="text-xs font-bold text-[#176B52] hover:underline flex items-center gap-1">
              Ver todos na íntegra <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {legislativeItems.length === 0 ? (
            <div className="md:col-span-3 rounded-xl border border-[#E8EEEA] bg-white p-6 text-center text-xs text-[#77847F]">
              Nenhuma proposição legislativa disponível para exibição pública no momento.
            </div>
          ) : (
            legislativeItems.map((item) => (
              <Card key={item.id} className="bg-white border-[#E8EEEA] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#176B52]">
                    {item.type === "indication"
                      ? `IND ${item.number}`
                      : item.type === "requirement"
                      ? `REQ ${item.number}`
                      : item.type === "motion"
                      ? `MOÇÃO ${item.number}`
                      : `PL ${item.number}`}
                  </span>
                  <Badge variant={item.status === "approved" ? "green" : "blue"}>
                    {item.status === "approved"
                      ? "Aprovado"
                      : item.status === "in_review"
                      ? "Em Trâmite"
                      : "Protocolado"}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm text-[#172B27]">{item.title}</h3>
                {item.summary && (
                  <p className="text-xs text-[#77847F] leading-relaxed">{item.summary}</p>
                )}
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Agenda Aberta ao Público */}
      <section className="py-10 bg-white border-y border-[#E8EEEA] px-4" id="agenda">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B52]">
              Transparência
            </span>
            <h2 className="font-heading text-xl font-bold text-[#172B27]">
              Agenda Pública Parlamentar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agendaEvents.length === 0 ? (
              <div className="md:col-span-3 rounded-xl border border-[#E8EEEA] bg-[#F6F8F5] p-6 text-center text-xs text-[#77847F]">
                Nenhum compromisso público agendado para os próximos dias.
              </div>
            ) : (
              agendaEvents.map((evt) => (
                <div key={evt.id} className="p-4 bg-[#F6F8F5] rounded-xl border border-[#E8EEEA] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono text-[#77847F]">
                    <span>
                      {new Date(evt.starts_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      {" · "}
                      {new Date(evt.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Badge variant="green">{evt.event_type || "Agenda Pública"}</Badge>
                  </div>
                  <div className="font-bold text-sm text-[#172B27]">{evt.title}</div>
                  <div className="text-[#77847F] flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {evt.location || "Câmara Municipal de Januária"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Formulário de Participação Cidadã */}
      <section className="py-12 px-4 max-w-3xl mx-auto w-full space-y-6" id="participacao">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B52]">
            Canal Aberto ao Munícipe
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#172B27]">
            Envie sua Solicitação, Ideia ou Reivindicação
          </h2>
          <p className="text-xs text-[#77847F] max-w-md mx-auto">
            Todas as mensagens são triadas pelo gabinete e recebem número de protocolo formal.
          </p>
        </div>

        {formSent ? (
          <div className="p-6 bg-[#E8F3ED] rounded-xl border border-[#176B52]/30 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-[#176B52] mx-auto" />
            <h3 className="font-heading font-bold text-base text-[#172B27]">
              Solicitação Enviada com Sucesso!
            </h3>
            <p className="text-xs text-[#77847F]">
              Seu atendimento foi encaminhado à equipe de triagem{protocol ? ` (Protocolo: ${protocol})` : ""}. Em breve você receberá atualizações em seu contato.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setFormSent(false)}>
              Enviar Outra Mensagem
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-[#E8EEEA] shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Seu Nome Completo *</label>
                <Input
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Ex.: Maria Aparecida"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Bairro / Comunidade *</label>
                <Input
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex.: Barreiro do Alegre · Januária"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Assunto / Descrição da Reivindicação *</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Descreva o problema em seu bairro ou sua sugestão de projeto de lei..."
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full font-bold">
              <Send className="h-4 w-4 mr-1.5" /> Enviar ao Gabinete do Vereador
            </Button>
          </form>
        )}
      </section>

      {/* Rodapé Institucional */}
      <footer className="mt-auto bg-white border-t border-[#E8EEEA] py-6 px-4 text-center text-xs text-[#77847F] space-y-1">
        <div>Gabinete Digital 360° by DM IA Studio · Portal de Transparência</div>
        <div className="text-[10px]">Câmara Municipal de Januária · MG · Mandato Vereador Bill do Barreiro do Alegre (2025–2028)</div>
      </footer>
    </div>
  );
}
