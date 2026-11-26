"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClientShell } from "../../components/client-shell";
import { useOrganization } from "../../lib/tenant/context";
import { createClient } from "../../lib/supabase/client";
import {
  upsertLegislativeItem,
  toggleLegislativePortalVisibility,
  type DbLegislativeType,
} from "../../lib/actions/cabinet-management";
import {
  Card,
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
  SkeletonLoader,
} from "@gabinete360/ui";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Globe,
  Star,
  ExternalLink,
} from "lucide-react";

interface LegislativeRow {
  id: string;
  type: DbLegislativeType;
  number: string;
  year: number;
  title: string;
  summary: string;
  status: string;
  protocol_date?: string | null;
  official_source_url?: string | null;
  authorship?: string | null;
  is_public?: boolean;
  is_featured?: boolean;
  created_at: string;
}

export default function LegislativoPage() {
  const { organization, parliamentaryProfile, profile } = useOrganization();
  const [items, setItems] = useState<LegislativeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKind, setFilterKind] = useState("all");
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form
  const [numberCode, setNumberCode] = useState("");
  const [type, setType] = useState<DbLegislativeType>("bill_project");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("protocol_submitted");
  const [officialSourceUrl, setOfficialSourceUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const loadItems = useCallback(async () => {
    if (!organization?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("legislative_items")
        .select("*")
        .eq("organization_id", organization.id)
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(data as LegislativeRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      it.number.toLowerCase().includes(q) ||
      it.title.toLowerCase().includes(q) ||
      (it.summary || "").toLowerCase().includes(q);
    const matchKind = filterKind === "all" || it.type === filterKind;
    return matchSearch && matchKind;
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !numberCode.trim() || !organization?.id) return;
    setSaving(true);
    setFormError(null);

    try {
      const authorLabel =
        parliamentaryProfile?.full_name ||
        parliamentaryProfile?.legislator_name ||
        profile?.display_name ||
        organization.name;

      const res = await upsertLegislativeItem(organization.id, {
        type,
        number: numberCode,
        title,
        summary: summary || title,
        status,
        official_source_url: officialSourceUrl || null,
        authorship: authorLabel,
        is_public: isPublic,
        is_featured: isFeatured,
      });

      if (!res.success) {
        setFormError(res.error || "Não foi possível salvar a propositura.");
        return;
      }

      setIsNewModalOpen(false);
      setNumberCode("");
      setTitle("");
      setSummary("");
      setOfficialSourceUrl("");
      setIsPublic(true);
      setIsFeatured(false);
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublic = async (item: LegislativeRow) => {
    if (!organization?.id) return;
    const nextPublic = !item.is_public;
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, is_public: nextPublic } : row))
    );
    await toggleLegislativePortalVisibility(
      organization.id,
      item.id,
      nextPublic,
      nextPublic ? item.is_featured : false
    );
  };

  const handleToggleFeatured = async (item: LegislativeRow) => {
    if (!organization?.id) return;
    const nextFeatured = !item.is_featured;
    const nextPublic = nextFeatured ? true : Boolean(item.is_public);
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, is_featured: nextFeatured, is_public: nextPublic }
          : row
      )
    );
    await toggleLegislativePortalVisibility(
      organization.id,
      item.id,
      nextPublic,
      nextFeatured
    );
  };

  const getKindBadge = (itemType: DbLegislativeType) => {
    switch (itemType) {
      case "bill_project":
        return <Badge variant="green">Projeto de Lei</Badge>;
      case "decree":
        return <Badge variant="green">Decreto Legislativo</Badge>;
      case "resolution":
        return <Badge variant="blue">Resolução</Badge>;
      case "requirement":
        return <Badge variant="blue">Requerimento</Badge>;
      case "indication":
        return <Badge variant="amber">Indicação</Badge>;
      case "motion":
        return <Badge variant="neutral">Moção</Badge>;
      case "amendment":
        return <Badge variant="red">Emenda</Badge>;
      default:
        return <Badge variant="neutral">{itemType}</Badge>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "sanctioned":
      case "promulgated":
        return <Badge variant="green">Sancionado / Lei</Badge>;
      case "approved":
        return <Badge variant="green">Aprovado</Badge>;
      case "in_commission":
        return <Badge variant="blue">Nas Comissões</Badge>;
      case "protocol_submitted":
      case "protocol_confirmed":
        return <Badge variant="blue">Protocolado</Badge>;
      case "floor_vote":
      case "protocol_pending":
        return <Badge variant="amber">Em Tramitação</Badge>;
      case "draft":
        return <Badge variant="neutral">Rascunho</Badge>;
      default:
        return <Badge variant="neutral">{st}</Badge>;
    }
  };

  const defaultAuthor =
    parliamentaryProfile?.legislator_name || profile?.display_name || "Titular do Mandato";

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
            <FileSpreadsheet className="h-4 w-4 shrink-0" />
            <span>
              <strong>Produção Legislativa do Mandato</strong> — Proposituras marcadas como{" "}
              <strong>Públicas</strong> (e não rascunho) são exibidas automaticamente no Portal da Transparência.
            </span>
          </div>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por número (007/2025), ementa ou assunto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line text-xs">
              <FilterChip
                label={`Todas (${items.length})`}
                active={filterKind === "all"}
                onClick={() => setFilterKind("all")}
              />
              <FilterChip
                label="Projetos / PDL"
                active={filterKind === "bill_project"}
                onClick={() => setFilterKind("bill_project")}
              />
              <FilterChip
                label="Requerimentos"
                active={filterKind === "requirement"}
                onClick={() => setFilterKind("requirement")}
              />
              <FilterChip
                label="Indicações"
                active={filterKind === "indication"}
                onClick={() => setFilterKind("indication")}
              />
              <FilterChip
                label="Moções"
                active={filterKind === "motion"}
                onClick={() => setFilterKind("motion")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Proposituras */}
        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                <SkeletonLoader variant="table-row" count={5} />
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Identificação</Th>
                    <Th>Tipo</Th>
                    <Th>Ementa / Título</Th>
                    <Th>Situação</Th>
                    <Th>Portal Público</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredItems.length === 0 ? (
                    <Tr>
                      <Td colSpan={5} className="py-10 text-center text-xs text-muted">
                        Nenhuma propositura encontrada para este gabinete.
                      </Td>
                    </Tr>
                  ) : (
                    filteredItems.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          <div className="font-mono font-bold text-ink text-sm">{item.number}</div>
                          <div className="text-[10px] text-muted">
                            {item.authorship || defaultAuthor}
                          </div>
                        </Td>
                        <Td>{getKindBadge(item.type)}</Td>
                        <Td>
                          <div className="font-semibold text-ink text-xs flex items-center gap-1.5">
                            <span>{item.title}</span>
                            {item.official_source_url && (
                              <a
                                href={item.official_source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green hover:opacity-80"
                                title="Abrir fonte oficial"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-muted line-clamp-1">{item.summary}</div>
                        </Td>
                        <Td>{getStatusBadge(item.status)}</Td>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePublic(item)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                                item.is_public
                                  ? "bg-mint/40 border-green/30 text-green"
                                  : "bg-paper border-line text-muted hover:text-ink"
                              }`}
                              title="Alternar exibição no Portal Público"
                            >
                              <Globe className="h-3 w-3" />
                              {item.is_public ? "Público" : "Interno"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(item)}
                              className={`p-1 rounded border transition-colors ${
                                item.is_featured
                                  ? "bg-amber-50 border-amber-300 text-amber-600"
                                  : "bg-paper border-line text-muted hover:text-ink"
                              }`}
                              title="Destacar na capa do Portal Público"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            )}
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
          {formError && (
            <div className="p-2.5 rounded border border-red/30 bg-red/5 text-red">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Número / Código *</label>
              <Input
                value={numberCode}
                onChange={(e) => setNumberCode(e.target.value)}
                placeholder="Ex.: 034/2026"
                required
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tipo de Matéria *</label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as DbLegislativeType)}
                options={[
                  { value: "bill_project", label: "Projeto de Lei (PL)" },
                  { value: "decree", label: "Decreto Legislativo (PDL)" },
                  { value: "resolution", label: "Projeto de Resolução" },
                  { value: "requirement", label: "Requerimento" },
                  { value: "indication", label: "Indicação" },
                  { value: "motion", label: "Moção" },
                  { value: "amendment", label: "Emenda" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Situação na Casa *</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: "draft", label: "Rascunho Interno" },
                  { value: "protocol_submitted", label: "Protocolado" },
                  { value: "in_commission", label: "Nas Comissões" },
                  { value: "floor_vote", label: "Em Plenário" },
                  { value: "approved", label: "Aprovado" },
                  { value: "sanctioned", label: "Sancionado / Lei" },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">URL Oficial (SAPL)</label>
              <Input
                value={officialSourceUrl}
                onChange={(e) => setOfficialSourceUrl(e.target.value)}
                placeholder="https://sapl..."
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Título da Propositura *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Pavimentação e recuperação de estrada rural"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Ementa / Resumo da Justificativa *</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Síntese da matéria para publicação no portal da transparência..."
              rows={3}
              required
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="accent-[#176B52]"
              />
              <span>Publicar no Portal da Transparência</span>
            </label>
            <label className="flex items-center gap-2 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-[#176B52]"
              />
              <span>Destacar na página inicial do Portal</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Propositura"}
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
