"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  NoticeBanner,
  Input,
  Textarea,
  Select,
} from "@gabinete360/ui";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
  Server,
  Layers,
  Users,
  Shield,
  ExternalLink,
  FolderTree,
  Filter,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";
import { upsertConnectionConfig, addLegislativeItemFromMaster } from "../../lib/actions/connections";

interface OrganizationTreeItem {
  id: string;
  name: string;
  kind: "chamber" | "individual";
  slug: string;
  city: string;
  state: string;
  status: "active" | "provisioning" | "suspended";
  runtimeRef: string;
  cabinetsCount: number;
  workspaces: {
    id: string;
    name: string;
    kind: "cabinet" | "committee" | "leadership" | "presidency";
    parliamentarian?: string;
    membersCount: number;
    activeModulesCount: number;
    status: "active" | "setup";
  }[];
}

const INITIAL_ORGS: OrganizationTreeItem[] = [
  {
    id: "org-1",
    name: "Câmara Municipal de Santos",
    kind: "chamber",
    slug: "camara-santos",
    city: "Santos",
    state: "SP",
    status: "active",
    runtimeRef: "supabase-op-santos-prd",
    cabinetsCount: 21,
    workspaces: [
      {
        id: "ws-101",
        name: "Presidência da Câmara",
        kind: "presidency",
        parliamentarian: "Ver. Roberto Martins (Presidente)",
        membersCount: 8,
        activeModulesCount: 10,
        status: "active",
      },
      {
        id: "ws-102",
        name: "Gabinete Ver. Carlos Eduardo",
        kind: "cabinet",
        parliamentarian: "Ver. Carlos Eduardo",
        membersCount: 6,
        activeModulesCount: 8,
        status: "active",
      },
      {
        id: "ws-103",
        name: "Gabinete Ver. Ana Beatriz Ramos",
        kind: "cabinet",
        parliamentarian: "Ver. Ana Beatriz Ramos",
        membersCount: 5,
        activeModulesCount: 8,
        status: "active",
      },
      {
        id: "ws-104",
        name: "Comissão de Constituição e Justiça (CCJ)",
        kind: "committee",
        parliamentarian: "Colegiado Técnico",
        membersCount: 4,
        activeModulesCount: 4,
        status: "active",
      },
      {
        id: "ws-105",
        name: "Comissão de Finanças e Orçamento",
        kind: "committee",
        parliamentarian: "Colegiado Técnico",
        membersCount: 4,
        activeModulesCount: 4,
        status: "active",
      },
    ],
  },
  {
    id: "org-2",
    name: "Câmara Municipal de Campinas",
    kind: "chamber",
    slug: "camara-campinas",
    city: "Campinas",
    state: "SP",
    status: "provisioning",
    runtimeRef: "supabase-op-campinas-stg",
    cabinetsCount: 33,
    workspaces: [
      {
        id: "ws-201",
        name: "Presidência da Câmara Municipal",
        kind: "presidency",
        parliamentarian: "Mesa Diretora 2025/2026",
        membersCount: 12,
        activeModulesCount: 11,
        status: "setup",
      },
      {
        id: "ws-202",
        name: "Gabinete Ver. Paulo Camargo",
        kind: "cabinet",
        parliamentarian: "Ver. Paulo Camargo",
        membersCount: 7,
        activeModulesCount: 7,
        status: "setup",
      },
      {
        id: "ws-203",
        name: "Gabinete Ver. Juliana Meirelles",
        kind: "cabinet",
        parliamentarian: "Ver. Juliana Meirelles",
        membersCount: 6,
        activeModulesCount: 7,
        status: "setup",
      },
    ],
  },
  {
    id: "org-3",
    name: "Gabinete Ver. Mariana Costa",
    kind: "individual",
    slug: "mariana-costa",
    city: "Belo Horizonte",
    state: "MG",
    status: "active",
    runtimeRef: "supabase-op-mariana-prd",
    cabinetsCount: 1,
    workspaces: [
      {
        id: "ws-301",
        name: "Gabinete Parlamentar Mariana Costa",
        kind: "cabinet",
        parliamentarian: "Ver. Mariana Costa",
        membersCount: 7,
        activeModulesCount: 9,
        status: "active",
      },
    ],
  },
  {
    id: "org-4",
    name: "Gabinete Dep. Roberto Silveira",
    kind: "individual",
    slug: "roberto-silveira",
    city: "Curitiba",
    state: "PR",
    status: "active",
    runtimeRef: "supabase-op-rsilveira-prd",
    cabinetsCount: 1,
    workspaces: [
      {
        id: "ws-401",
        name: "Gabinete Parlamentar Dep. Roberto Silveira",
        kind: "cabinet",
        parliamentarian: "Dep. Estadual Roberto Silveira",
        membersCount: 11,
        activeModulesCount: 6,
        status: "active",
      },
    ],
  },
  {
    id: "org-5",
    name: "Câmara Municipal de Niterói",
    kind: "chamber",
    slug: "camara-niteroi",
    city: "Niterói",
    state: "RJ",
    status: "active",
    runtimeRef: "supabase-op-niteroi-prd",
    cabinetsCount: 18,
    workspaces: [
      {
        id: "ws-501",
        name: "Presidência CM Niterói",
        kind: "presidency",
        parliamentarian: "Ver. Milton Cal",
        membersCount: 9,
        activeModulesCount: 10,
        status: "active",
      },
      {
        id: "ws-502",
        name: "Gabinete Ver. Benny Briolly",
        kind: "cabinet",
        parliamentarian: "Ver. Benny Briolly",
        membersCount: 6,
        activeModulesCount: 8,
        status: "active",
      },
    ],
  },
];

