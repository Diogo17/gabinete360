"use client";

import React, { useState, useEffect } from "react";
import { ClientShell } from "../../components/client-shell";
import { useOrganization } from "../../lib/tenant/context";
import { createClient } from "../../lib/supabase/client";
import { checkDocumentCompetency } from "../../lib/legislative/competency";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  FilterChip,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  Input,
  Textarea,
  Select,
} from "@gabinete360/ui";
import {
  FileSpreadsheet,
  Plus,
  Search,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

interface LegislativeItem {
  id: string;
  code: string;
  kind: "pl" | "requerimento" | "indicacao" | "mocao" | "emenda";
  title: string;
  summary: string;
  status: "tramitacao" | "comissoes" | "aprovado" | "sancionado" | "arquivado";
  presentation_date: string;
  author: string;
}

const INITIAL_LEGISLATIVE: LegislativeItem[] = [
  {
    id: "leg-01",
    code: "PL 084/2026",
    kind: "pl",
    title: "Programa Municipal de Conectividade nos Bairros Periféricos",
    summary: "Institui a instalação prioritária de pontos de internet Wi-Fi livre e de alta velocidade em praças e unidades de saúde.",
    status: "comissoes",
    presentation_date: "14/09/2026",
    author: "Vereadora Mariana Costa",
  },
  {
    id: "leg-02",
    code: "REQ 312/2026",
    kind: "requerimento",
    title: "Pedido de Informações sobre o Cronograma de Obras na Zona Noroeste",
    summary: "Requer ao Poder Executivo e à Secretaria de Obras detalhes sobre licitação e início dos serviços de contenção de encostas.",
    status: "aprovado",
    presentation_date: "02/10/2026",
    author: "Vereadora Mariana Costa",
  },
  {
    id: "leg-03",
    code: "IND 541/2026",
    kind: "indicacao",
    title: "Instalação de Redutores de Velocidade e Faixa de Pedestres na Av. Senador Feijó",
    summary: "Indica ao Prefeito e à CET a urgente sinalização e redutor em frente à Escola Municipal.",
    status: "tramitacao",
    presentation_date: "28/10/2026",
    author: "Vereadora Mariana Costa",
  },
  {
    id: "leg-04",
    code: "MOC 019/2026",
    kind: "mocao",
    title: "Moção de Aplausos aos Agentes Comunitários de Saúde de Santos",
    summary: "Manifesta congratulações pelo alcance de 98% na cobertura vacinal municipal contra bronquiolite e influenza.",
    status: "aprovado",
    presentation_date: "05/11/2026",
    author: "Vereadora Mariana Costa",
  },
];

export default function LegislativoPage() {
  const [items, setItems] = useState<LegislativeItem[]>(INITIAL_LEGISLATIVE);
  const [filterKind, setFilterKind] = useState("all");
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<LegislativeItem["kind"]>("pl");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.code.toLowerCase().includes(search.toLowerCase()) ||
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.summary.toLowerCase().includes(search.toLowerCase());
    const matchKind = filterKind === "all" || it.kind === filterKind;
    return matchSearch && matchKind;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code) return;

    const newItem: LegislativeItem = {
      id: `leg-${Date.now()}`,
      code,
      kind,
      title,
      summary,
      status: "tramitacao",
      presentation_date: new Date().toLocaleDateString("pt-BR"),
      author: "Vereadora Mariana Costa",
    };

    setItems([newItem, ...items]);
    setIsNewModalOpen(false);
    setCode("");
    setTitle("");
    setSummary("");
  };

  const getKindBadge = (kind: LegislativeItem["kind"]) => {
    switch (kind) {
      case "pl":
        return <Badge variant="green">Projeto de Lei</Badge>;
      case "requerimento":
        return <Badge variant="blue">Requerimento</Badge>;
      case "indicacao":
        return <Badge variant="amber">Indicação</Badge>;
      case "mocao":
        return <Badge variant="neutral">Moção</Badge>;
      case "emenda":
        return <Badge variant="red">Emenda</Badge>;
    }
  };

  const getStatusBadge = (status: LegislativeItem["status"]) => {
    switch (status) {
      case "tramitacao":
        return <Badge variant="amber">Em Tramitação</Badge>;
      case "comissoes":
        return <Badge variant="blue">Nas Comissões</Badge>;
      case "aprovado":
        return <Badge variant="green">Aprovado em Plenário</Badge>;
      case "sancionado":
        return <Badge variant="green">Sancionado / Lei</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Atuação Legislativa", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Propositura
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>
              <strong>Produção Legislativa do Mandato</strong> — Acompanhamento de Projetos de Lei, Requerimentos, Indicações e Emendas Parlamentares.
            </span>
          </div>
          <Badge variant="green">Ambiente Demonstração</Badge>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por número (PL 084/2026), ementa ou assunto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-line text-xs">
              <FilterChip label={`Todas (${items.length})`} active={filterKind === "all"} onClick={() => setFilterKind("all")} />
              <FilterChip label="Projetos de Lei" active={filterKind === "pl"} onClick={() => setFilterKind("pl")} />
              <FilterChip label="Requerimentos" active={filterKind === "requerimento"} onClick={() => setFilterKind("requerimento")} />
              <FilterChip label="Indicações" active={filterKind === "indicacao"} onClick={() => setFilterKind("indicacao")} />
              <FilterChip label="Moções" active={filterKind === "mocao"} onClick={() => setFilterKind("mocao")} />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Proposituras */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Identificação</Th>
                  <Th>Tipo</Th>
                  <Th>Ementa / Título</Th>
                  <Th>Situação na Câmara</Th>
                  <Th>Apresentação</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredItems.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <div className="font-mono font-bold text-ink text-sm">{item.code}</div>
                      <div className="text-[10px] text-muted">{item.author}</div>
                    </Td>
                    <Td>{getKindBadge(item.kind)}</Td>
                    <Td>
                      <div className="font-semibold text-ink text-xs">{item.title}</div>
                      <div className="text-[11px] text-muted line-clamp-1">{item.summary}</div>
                    </Td>
                    <Td>{getStatusBadge(item.status)}</Td>
                    <Td>
                      <span className="text-xs text-muted font-mono">{item.presentation_date}</span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Modal Nova Propositura */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Protocolar Nova Propositura Legislativa"
      >
        <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Número / Código *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex.: PL 095/2026"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tipo de Matéria *</label>
              <Select
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                options={[
                  { value: "pl", label: "Projeto de Lei (PL)" },
                  { value: "requerimento", label: "Requerimento" },
                  { value: "indicacao", label: "Indicação" },
                  { value: "mocao", label: "Moção" },
                  { value: "emenda", label: "Emenda" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Título da Propositura *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Dispõe sobre a transparência em contratos de zeladoria urbana"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Ementa / Resumo da Justificativa</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Síntese da matéria para publicação no boletim e portal da transparência..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Salvar Propositura
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
