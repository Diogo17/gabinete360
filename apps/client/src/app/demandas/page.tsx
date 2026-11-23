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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Modal,
  Input,
  Textarea,
  Select,
  SkeletonLoader,
  EmptyState,
  ErrorState,
} from "@gabinete360/ui";
import {
  Inbox,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  User,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  DEMO_DEMANDS,
  generateNextProtocol,
  type DemoDemand,
} from "../../lib/mock-data";
import { demandSchema, validateForm } from "../../lib/validation/schemas";

export default function DemandasPage() {
  const [demands, setDemands] = useState<DemoDemand[]>(DEMO_DEMANDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uiState, setUiState] = useState<"normal" | "loading" | "empty" | "error">("normal");
  const [selectedDemand, setSelectedDemand] = useState<DemoDemand | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [neighborhood, setNeighborhood] = useState("Jardim das Flores");
  const [category, setCategory] = useState("iluminacao");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredDemands = demands.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.protocol.toLowerCase().includes(search.toLowerCase()) ||
      d.citizen_name.toLowerCase().includes(search.toLowerCase()) ||
      d.neighborhood.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (d.status === "received" || d.status === "in_progress" || d.status === "waiting")) ||
      (statusFilter === "resolved" && d.status === "resolved") ||
      d.status === statusFilter;

    const matchCategory = categoryFilter === "all" || d.category === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(demandSchema, {
      title,
      category,
      priority,
      citizen_name: citizenName || "Munícipe Não Identificado",
      neighborhood,
      description: description || "Solicitação registrada no gabinete.",
      status: "received",
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    const newDemand: DemoDemand = {
      id: `dem-${Date.now()}`,
      organization_id: "org-gabinete-mariana",
      workspace_id: "wks-santos-01",
      protocol: generateNextProtocol(),
      citizen_name: citizenName || "Munícipe Geral",
      preferred_channel: "whatsapp",
      title,
      description,
      category: category as any,
      priority: priority as any,
      status: "received",
      classification: "public",
      neighborhood,
      location_text: neighborhood,
      assigned_to: "usr-ana-souza",
      assigned_name: "Ana Souza",
      due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      events: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDemands([newDemand, ...demands]);
    setIsNewModalOpen(false);
    setTitle("");
    setCitizenName("");
    setDescription("");
    setFormErrors({});
  };

  const handleStatusChange = (id: string, newStatus: DemoDemand["status"]) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus, updated_at: new Date().toISOString() } : d))
    );
    if (selectedDemand && selectedDemand.id === id) {
      setSelectedDemand((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getStatusBadge = (status: DemoDemand["status"]) => {
    switch (status) {
      case "received":
        return <Badge variant="green">Recebido</Badge>;
      case "in_progress":
        return <Badge variant="amber">Em andamento</Badge>;
      case "waiting":
        return <Badge variant="blue">Aguardando órgão</Badge>;
      case "resolved":
        return <Badge variant="green">Concluído</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: DemoDemand["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="red">Urgente</Badge>;
      case "high":
        return <Badge variant="red">Alta</Badge>;
      case "medium":
      case "normal":
        return <Badge variant="amber">Média</Badge>;
      case "low":
        return <Badge variant="neutral">Baixa</Badge>;
      default:
        return null;
    }
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Atendimentos e Demandas", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Atendimento
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Banner de Demonstração */}
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span>
              <strong>Módulo de Demandas e Atendimentos</strong> — Gestão centralizada de solicitações de munícipes com protocolos auditáveis.
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted">Alternar estado UI:</span>
            <Button size="sm" variant={uiState === "normal" ? "secondary" : "ghost"} onClick={() => setUiState("normal")}>
              Normal
            </Button>
            <Button size="sm" variant={uiState === "loading" ? "secondary" : "ghost"} onClick={() => setUiState("loading")}>
              Carregando
            </Button>
            <Button size="sm" variant={uiState === "empty" ? "secondary" : "ghost"} onClick={() => setUiState("empty")}>
              Vazio
            </Button>
            <Button size="sm" variant={uiState === "error" ? "secondary" : "ghost"} onClick={() => setUiState("error")}>
              Erro
            </Button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Pesquisar por assunto, munícipe, protocolo (#AT-...) ou bairro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-line rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="iluminacao">Iluminação Pública</option>
                  <option value="saude">Saúde / UBS</option>
                  <option value="educacao">Educação / Escolas</option>
                  <option value="zeladoria">Zeladoria / Pavimentação</option>
                  <option value="saneamento">Saneamento Básico</option>
                  <option value="transporte">Transporte / Trânsito</option>
                  <option value="seguranca">Segurança</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-line overflow-x-auto text-xs">
              <span className="text-muted font-medium mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Status:
              </span>
              <FilterChip label={`Todas (${demands.length})`} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
              <FilterChip
                label={`Pendentes (${demands.filter((d) => d.status === "received" || d.status === "in_progress" || d.status === "waiting").length})`}
                active={statusFilter === "pending"}
                onClick={() => setStatusFilter("pending")}
              />
              <FilterChip
                label={`Em Andamento (${demands.filter((d) => d.status === "in_progress").length})`}
                active={statusFilter === "in_progress"}
                onClick={() => setStatusFilter("in_progress")}
              />
              <FilterChip
                label={`Aguardando Órgão (${demands.filter((d) => d.status === "waiting").length})`}
                active={statusFilter === "waiting"}
                onClick={() => setStatusFilter("waiting")}
              />
              <FilterChip
                label={`Concluídas (${demands.filter((d) => d.status === "resolved").length})`}
                active={statusFilter === "resolved"}
                onClick={() => setStatusFilter("resolved")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estados Especiais */}
        {uiState === "loading" && (
          <div className="space-y-3">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        )}

        {uiState === "empty" && (
          <EmptyState
            title="Nenhum atendimento encontrado"
            description="Não há demandas registradas com os filtros selecionados ou no gabinete atual."
            actionLabel="Criar Nova Demanda"
            onAction={() => setIsNewModalOpen(true)}
          />
        )}

        {uiState === "error" && (
          <ErrorState
            title="Falha ao carregar atendimentos"
            message="Ocorreu um erro ao sincronizar com a base operacional. Tente novamente."
            retryLabel="Tentar Novamente"
            onRetry={() => setUiState("normal")}
          />
        )}

        {/* Tabela Principal */}
        {uiState === "normal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={selectedDemand ? "lg:col-span-2" : "lg:col-span-3"}>
              <Card>
                <CardHeader className="py-3 px-4 border-b border-line flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Lista de Atendimentos ({filteredDemands.length})
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Protocolo / Assunto</Th>
                        <Th>Munícipe / Bairro</Th>
                        <Th>Prioridade</Th>
                        <Th>Responsável</Th>
                        <Th>Status</Th>
                        <Th className="text-right">Ação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredDemands.map((demand) => (
                        <Tr
                          key={demand.id}
                          className={`cursor-pointer hover:bg-paper/50 ${
                            selectedDemand?.id === demand.id ? "bg-mint/30 font-medium" : ""
                          }`}
                          onClick={() => setSelectedDemand(demand)}
                        >
                          <Td>
                            <div className="font-semibold text-ink text-sm">{demand.title}</div>
                            <div className="text-xs text-muted font-mono">{demand.protocol}</div>
                          </Td>
                          <Td>
                            <div className="text-xs text-ink font-medium">{demand.citizen_name}</div>
                            <div className="text-[11px] text-muted flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {demand.neighborhood}
                            </div>
                          </Td>
                          <Td>{getPriorityBadge(demand.priority)}</Td>
                          <Td>
                            <div className="flex items-center gap-1.5 text-xs">
                              <Avatar name={demand.assigned_name || "Ana Souza"} size="xs" />
                              <span>{demand.assigned_name || "Ana Souza"}</span>
                            </div>
                          </Td>
                          <Td>{getStatusBadge(demand.status)}</Td>
                          <Td className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDemand(demand);
                              }}
                            >
                              Ver Detalhes
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* Painel Lateral de Detalhes da Demanda Selecionada */}
            {selectedDemand && (
              <div className="lg:col-span-1">
                <Card className="sticky top-20 border-green/30 shadow-sm">
                  <CardHeader className="py-3 px-4 border-b border-line bg-mint/20 flex flex-row items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-green font-bold">{selectedDemand.protocol}</div>
                      <CardTitle className="text-sm font-semibold text-ink">{selectedDemand.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDemand(null)}>
                      ✕
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="text-muted font-medium mb-1">Status do Atendimento:</div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedDemand.status)}
                        {getPriorityBadge(selectedDemand.priority)}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted font-medium mb-1">Descrição do Munícipe:</div>
                      <p className="p-2.5 bg-paper rounded border border-line text-ink leading-relaxed">
                        {selectedDemand.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-paper rounded border border-line">
                        <span className="text-muted block text-[10px]">Munícipe:</span>
                        <strong className="text-ink">{selectedDemand.citizen_name}</strong>
                      </div>
                      <div className="p-2 bg-paper rounded border border-line">
                        <span className="text-muted block text-[10px]">Localidade:</span>
                        <strong className="text-ink">{selectedDemand.neighborhood}</strong>
                      </div>
                      <div className="p-2 bg-paper rounded border border-line">
                        <span className="text-muted block text-[10px]">Responsável:</span>
                        <strong className="text-ink">{selectedDemand.assigned_name || "Ana Souza"}</strong>
                      </div>
                      <div className="p-2 bg-paper rounded border border-line">
                        <span className="text-muted block text-[10px]">Categoria:</span>
                        <strong className="text-ink capitalize">{selectedDemand.category}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line space-y-2">
                      <div className="text-muted font-medium text-[11px]">Ações Rápidas:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange(selectedDemand.id, "in_progress")}
                        >
                          Em Andamento
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange(selectedDemand.id, "waiting")}
                        >
                          Aguardar Órgão
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="col-span-2"
                          onClick={() => handleStatusChange(selectedDemand.id, "resolved")}
                        >
                          Marcar como Concluída
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criação de Atendimento */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Registrar Novo Atendimento"
      >
        <form onSubmit={handleCreateDemand} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Assunto / Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Solicitação de recapeamento na Av. Brasil"
              error={formErrors.title}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Nome do Munícipe *</label>
              <Input
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="Ex.: Carlos Alberto Souza"
                error={formErrors.citizen_name}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Bairro / Região *</label>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex.: Jardim das Flores"
                error={formErrors.neighborhood}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Categoria *</label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: "iluminacao", label: "Iluminação Pública" },
                  { value: "saude", label: "Saúde / Posto" },
                  { value: "educacao", label: "Educação / Creche" },
                  { value: "zeladoria", label: "Zeladoria / Limpeza" },
                  { value: "saneamento", label: "Saneamento / Esgoto" },
                  { value: "transporte", label: "Transporte / Trânsito" },
                  { value: "seguranca", label: "Segurança Comunitária" },
                  { value: "outros", label: "Outros" },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Prioridade *</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: "low", label: "Baixa" },
                  { value: "normal", label: "Normal" },
                  { value: "medium", label: "Média" },
                  { value: "high", label: "Alta" },
                  { value: "urgent", label: "Urgente" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Descrição Detalhada</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a reivindicação do munícipe, ponto de referência e encaminhamento prévio..."
              rows={3}
              error={formErrors.description}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Salvar Atendimento
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
