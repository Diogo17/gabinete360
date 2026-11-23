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
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  DEMO_AGENDA_EVENTS,
  type DemoAgendaEvent,
} from "../../lib/mock-data";

export default function AgendaPage() {
  const [events, setEvents] = useState<DemoAgendaEvent[]>(DEMO_AGENDA_EVENTS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("session");
  const [location, setLocation] = useState("Plenário da Câmara Municipal");
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
      starts_at: `2026-11-23T${startTime}:00Z`,
      ends_at: `2026-11-23T${endTime}:00Z`,
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

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Agenda Parlamentar", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(false)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Compromisso
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Banner de Demonstração */}
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              <strong>Agenda Parlamentar e Compromissos</strong> — Organização de sessões plenárias, audiências, visitas às comunidades e atendimento no gabinete.
            </span>
          </div>
          <Badge variant="green">Ambiente Demonstração</Badge>
        </div>

        {/* Filtros por Tipo de Compromisso */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <FilterChip label={`Todos (${events.length})`} active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
          <FilterChip label="Sessões Plenárias" active={typeFilter === "session"} onClick={() => setTypeFilter("session")} />
          <FilterChip label="Visitas às Comunidades" active={typeFilter === "visit"} onClick={() => setTypeFilter("visit")} />
          <FilterChip label="Audiências Públicas" active={typeFilter === "hearing"} onClick={() => setTypeFilter("hearing")} />
          <FilterChip label="Reuniões de Gabinete" active={typeFilter === "meeting"} onClick={() => setTypeFilter("meeting")} />
        </div>

        {/* Grade de Eventos da Semana / Dia */}
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
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Avatar name="Mariana Costa" size="xs" />
                      <span className="text-[11px] text-ink font-medium">Mariana Costa</span>
                    </div>
                    {ev.visibility === "public" && (
                      <span className="text-[10px] text-green font-medium">Público no Portal</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
              <label className="font-semibold block mb-1">Local *</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex.: Rua das Flores, 142"
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
            <label className="font-semibold block mb-1">Pauta / Detalhes</label>
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