export default function OrganizationsManagementPage() {
  const [orgs] = useState<OrganizationTreeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "chamber" | "individual">("all");
  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({
    "org-1": true,
    "org-3": true,
  });
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    orgName: string;
    ws: OrganizationTreeItem["workspaces"][0];
  } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrgs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = kindFilter === "all" || org.kind === kindFilter;
    return matchesSearch && matchesKind;
  });

  return (
    <MasterShell
      title="Gestão de Organizações & Topologia de Gabinetes"
      subtitle="Hierarquia institucional: Câmaras Municipais (multi-gabinetes) e Gabinetes Individuais no Control Plane"
      badgeText="Topologia Multi-Tenant"
    >
      <NoticeBanner variant="institutional">
        <strong>Estrutura Hierárquica:</strong> Uma organização do tipo <em>Câmara Municipal</em> agrupa múltiplos gabinetes e comissões isolados logicamente com controle de acesso independente.
      </NoticeBanner>

      {/* Filter and Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Total de Organizações</div>
            <div className="text-2xl font-bold font-heading text-ink">{orgs.length}</div>
            <div className="text-[11px] text-muted">3 Câmaras · 2 Gabinetes Isolados</div>
          </div>
          <Building2 className="h-8 w-8 text-green/60" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Gabinetes & Workspaces</div>
            <div className="text-2xl font-bold font-heading text-ink">74</div>
            <div className="text-[11px] text-green font-semibold">100% isolamento RLS</div>
          </div>
          <FolderTree className="h-8 w-8 text-green/60" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Ambientes de Banco de Dados</div>
            <div className="text-2xl font-bold font-heading text-ink">5 Instâncias</div>
            <div className="text-[11px] text-muted">Projetos Supabase Dedicados</div>
          </div>
          <Server className="h-8 w-8 text-green/60" />
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar organização, cidade ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full pl-9 pr-4 rounded-md border border-line bg-white text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as "all" | "chamber" | "individual")}
                className="h-10 rounded-md border border-line bg-white px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green"
              >
                <option value="all">Todas as Topologias</option>
                <option value="chamber">Câmaras Municipais (Multi-Gabinetes)</option>
                <option value="individual">Gabinetes Individuais</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree / Hierarchy View */}
      <div className="space-y-4">
        {filteredOrgs.map((org) => {
          const isExpanded = expandedOrgs[org.id] ?? false;

          return (
            <Card key={org.id} className="overflow-hidden border border-line">
              {/* Organization Header Bar */}
              <div
                onClick={() => toggleExpand(org.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-paper/30 hover:bg-paper/70 cursor-pointer transition-colors border-b border-line"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-1 rounded-sm text-muted hover:text-ink hover:bg-white transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-green" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-sm text-ink">{org.name}</h3>
                      <Badge variant={org.kind === "chamber" ? "blue" : "neutral"}>
                        {org.kind === "chamber" ? "Câmara Municipal" : "Gabinete Individual"}
                      </Badge>
                      {org.status === "active" ? (
                        <Badge variant="green" dot>
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="amber" dot>
                          Provisionando
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-3 mt-0.5">
                      <span>Slug: <code className="font-mono text-ink">{org.slug}</code></span>
                      <span>•</span>
                      <span>Localidade: {org.city}/{org.state}</span>
                      <span>•</span>
                      <span>Instância: <code className="font-mono text-green">{org.runtimeRef}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold text-ink">{org.cabinetsCount} Gabinete(s)</div>
                    <div className="text-[10px] text-muted">{org.workspaces.length} workspaces listados</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {isExpanded ? "Recolher" : "Expandir"}
                  </Badge>
                </div>
              </div>

              {/* Workspaces Sub-tree (Visible when expanded) */}
              {isExpanded && (
                <div className="p-0 bg-white">
                  <Table>
                    <Thead>
                      <Tr className="bg-paper/20">
                        <Th className="pl-12">Workspace / Gabinete</Th>
                        <Th>Tipo</Th>
                        <Th>Titular / Responsável</Th>
                        <Th className="text-center">Membros</Th>
                        <Th className="text-center">Módulos</Th>
                        <Th>Status</Th>
                        <Th className="text-right pr-4">Detalhes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {org.workspaces.map((ws) => (
                        <Tr key={ws.id} className="hover:bg-mint/10 transition-colors">
                          <Td className="pl-12 font-medium text-xs text-ink">
                            <div className="flex items-center gap-2">
                              <span className="text-muted">•</span>
                              <span>{ws.name}</span>
                            </div>
                          </Td>
                          <Td>
                            <span className="text-[11px] font-semibold text-muted uppercase">
                              {ws.kind === "presidency"
                                ? "Presidência"
                                : ws.kind === "committee"
                                ? "Comissão Permanente"
                                : "Gabinete Parlamentar"}
                            </span>
                          </Td>
                          <Td className="text-xs text-muted">
                            {ws.parliamentarian || "—"}
                          </Td>
                          <Td className="text-center text-xs font-semibold">{ws.membersCount}</Td>
                          <Td className="text-center">
                            <Badge variant="neutral" className="text-[10px]">
                              {ws.activeModulesCount} ativos
                            </Badge>
                          </Td>
                          <Td>
                            {ws.status === "active" ? (
                              <Badge variant="green" dot>
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="amber" dot>
                                Em Configuração
                              </Badge>
                            )}
                          </Td>
                          <Td className="text-right pr-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedWorkspace({ orgName: org.name, ws })}
                              className="text-xs text-green hover:underline h-7 px-2"
                            >
                              Inspecionar
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal: Workspace Inspection */}
      <Modal
        isOpen={!!selectedWorkspace}
        onClose={() => setSelectedWorkspace(null)}
        title={`Inspeção de Workspace: ${selectedWorkspace?.ws.name}`}
        description={`Organização Vinculada: ${selectedWorkspace?.orgName}`}
        size="md"
      >
        {selectedWorkspace && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-line p-3 bg-paper/40">
                <span className="text-muted block">ID do Workspace:</span>
                <span className="font-mono font-bold text-ink">{selectedWorkspace.ws.id}</span>
              </div>
              <div className="rounded border border-line p-3 bg-paper/40">
                <span className="text-muted block">Tipo Institucional:</span>
                <span className="font-bold text-ink uppercase">{selectedWorkspace.ws.kind}</span>
              </div>
              <div className="rounded border border-line p-3 bg-paper/40">
                <span className="text-muted block">Titular:</span>
                <span className="font-semibold text-ink">{selectedWorkspace.ws.parliamentarian}</span>
              </div>
              <div className="rounded border border-line p-3 bg-paper/40">
                <span className="text-muted block">Status do Workspace:</span>
                <Badge variant={selectedWorkspace.ws.status === "active" ? "green" : "amber"} dot>
                  {selectedWorkspace.ws.status === "active" ? "Operacional" : "Setup Inicial"}
                </Badge>
              </div>
            </div>

            <div className="rounded border border-line p-3 bg-paper/20 space-y-2">
              <h4 className="text-xs font-bold text-ink">Políticas de Isolamento (RLS):</h4>
              <p className="text-[11px] text-muted">
                Este workspace possui isolamento rigoroso via chave composta <code>(organization_id, workspace_id)</code>.
                Membros deste gabinete não conseguem visualizar dados de outros gabinetes da mesma câmara municipal.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedWorkspace(null)}>
                Fechar Inspeção
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MasterShell>
  );
}
