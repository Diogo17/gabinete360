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
  Modal,
  Input,
  Textarea,
  Select,
} from "@gabinete360/ui";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  CalendarRange,
} from "lucide-react";
import {
  DEMO_AGENDA_EVENTS,
  type DemoAgendaEvent,
} from "../../lib/mock-data";

export default function AgendaPage() {
  const [events, setEvents] = useState<DemoAgendaEvent[]>(DEMO_AGENDA_EVENTS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedDay, setSelectedDay] = useState<number>(23);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("session");
  const [location, setLocation] = useState("Plenário da Câmara Municipal");
  const [eventDate, setEventDate] = useState("2026-11-23");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:30");
  const [description, setDescription] = useState("");

  const filteredEvents = events.filter((ev) => {
    if (typeFilter === "all") return true;
    return ev.event_type === typeFilter;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newEv: DemoAgendaEvent = {
      id: `ev-${Date.now()}`,
      organization_id: "org-gabinete-mariana",
      workspace_id: "wks-santos-01",
      title,
      description,
      event_type: eventType as any,
      status: "scheduled",
      visibility: "public",
      starts_at: `${eventDate}T${startTime}:00Z`,
      ends_at: `${eventDate}T${endTime}:00Z`,
      location,
      created_by: "usr-mariana",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEvents([newEv, ...events]);
    setIsNewModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const getEventTypeBadge = (type: DemoAgendaEvent["event_type"]) => {
    switch (type) {
      case "session":
        return <Badge variant="green">Sessão Plenária</Badge>;
      case "hearing":
        return <Badge variant="blue">Audiência Pública</Badge>;
      case "visit":
        return <Badge variant="amber">Visita Comunitária</Badge>;
      case "meeting":
        return <Badge variant="neutral">Reunião de Gabinete</Badge>;
      case "event":
        return <Badge variant="red">Evento Institucional</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  const getEventDotColor = (type: DemoAgendaEvent["event_type"]) => {
    switch (type) {
      case "session":
        return "bg-green";
      case "hearing":
        return "bg-blue";
      case "visit":
        return "bg-gold";
      case "meeting":
        return "bg-muted";
      default:
        return "bg-red";
    }
  };

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const selectedDayEvents = filteredEvents.filter((ev) => {
    const day = parseInt(ev.starts_at.split("T")[0]?.split("-")[2] || "23", 10);
    return day === selectedDay;
  });

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Agenda Parlamentar", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Compromisso
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Banner Institucional */}
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span>
              <strong>Agenda Oficial do Mandato</strong> — Calendário integrado de sessões plenárias, comissões, audiências públicas e visitas às comunidades.
            </span>
          </div>
          <div className="flex items-center gap-1 bg-white border border-line rounded-lg p-1 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 ${
                viewMode === "month" ? "bg-green text-white" : "text-muted hover:text-ink"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" /> Mês
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 ${
                viewMode === "week" ? "bg-green text-white" : "text-muted hover:text-ink"
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" /> Semana
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 ${
                viewMode === "list" ? "bg-green text-white" : "text-muted hover:text-ink"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Controles do Calendário */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDay(23)}
            >
              Hoje (23 Nov)
            </Button>
            <div className="flex items-center border border-line rounded-lg bg-white">
              <button
                className="p-1.5 hover:bg-paper text-muted"
                onClick={() => setSelectedDay((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-heading font-bold text-sm text-ink px-3">
                Novembro de 2026
              </span>
              <button
                className="p-1.5 hover:bg-paper text-muted"
                onClick={() => setSelectedDay((prev) => Math.min(30, prev + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
            <FilterChip label="Todos" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
            <FilterChip label="Sessões" active={typeFilter === "session"} onClick={() => setTypeFilter("session")} />
            <FilterChip label="Visitas" active={typeFilter === "visit"} onClick={() => setTypeFilter("visit")} />
            <FilterChip label="Audiências" active={typeFilter === "hearing"} onClick={() => setTypeFilter("hearing")} />
            <FilterChip label="Reuniões" active={typeFilter === "meeting"} onClick={() => setTypeFilter("meeting")} />
          </div>
        </div>

        {/* VISUALIZAÇÃO 1: CALENDÁRIO MENSAL EM GRID */}
        {viewMode === "month" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="py-3 px-4 border-b border-line bg-paper/40 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-green" /> Calendário Mensal — Novembro 2026
                  </CardTitle>
                  <span className="text-xs text-muted">Clique em um dia para ver os detalhes</span>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted mb-2">
                    {weekDays.map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {daysInMonth.map((day) => {
                      const dayEvents = filteredEvents.filter((ev) => {
                        const evDay = parseInt(ev.starts_at.split("T")[0]?.split("-")[2] || "23", 10);
                        return evDay === day;
                      });
                      const isToday = day === 23;
                      const isSelected = day === selectedDay;

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`min-h-[72px] p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-green ring-2 ring-green/20 bg-mint/30 shadow-xs"
                              : isToday
                              ? "border-green/40 bg-mint/10"
                              : "border-line bg-white hover:bg-paper/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold rounded-full h-5 w-5 grid place-items-center ${
                                isToday
                                  ? "bg-green text-white"
                                  : isSelected
                                  ? "bg-ink text-white"
                                  : "text-ink"
                              }`}
                            >
                              {day}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="text-[9px] font-bold text-green font-mono">
                                {dayEvents.length}
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 mt-1 overflow-hidden">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <div
                                key={ev.id}
                                className="text-[9px] truncate px-1 py-0.5 rounded bg-paper border border-line text-ink font-medium flex items-center gap-1"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getEventDotColor(ev.event_type)}`} />
                                <span className="truncate">{ev.title}</span>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[8px] text-muted font-bold pl-1">
                                +{dayEvents.length - 2} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel Lateral: Compromissos do Dia Selecionado */}
            <div className="lg:col-span-1">
              <Card className="border-line sticky top-20">
                <CardHeader className="py-3 px-4 border-b border-line bg-mint/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-ink">
                      Compromissos do Dia {selectedDay}
                    </CardTitle>
                    <div className="text-xs text-muted">Novembro de 2026 · Santos / SP</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsNewModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted text-xs space-y-2">
                      <CalendarIcon className="h-8 w-8 mx-auto text-muted/50" />
                      <div>Nenhum compromisso agendado para o dia {selectedDay}.</div>
                      <Button variant="secondary" size="sm" onClick={() => setIsNewModalOpen(true)}>
                        Agendar Neste Dia
                      </Button>
                    </div>
                  ) : (
                    selectedDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 bg-white rounded-lg border border-line hover:border-green/40 transition-colors space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-muted flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted" />
                            {ev.starts_at.split("T")[1]?.substring(0, 5) || "09:00"} -{" "}
                            {ev.ends_at.split("T")[1]?.substring(0, 5) || "10:30"}
                          </span>
                          {getEventTypeBadge(ev.event_type)}
                        </div>

                        <div className="font-semibold text-ink text-sm leading-tight">{ev.title}</div>
                        {ev.description && (
                          <p className="text-muted leading-relaxed text-[11px]">{ev.description}</p>
                        )}

                        <div className="pt-2 border-t border-line text-muted flex items-center gap-1 text-[11px]">
                          <MapPin className="h-3 w-3 text-muted shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* VISUALIZAÇÃO 2: SEMANAL EM LINHA DO TEMPO */}
        {viewMode === "week" && (
          <Card>
            <CardHeader className="py-3 px-4 border-b border-line bg-paper/30">
              <CardTitle className="text-sm font-semibold">
                Semana de 23 a 29 de Novembro de 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {[23, 24, 25, 26, 27, 28, 29].map((dayNumber, idx) => {
                  const dayEvents = filteredEvents.filter((ev) => {
                    const evDay = parseInt(ev.starts_at.split("T")[0]?.split("-")[2] || "23", 10);
                    return evDay === dayNumber;
                  });
                  return (
                    <div key={dayNumber} className="border border-line rounded-lg p-2 bg-paper/10 min-h-[300px]">
                      <div className="text-center pb-2 border-b border-line mb-2">
                        <div className="text-[10px] text-muted font-bold">{weekDays[idx + 1] || "Dom"}</div>
                        <div className="text-base font-bold text-ink">{dayNumber}</div>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2 bg-white rounded border border-line text-[11px] space-y-1 shadow-xs"
                          >
                            <div className="font-bold text-ink leading-tight">{ev.title}</div>
                            <div className="text-[10px] text-muted font-mono">
                              {ev.starts_at.split("T")[1]?.substring(0, 5)}
                            </div>
                            {getEventTypeBadge(ev.event_type)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* VISUALIZAÇÃO 3: LISTA COMPLETA */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((ev) => (
              <Card key={ev.id} className="border-line hover:border-green/40 transition-colors">
                <CardHeader className="py-3 px-4 border-b border-line flex flex-row items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {ev.starts_at.split("T")[1]?.substring(0, 5) || "09:00"} -{" "}
                      {ev.ends_at.split("T")[1]?.substring(0, 5) || "10:30"}
                    </span>
                  </div>
                  {getEventTypeBadge(ev.event_type)}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="font-semibold text-ink text-sm leading-tight">{ev.title}</div>
                  {ev.description && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">{ev.description}</p>
                  )}
                  <div className="pt-2 border-t border-line space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-muted">
                      <MapPin className="h-3.5 w-3.5 text-muted" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Novo Compromisso */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Agendar Novo Compromisso Parlamentar"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Título do Compromisso *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Visita à Unidade Básica de Saúde da Zona Noroeste"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Tipo de Compromisso *</label>
              <Select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                options={[
                  { value: "session", label: "Sessão Plenária" },
                  { value: "hearing", label: "Audiência Pública" },
                  { value: "visit", label: "Visita Comunitária" },
                  { value: "meeting", label: "Reunião de Gabinete" },
                  { value: "event", label: "Evento Institucional" },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Data *</label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Horário de Início</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Horário de Término</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Local / Ponto de Encontro *</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex.: Rua das Flores, 142 — Bairro Gonzaga"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Pauta e Detalhes da Ação</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objetivos do compromisso, lideranças presentes, documentos a levar..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
