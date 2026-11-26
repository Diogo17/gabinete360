"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button, Input, Textarea } from "@gabinete360/ui";
import {
  Send,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";
import type {
  PublicPortalPayload,
  PublicLegislativeItem,
} from "@/lib/portal/public-portal";

export function formatLegislativeCode(item: Pick<PublicLegislativeItem, "type" | "number">): string {
  const num = item.number.trim();
  if (/^(PL|PDL|PR|REQ|IND|MO[ÇC][ÃA]O|EI|EMENDA)\b/i.test(num)) {
    return num;
  }
  switch (item.type) {
    case "indication":
      return `IND ${num}`;
    case "requirement":
      return `REQ ${num}`;
    case "motion":
      return `MOÇÃO ${num}`;
    case "decree":
      return `PDL ${num}`;
    case "resolution":
      return `PR ${num}`;
    case "amendment":
      return `EMENDA ${num}`;
    default:
      return `PL ${num}`;
  }
}

export function getLegislativeStatusBadge(status: string): {
  label: string;
  variant: "green" | "blue" | "amber" | "neutral" | "red";
} {
  switch (status) {
    case "sanctioned":
    case "promulgated":
      return { label: "Sancionado / Lei", variant: "green" };
    case "approved":
      return { label: "Aprovado", variant: "green" };
    case "in_commission":
      return { label: "Nas Comissões", variant: "blue" };
    case "floor_vote":
      return { label: "Em Plenário", variant: "amber" };
    case "protocol_confirmed":
    case "protocol_submitted":
      return { label: "Protocolado", variant: "blue" };
    case "protocol_pending":
    case "ready_to_sign":
    case "signed":
      return { label: "Em Trâmite", variant: "amber" };
    case "rejected":
    case "vetoed":
      return { label: "Rejeitado / Vetado", variant: "red" };
    default:
      return { label: "Em Análise", variant: "neutral" };
  }
}

function getAgendaBadgeLabel(eventType: string | null): {
  label: string;
  variant: "green" | "blue" | "amber" | "neutral";
} {
  switch (eventType) {
    case "hearing":
      return { label: "Audiência Pública", variant: "blue" };
    case "visit":
      return { label: "Visita Comunitária", variant: "amber" };
    case "session":
      return { label: "Sessão Plenária", variant: "green" };
    case "event":
      return { label: "Evento Público", variant: "green" };
    default:
      return { label: "Agenda Pública", variant: "neutral" };
  }
}

function getRoleSubtitle(
  role: string,
  legislature?: string | null,
  party?: string | null
): string {
  const roleMap: Record<string, string> = {
    vereador: "Vereador(a)",
    deputado_estadual: "Deputado(a) Estadual",
    deputado_federal: "Deputado(a) Federal",
    senador: "Senador(a)",
  };
  const parts = [roleMap[role] || "Parlamentar"];
  if (legislature) parts.push(`(${legislature})`);
  if (party) parts.push(`· ${party}`);
  return parts.join(" ");
}

export function PublicPortalView({ initialData }: { initialData: PublicPortalPayload }) {
  const profile = initialData.profile;
  const legislativeItems = initialData.legislativeItems.slice(0, 3);
  const agendaEvents = initialData.agendaEvents.slice(0, 3);

  const [formSent, setFormSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [message, setMessage] = useState("");

  if (!initialData.found || !profile) {
    return (
      <div className="min-h-screen bg-[#F6F8F5] text-[#172B27] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-[#E8EEEA] bg-white p-8 text-center space-y-4 shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#176B52] grid place-items-center text-white font-heading font-extrabold">
            360°
          </div>
          <h1 className="font-heading text-xl font-bold text-[#172B27]">
            Portal Público Não Configurado
          </h1>
          <p className="text-xs text-[#77847F] leading-relaxed">
            Este portal parlamentar ainda não teve seu perfil publicado no sistema ou está temporariamente desativado.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/login">
              <Button variant="primary" size="sm">
                Acessar Painel do Gabinete
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locationDisplay =
    [profile.municipality, profile.state].filter(Boolean).join(", ") || "Brasil";
  const allLegislativeHref = profile.portalSlug
    ? `/portal/${profile.portalSlug}/legislativo`
    : "/portal/legislativo";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !message.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/public/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: profile.organizationId,
          citizen_name: citizenName.trim(),
          ...(citizenPhone.trim() ? { citizen_phone: citizenPhone.trim() } : {}),
          neighborhood: neighborhood.trim(),
          title: message.trim().slice(0, 80),
          description: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Não foi possível registrar sua solicitação. Tente novamente.");
        return;
      }
      setProtocol(data.protocol || null);
      setFormSent(true);
      setCitizenName("");
      setCitizenPhone("");
      setNeighborhood("");
      setMessage("");
    } catch {
      setSubmitError("Falha de conexão ao enviar sua mensagem. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#172B27] flex flex-col font-sans">
      {/* Topo Institucional de Transparência */}
      <header className="bg-white border-b border-[#E8EEEA] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#176B52] grid place-items-center text-white font-heading font-extrabold text-sm shrink-0">
              360°
            </div>
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-sm text-[#172B27] truncate">
                {profile.cabinetName}
              </div>
              <div className="text-[10px] text-[#77847F] truncate">
                {profile.chamberName}
                {profile.state ? ` · ${profile.state}` : ""} · Portal de Transparência
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <nav className="hidden md:flex items-center gap-5 text-[#77847F] font-semibold">
              <a href="#biografia" className="hover:text-[#176B52]">
                Biografia
              </a>
              <a href="#projetos" className="hover:text-[#176B52]">
                Projetos de Lei
              </a>
              <a href="#agenda" className="hover:text-[#176B52]">
                Agenda Pública
              </a>
              <a href="#participacao" className="hover:text-[#176B52]">
                Participe
              </a>
            </nav>
            <Link href="/login">
              <Button variant="secondary" size="sm" className="text-xs">
                Acesso Restrito
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero do Parlamentar (100% Perfil Real) */}
      <section
        className="bg-gradient-to-b from-[#E8F3ED]/60 to-transparent py-12 px-4 border-b border-[#E8EEEA]"
        id="biografia"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.legislatorName}
                className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="h-32 w-32 rounded-2xl bg-[#D6E5DD] border-4 border-white shadow-md grid place-items-center text-[#176B52] font-heading font-extrabold text-3xl">
                {profile.legislatorName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="mt-4 font-heading text-2xl font-extrabold text-[#172B27]">
              {profile.legislatorName}
            </h1>
            <p className="text-xs font-semibold text-[#176B52] uppercase tracking-wider mt-0.5">
              {profile.fullName ? `${profile.fullName} · ` : ""}
              {getRoleSubtitle(profile.parliamentaryRole, profile.legislatureNumber, profile.party)}
            </p>
            <div className="mt-2 text-xs text-[#77847F] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {locationDisplay}
            </div>
            {(profile.officialEmail || profile.officialPhone) && (
              <div className="mt-3 space-y-1 text-[11px] text-[#77847F]">
                {profile.officialPhone && (
                  <div className="flex items-center justify-center md:justify-start gap-1.5">
                    <Phone className="h-3 w-3 text-[#176B52]" /> {profile.officialPhone}
                  </div>
                )}
                {profile.officialEmail && (
                  <div className="flex items-center justify-center md:justify-start gap-1.5">
                    <Mail className="h-3 w-3 text-[#176B52]" /> {profile.officialEmail}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4 text-xs md:text-sm text-[#172B27]/80 leading-relaxed">
            {profile.bioHeadline && (
              <h2 className="font-heading font-bold text-lg text-[#172B27]">
                {profile.bioHeadline}
              </h2>
            )}
            {profile.biography ? (
              <p className="whitespace-pre-line">{profile.biography}</p>
            ) : (
              <p>
                Mandato parlamentar conectado ao <strong>Gabinete Digital 360°</strong> para registro formal, acompanhamento e transparência das demandas em {locationDisplay}.
              </p>
            )}
            <p>
              O mandato utiliza o <strong>Gabinete Digital 360°</strong> para assegurar que as demandas das comunidades de {profile.municipality || "sua região"} sejam registradas com protocolo formal e acompanhadas até a resolução junto ao Poder Executivo.
            </p>
            {profile.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.highlights.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#E8EEEA] text-[#176B52]"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Atuação Legislativa Real */}
      <section className="py-12 px-4 max-w-6xl mx-auto w-full space-y-6" id="projetos">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B52]">
              Atuação Legislativa
            </span>
            <h2 className="font-heading text-xl font-bold text-[#172B27]">
              Projetos de Lei e Ações em Tramitação
            </h2>
          </div>
          <Link href={allLegislativeHref}>
            <span className="text-xs font-bold text-[#176B52] hover:underline flex items-center gap-1 whitespace-nowrap">
              Ver todos na íntegra <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {legislativeItems.length === 0 ? (
            <div className="md:col-span-3 rounded-xl border border-[#E8EEEA] bg-white p-6 text-center text-xs text-[#77847F] space-y-1">
              <FileText className="h-6 w-6 mx-auto text-[#77847F]/60" />
              <div className="font-semibold text-[#172B27]">
                Nenhuma proposição pública cadastrada no momento.
              </div>
              <div>
                As matérias legislativas publicadas pelo gabinete aparecerão automaticamente aqui.
              </div>
            </div>
          ) : (
            legislativeItems.map((item) => {
              const badge = getLegislativeStatusBadge(item.status);
              return (
                <Card key={item.id} className="bg-white border-[#E8EEEA] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#176B52]">
                        {formatLegislativeCode(item)}
                      </span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <h3 className="font-bold text-sm text-[#172B27] leading-snug">{item.title}</h3>
                    {item.summary && (
                      <p className="text-xs text-[#77847F] leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    )}
                  </div>
                  {(item.protocol_date || item.official_source_url) && (
                    <div className="pt-2 border-t border-[#E8EEEA] flex items-center justify-between text-[11px] text-[#77847F]">
                      <span>
                        {item.protocol_date
                          ? `Data: ${new Date(item.protocol_date + "T12:00:00Z").toLocaleDateString("pt-BR")}`
                          : `Ano: ${item.year}`}
                      </span>
                      {item.official_source_url && (
                        <a
                          href={item.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#176B52] hover:underline"
                        >
                          Fonte oficial <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Agenda Pública Parlamentar */}
      <section className="py-10 bg-white border-y border-[#E8EEEA] px-4" id="agenda">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B52]">
                Transparência
              </span>
              <h2 className="font-heading text-xl font-bold text-[#172B27]">
                Agenda Pública Parlamentar
              </h2>
            </div>
            {profile.agendaSyncUrl && (
              <a
                href={profile.agendaSyncUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#176B52] hover:underline flex items-center gap-1"
              >
                Portal da Casa <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agendaEvents.length === 0 ? (
              <div className="md:col-span-3 rounded-xl border border-[#E8EEEA] bg-[#F6F8F5] p-6 text-center text-xs text-[#77847F] space-y-1">
                <Calendar className="h-6 w-6 mx-auto text-[#77847F]/60" />
                <div className="font-semibold text-[#172B27]">
                  Nenhum compromisso público agendado para os próximos dias.
                </div>
                <div>
                  Sessões, audiências públicas e visitas comunitárias marcadas como públicas aparecerão aqui automaticamente.
                </div>
              </div>
            ) : (
              agendaEvents.map((evt) => {
                const evtBadge = getAgendaBadgeLabel(evt.event_type);
                return (
                  <div
                    key={evt.id}
                    className="p-4 bg-[#F6F8F5] rounded-xl border border-[#E8EEEA] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[#77847F]">
                      <span>
                        {new Date(evt.starts_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                        {" · "}
                        {new Date(evt.starts_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Badge variant={evtBadge.variant}>{evtBadge.label}</Badge>
                    </div>
                    <div className="font-bold text-sm text-[#172B27]">{evt.title}</div>
                    <div className="text-[#77847F] flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />{" "}
                      {evt.location || profile.chamberName}
                    </div>
                  </div>
                );
              })
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
              Seu atendimento foi encaminhado à equipe de triagem do{" "}
              <strong>{profile.cabinetName}</strong>
              {protocol ? (
                <>
                  {" "}
                  com protocolo <span className="font-mono font-bold text-[#172B27]">{protocol}</span>
                </>
              ) : null}
              .
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFormSent(false);
                setProtocol(null);
              }}
            >
              Enviar Outra Mensagem
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl border border-[#E8EEEA] shadow-xs space-y-4 text-xs"
          >
            {submitError && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

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
                  placeholder={profile.neighborhoodPlaceholder}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">WhatsApp / Telefone (opcional)</label>
              <Input
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                placeholder="Ex.: (38) 99999-0000"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">
                Assunto / Descrição da Reivindicação *
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Descreva o problema em seu bairro/comunidade ou sua sugestão de projeto de lei..."
                required
              />
            </div>

            <div className="text-[11px] text-[#77847F] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#176B52] shrink-0" />
              <span>
                Dados tratados conforme a{" "}
                <Link href="/privacidade" className="underline hover:text-[#176B52]">
                  Política de Privacidade (LGPD)
                </Link>
                .
              </span>
            </div>

            <Button type="submit" variant="primary" disabled={submitting} className="w-full font-bold">
              <Send className="h-4 w-4 mr-1.5" />
              {submitting ? "Registrando Protocolo..." : profile.portalCtaLabel}
            </Button>
          </form>
        )}
      </section>

      {/* Rodapé Institucional Dinâmico */}
      <footer className="mt-auto bg-white border-t border-[#E8EEEA] py-6 px-4 text-center text-xs text-[#77847F] space-y-1.5">
        <div>
          Gabinete Digital 360° by DM IA Studio · {profile.cabinetName}
          {profile.legislatureNumber ? ` (${profile.legislatureNumber})` : ""}
        </div>
        <div className="text-[11px]">
          {profile.chamberName}
          {profile.chamberAddress ? ` · ${profile.chamberAddress}` : ""}
          {profile.chamberCep ? ` · CEP ${profile.chamberCep}` : ""}
        </div>
        <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
          <Link href={allLegislativeHref} className="hover:text-[#176B52] hover:underline">
            Proposições Públicas
          </Link>
          <Link href="/validar-assinatura" className="hover:text-[#176B52] hover:underline">
            Validar Assinatura
          </Link>
          <Link href="/privacidade" className="hover:text-[#176B52] hover:underline">
            Privacidade (LGPD)
          </Link>
        </div>
      </footer>
    </div>
  );
}
