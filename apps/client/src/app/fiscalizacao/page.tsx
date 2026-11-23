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
  Search,
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  FileCheck,
  Building,
} from "lucide-react";

interface InspectionCase {
  id: string;
  code: string;
  title: string;
  entity: string;
  neighborhood: string;
  date: string;
  status: "active" | "reporting" | "forwarded" | "resolved";
  findings: string;
  actions_taken: string;
}

const INITIAL_INSPECTIONS: InspectionCase[] = [
  {
    id: "fisc-01",
    code: "FISC-2026-001",
    title: "Fiscalização da Reforma da UPA Zona Leste",
    entity: "Secretaria de Saúde / Empreiteira Viva Mais",
    neighborhood: "Ponta da Praia",
    date: "12/11/2026",
    status: "forwarded",
    findings: "Atraso de 4 meses na entrega das salas de triagem; falta de climatização na espera provisória.",
    actions_taken: "Encaminhado Requerimento de Informações nº 312/2026 e relatório técnico ao Ministério Público.",
  },
  {
    id: "fisc-02",
    code: "FISC-2026-002",
    title: "Vistoria no Centro Educacional Comunitário",
    entity: "Secretaria Municipal de Educação",
    neighborhood: "Jardim das Flores",
    date: "18/11/2026",
    status: "active",
    findings: "Infiltração grave no refeitório das crianças e parquinho interditado pela Defesa Civil.",
    actions_taken: "Agendada reunião emergencial com a Secretaria de Infraestrutura Escolar.",
  },
];

export default function FiscalizacaoPage() {
  const [cases, setCases] = useState<InspectionCase[]>(INITIAL_INSPECTIONS);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [entity, setEntity] = useState("");
  const [neighborhood, setNeighborhood] = useState("Jardim das Flores");
  const [findings, setFindings] = useState("");

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !entity) return;

    const newCase: InspectionCase = {
      id: `fisc-${Date.now()}`,
      code: `FISC-2026-00${cases.length + 1}`,
      title,
      entity,
      neighborhood,
      date: new Date().toLocaleDateString("pt-BR"),
      status: "active",
      findings,
      actions_taken: "Vistoria inicial registrada pela assessoria técnica do gabinete.",
    };

    setCases([newCase, ...cases]);
    setIsNewModalOpen(false);
    setTitle("");
    setEntity("");
    setFindings("");
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Fiscalização Parlamentar", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Fiscalização
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>
              <strong>Dever Constitucional de Fiscalização</strong> — Registro de visitas fiscalizatórias a obras, postos de saúde, escolas e contratos públicos.
            </span>
          </div>
          <Badge variant="green">Ambiente Demonstração</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <Card key={c.id} className="border-line p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-mono text-green font-bold">{c.code}</div>
                  <div className="text-sm font-semibold text-ink">{c.title}</div>
                </div>
                <Badge variant={c.status === "forwarded" ? "blue" : "amber"}>
                  {c.status === "forwarded" ? "Ofício Enviado" : "Em Averiguação"}
                </Badge>
              </div>

              <div className="text-xs space-y-1.5 text-muted">
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> <strong>Órgão/Alvo:</strong> {c.entity}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> <strong>Local:</strong> {c.neighborhood}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> <strong>Data da Vistoria:</strong> {c.date}
                </div>
              </div>

              <div className="p-2.5 bg-paper rounded border border-line text-xs space-y-1">
                <div className="font-semibold text-ink flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Irregularidades Constatadas:
                </div>
                <p className="text-muted leading-relaxed">{c.findings}</p>
              </div>

              <div className="pt-2 border-t border-line text-xs flex items-center justify-between">
                <span className="text-[11px] text-green font-medium">
                  {c.actions_taken}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Nova Fiscalização */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Registrar Visita Fiscalizatória"
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Título da Ação de Fiscalização *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Vistoria no asfaltamento e drenagem da Rua 10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Órgão / Contratada Fiscalizada *</label>
              <Input
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                placeholder="Ex.: Secretaria de Obras e Serviços Públicos"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Bairro / Região *</label>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex.: Bairro do Macuco"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Constatações da Visita (Achados)</label>
            <Textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Descreva problemas observados, relatos de munícipes e evidências coletadas..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Registrar Ação
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
