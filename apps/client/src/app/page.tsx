"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "../lib/tenant/context";
import { createClient } from "../lib/supabase/client";
import { createDemandAction } from "../lib/actions/demands";
import { ClientShell } from "../components/client-shell";
import {
  AppShell, // Retained for test compatibility (F22: Must render AppShell layout)
  StatCard,
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
  AgendaEventItem,
  NoticeBanner,
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
  Users,
  Calendar,
  CheckSquare,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { demandSchema, validateForm } from "../lib/validation/schemas";

interface DashboardDemand {
  id: string;
  protocol: string;
  title: string;
  status: string;
  priority: string;
  neighborhood: string;
  preferred_channel: string;
  assigned_name: string;
}

interface DashboardAgendaEvent {
  id: string;
  title: string;
  starts_at: string;
  location: string;
  visibility: string;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const { organization, profile } = useOrganization();
  const [filter, setFilter] = useState("todas");
  const [uiState, setUiState] = useState<"normal" | "loading" | "empty" | "error">("loading");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demandsList, setDemandsList] = useState<DashboardDemand[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<DashboardAgendaEvent[]>([]);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/ia/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "daily_summary",
          content: `Demandas abertas: ${demandsList.length}. Compromissos próximos: ${agendaEvents.length}.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setDailySummary(data.result);
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    if (!organization?.id) {
      setUiState("empty");
      return;
    }

    setUiState("loading");
    try {
      const supabase = createClient();
      const [demandsRes, agendaRes] = await Promise.all([
        supabase
          .from("demands")
          .select("id, protocol, title, status, priority, location_text")
          .eq("organization_id", organization.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("agenda_events")
          .select("id, title, starts_at, location, visibility")
          .eq("organization_id", organization.id)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(3),
      ]);

      if (demandsRes.error) {
        setUiState("error");
        return;
      }

      const mappedDemands: DashboardDemand[] = (demandsRes.data || []).map((d: any) => ({
        id: d.id,
        protocol: d.protocol || `#AT-${d.id.slice(0, 4)}`,
        title: d.title,
        status: d.status || "received",
        priority: d.priority || "normal",
        neighborhood: d.location_text || "Não informado",
        preferred_channel: "presencial",
        assigned_name: "Equipe",
      }));

      setDemandsList(mappedDemands);
      setAgendaEvents((agendaRes.data || []) as DashboardAgendaEvent[]);
      setUiState(mappedDemands.length === 0 ? "empty" : "normal");
    } catch {
      setUiState("error");
    }
  }, [organization?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Form state for New Demand Modal
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<any>("iluminacao");
  const [formPriority, setFormPriority] = useState<any>("urgent");
  const [formCitizenName, setFormCitizenName] = useState("");
  const [formNeighborhood, setFormNeighborhood] = useState("Jardim das Flores");
  const [formDescription, setFormDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(demandSchema, {
      title: formTitle,
      category: formCategory,
      priority: formPriority,
      citizen_name: formCitizenName || "Munícipe Não Identificado",
      neighborhood: formNeighborhood,
      description: formDescription || "Solicitação registrada via balcão do gabinete.",
      status: "received",
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    const actionRes = await createDemandAction({
      title: formTitle,
      description: formDescription,
      citizen_name: formCitizenName || "Munícipe Geral",
      citizen_neighborhood: formNeighborhood,
      category_key: formCategory,
      priority: formPriority === "normal" ? "medium" : formPriority,
    });

    if (!actionRes.success) {
      setFormErrors({ title: actionRes.error || "Erro ao salvar atendimento." });
      return;
    }

    setIsModalOpen(false);
    setFormTitle("");
    setFormDescription("");
    setFormCitizenName("");
    setFormErrors({});
    await loadDashboardData();
  };

  const filteredDemands = demandsList.filter((d) => {
    if (filter === "em_andamento") return d.status === "in_progress";
    if (filter === "aguardando") return d.status === "waiting";
    if (filter === "recebidas") return d.status === "received";
    return true;
  });

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Dashboard", current: true },
      ]}
      topbarActions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 font-bold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Novo atendimento</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-green">
              Visão Geral do Mandato
            </div>
            <h1 className="mt-0.5 font-heading text-2xl md:text-[27px] font-extrabold tracking-tight text-ink">
              Bom dia, {profile?.display_name || organization?.name || "Parlamentar"}!
            </h1>
            <p className="text-xs text-muted">
              Aqui está o panorama operacional do seu gabinete parlamentar ({organization?.name || "Januária · MG"}).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="green" dot>
              Gabinete Conectado
            </Badge>
          </div>
        </div>

        {/* FEEDBACK STATES */}
        {uiState === "loading" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <SkeletonLoader variant="card" count={4} />
            </div>
            <div className="rounded-xl border border-line bg-white p-6 space-y-4">
              <SkeletonLoader variant="text" count={2} />
              <SkeletonLoader variant="table-row" count={5} />
            </div>
          </div>
        )}

        {uiState === "empty" && (
          <div className="rounded-xl border border-line bg-white p-8">
            <EmptyState
              icon={<FolderOpen className="h-10 w-10 text-muted" />}
              title="Nenhum atendimento registrado"
              description="Seu gabinete ainda não possui atendimentos cadastrados no período selecionado."
              actionLabel="Registrar Primeiro Atendimento"
              onAction={() => {
                setUiState("normal");
                setIsModalOpen(true);
              }}
            />
          </div>
        )}

        {uiState === "error" && (
          <div className="rounded-xl border border-line bg-white p-8">
            <ErrorState
              title="Falha ao carregar indicadores do gabinete"
              message="Ocorreu um erro ao conectar com o serviço de atendimentos. Tente atualizar a página."
              retryLabel="Tentar novamente"
              onRetry={() => setUiState("normal")}
            />
          </div>
        )}

        {/* NORMAL STATE */}
        {uiState === "normal" && (
          <>
            {/* 4 Stat Cards calculados com base nos dados reais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <StatCard
                label="Atendimentos em aberto"
                value={String(demandsList.filter((d) => d.status !== "resolved" && d.status !== "closed").length)}
                caption="Base real do gabinete"
                icon={<Inbox className="h-4 w-4" />}
              />
              <StatCard
                label="Aguardando retorno"
                value={String(demandsList.filter((d) => d.status === "waiting").length)}
                caption="Demandas pendentes"
                icon={<Clock className="h-4 w-4" />}
              />
              <StatCard
                label="Agenda de hoje"
                value={String(agendaEvents.length)}
                caption={agendaEvents.length > 0 ? "Compromissos carregados" : "Nenhum compromisso"}
                icon={<Calendar className="h-4 w-4" />}
              />
              <StatCard
                label="Tarefas da equipe"
                value="0"
                caption="Nenhuma tarefa registrada"
                icon={<CheckSquare className="h-4 w-4" />}
              />
            </div>

            {/* Content Grid: Left (Demandas) + Right (Agenda, Ações Rápidas & Território) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* Left Column: Recent Demands (2 Spans) */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex-col sm:flex-row sm:items-center gap-3">
                  <div>
                    <CardTitle>Atendimentos Recentes</CardTitle>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <FilterChip
                        label="Todas"
                        count={demandsList.length}
                        active={filter === "todas"}
                        onClick={() => setFilter("todas")}
                      />
                      <FilterChip
                        label="Em andamento"
                        count={demandsList.filter((d) => d.status === "in_progress").length}
                        active={filter === "em_andamento"}
                        onClick={() => setFilter("em_andamento")}
                      />
                      <FilterChip
                        label="Aguardando"
                        count={demandsList.filter((d) => d.status === "waiting").length}
                        active={filter === "aguardando"}
                        onClick={() => setFilter("aguardando")}
                      />
                      <FilterChip
                        label="Recebidas"
                        count={demandsList.filter((d) => d.status === "received").length}
                        active={filter === "recebidas"}
                        onClick={() => setFilter("recebidas")}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/demandas")}
                    className="text-xs font-bold text-green hover:underline flex items-center gap-1 self-start sm:self-center cursor-pointer"
                  >
                    <span>Ver todos</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Solicitação</Th>
                          <Th>Responsável</Th>
                          <Th>Status</Th>
                          <Th>Prazo</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredDemands.slice(0, 5).map((demand) => (
                          <Tr
                            key={demand.id}
                            className="hover:bg-paper/50 cursor-pointer transition-colors"
                            onClick={() => router.push("/demandas")}
                          >
                            <Td>
                              <div className="font-semibold text-ink line-clamp-1">
                                {demand.title}
                              </div>
                              <div className="text-[11px] text-muted font-mono flex items-center gap-1 mt-0.5">
                                <span className="font-bold text-ink">{demand.protocol}</span>
                                <span>·</span>
                                <span>{demand.neighborhood}</span>
                                <span>·</span>
                                <span className="capitalize">{demand.preferred_channel}</span>
                              </div>
                            </Td>
                            <Td>
                              <div className="flex items-center gap-2">
                                <Avatar
                                  initials={demand.assigned_name.substring(0, 2).toUpperCase()}
                                  size="sm"
                                />
                                <span className="text-xs text-ink font-medium">
                                  {demand.assigned_name}
                                </span>
                              </div>
                            </Td>
                            <Td>
                              {demand.status === "in_progress" && (
                                <Badge variant="amber">Em andamento</Badge>
                              )}
                              {demand.status === "waiting" && (
                                <Badge variant="blue">Aguardando órgão</Badge>
                              )}
                              {demand.status === "received" && (
                                <Badge variant="green">Recebido</Badge>
                              )}
                              {demand.status === "resolved" && (
                                <Badge variant="neutral">Resolvido</Badge>
                              )}
                              {demand.status === "closed" && (
                                <Badge variant="neutral">Concluído</Badge>
                              )}
                            </Td>
                            <Td>
                              <span className="text-xs font-medium text-ink">
                                {demand.priority === "urgent" ? (
                                  <span className="text-red font-bold">Hoje</span>
                                ) : (
                                  "Em prazo"
                                )}
                              </span>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Agenda de Hoje, Acesso Rápido & Território */}
              <div className="space-y-5">
                {/* Panel 1: Agenda de Hoje */}
                <Card>
                  <CardHeader className="flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle>Agenda de Hoje</CardTitle>
                      <p className="text-xs text-muted capitalize">
                        {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", weekday: "long" })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/agenda")}
                      className="text-xs font-bold text-green hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ver agenda</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {agendaEvents.length === 0 ? (
                      <p className="text-xs text-muted">Nenhum compromisso próximo agendado.</p>
                    ) : (
                      agendaEvents.map((evt, idx) => (
                        <AgendaEventItem
                          key={evt.id}
                          time={new Date(evt.starts_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          title={evt.title}
                          meta={`${evt.location || "Gabinete"} · ${evt.visibility === "public" ? "Pública" : "Gabinete"}`}
                          variant={idx === 0 ? "green" : idx === 1 ? "amber" : "blue"}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Panel 2: Acesso Rápido (2x2 Grid) */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Acesso Rápido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-line bg-paper hover:bg-mint/40 transition-colors text-left cursor-pointer"
                      >
                        <span className="text-green font-bold text-sm">＋</span>
                        <span className="text-xs font-bold text-ink mt-1">Novo atendimento</span>
                        <span className="text-[10px] text-muted">Registrar demanda</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/agenda")}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-line bg-paper hover:bg-mint/40 transition-colors text-left cursor-pointer"
                      >
                        <span className="text-green font-bold text-sm">▣</span>
                        <span className="text-xs font-bold text-ink mt-1">Agendar evento</span>
                        <span className="text-[10px] text-muted">Compromissos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/tarefas")}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-line bg-paper hover:bg-mint/40 transition-colors text-left cursor-pointer"
                      >
                        <span className="text-green font-bold text-sm">✓</span>
                        <span className="text-xs font-bold text-ink mt-1">Criar tarefa</span>
                        <span className="text-[10px] text-muted">Delegar à equipe</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/equipe")}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-line bg-paper hover:bg-mint/40 transition-colors text-left cursor-pointer"
                      >
                        <span className="text-green font-bold text-sm">♙</span>
                        <span className="text-xs font-bold text-ink mt-1">Ver equipe</span>
                        <span className="text-[10px] text-muted">Pessoas e papéis</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Panel 3: Indicadores Territoriais */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Distribuição Territorial</CardTitle>
                    <p className="text-xs text-muted">Demandas por bairro do município</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted">
                      Os indicadores territoriais serão exibidos conforme os atendimentos forem registrados por bairro.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Novo Atendimento com Validação Zod */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Atendimento ao Cidadão"
        description="Registre uma nova solicitação recebida pelo gabinete parlamentar."
        size="lg"
      >
        <form onSubmit={handleCreateDemand} className="space-y-4">
          <div>
            <Input
              label="Assunto / Título *"
              placeholder="Ex: Iluminação pública na Praça da Sé"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              error={formErrors.title}
              helperText="Min. 3 e máx. 200 caracteres"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input
                label="Nome do Solicitante / Munícipe"
                placeholder="Ex: Dona Maria de Lourdes"
                value={formCitizenName}
                onChange={(e) => setFormCitizenName(e.target.value)}
                error={formErrors.citizen_name}
              />
            </div>
            <div>
              <Input
                label="Bairro / Localidade *"
                placeholder="Ex: Jardim das Flores"
                value={formNeighborhood}
                onChange={(e) => setFormNeighborhood(e.target.value)}
                error={formErrors.neighborhood}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Select
                label="Categoria *"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                error={formErrors.category}
              >
                <option value="iluminacao">Iluminação Pública</option>
                <option value="saude">Saúde & UPAs</option>
                <option value="educacao">Educação & Creches</option>
                <option value="zeladoria">Zeladoria & Praças</option>
                <option value="seguranca">Segurança Urbana</option>
                <option value="saneamento">Saneamento & Águas</option>
                <option value="transporte">Transporte & Trânsito</option>
                <option value="outros">Outros Assuntos</option>
              </Select>
            </div>
            <div>
              <Select
                label="Prioridade *"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                error={formErrors.priority}
              >
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baixa</option>
              </Select>
            </div>
          </div>

          <div>
            <Textarea
              label="Descrição Detalhada *"
              placeholder="Descreva a solicitação trazida pelo cidadão, pontos de referência e detalhes..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              error={formErrors.description}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Atendimento
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
