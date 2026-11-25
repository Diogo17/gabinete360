"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StatCard,
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
  NoticeBanner,
  Button,
  DemoWatermark,
} from "@gabinete360/ui";
import {
  Users,
  Building2,
  Server,
  Activity,
  Database,
  Key,
  Cpu,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import { MasterShell } from "../components/master-shell";
import { SuperuserPanelSelector } from "../components/superuser-panel-selector";
import { useMasterAdmin } from "../lib/auth/context";

export default function MasterDashboardPage() {
  const { admin } = useMasterAdmin();
  const [filterType, setFilterType] = useState<"all" | "chamber" | "cabinet">("all");

  const clientsData = [
    {
      id: "t-1",
      name: "Câmara Municipal de Santos",
      type: "municipal_chamber",
      typeLabel: "Câmara Municipal",
      plan: "Enterprise 360°",
      status: "active",
      statusLabel: "Ativo",
      gabinetes: 21,
      city: "Santos / SP",
      mrr: "R$ 3.900/mês",
    },
    {
      id: "t-2",
      name: "Gabinete Ver. Mariana Costa",
      type: "individual_cabinet",
      typeLabel: "Gabinete Individual",
      plan: "Profissional",
      status: "active",
      statusLabel: "Ativo",
      gabinetes: 1,
      city: "Belo Horizonte / MG",
      mrr: "R$ 990/mês",
    },
    {
      id: "t-3",
      name: "Câmara Municipal de Campinas",
      type: "municipal_chamber",
      typeLabel: "Câmara Municipal",
      plan: "Enterprise 360°",
      status: "provisioning",
      statusLabel: "Provisionando",
      gabinetes: 33,
      city: "Campinas / SP",
      mrr: "R$ 4.500/mês",
    },
    {
      id: "t-4",
      name: "Gabinete Dep. Roberto Silveira",
      type: "individual_cabinet",
      typeLabel: "Gabinete Individual",
      plan: "Essencial",
      status: "active",
      statusLabel: "Ativo",
      gabinetes: 1,
      city: "Curitiba / PR",
      mrr: "R$ 490/mês",
    },
    {
      id: "t-5",
      name: "Câmara Municipal de Niterói",
      type: "municipal_chamber",
      typeLabel: "Câmara Municipal",
      plan: "Enterprise 360°",
      status: "active",
      statusLabel: "Ativo",
      gabinetes: 18,
      city: "Niterói / RJ",
      mrr: "R$ 3.900/mês",
    },
  ];

  const filteredClients = clientsData.filter((c) => {
    if (filterType === "all") return true;
    if (filterType === "chamber") return c.type === "municipal_chamber";
    return c.type === "individual_cabinet";
  });

  return (
    <MasterShell
      title="Visão Geral da Infraestrutura SaaS"
      subtitle="Monitoramento multi-tenant de clientes, gabinetes ativos e integridade dos serviços"
      badgeText="Infraestrutura Operacional"
    >
      <SuperuserPanelSelector
        userEmail={admin?.email}
        userName={admin?.display_name}
      />
      {/* Notice Banner */}
      <NoticeBanner variant="institutional">
        <div className="flex items-center justify-between">
          <span>
            <strong>DM IA Studio · CONTROL PLANE:</strong> Este ambiente opera sob o Control Plane isolado (porta 3001).
            Nenhum dado sensível de cidadãos do plano operacional é acessível a partir deste console.
          </span>
        </div>
      </NoticeBanner>

      {/* KPI Stat Cards (Platform Totals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clientes Cadastrados"
          value="18"
          trend={{ value: "+3 este mês", isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Gabinetes Ativos"
          value="45"
          trend={{ value: "98.2% ativos", isPositive: true }}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          label="Câmaras Municipais"
          value="4"
          trend={{ value: "Contratos Enterprise", isPositive: true }}
          icon={<Server className="h-4 w-4" />}
        />
        <StatCard
          label="Saúde dos Serviços"
          value="100%"
          trend={{ value: "4/4 saudáveis", isPositive: true }}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Second Row KPIs: Subscriptions, Active Modules, Provisioning & Incidents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Assinaturas SaaS Ativas</span>
            <Layers className="h-4 w-4 text-green" />
          </div>
          <div className="mt-2 text-2xl font-bold font-heading text-ink">63</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#2b7255] font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-green" />
            <span>100% adimplentes no ciclo</span>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Módulos no Catálogo</span>
            <Sparkles className="h-4 w-4 text-green" />
          </div>
          <div className="mt-2 text-2xl font-bold font-heading text-ink">12</div>
          <div className="mt-1 text-[11px] text-muted">
            CRM, Demandas, IA, Denúncias, WhatsApp...
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Fila de Provisionamento</span>
            <Cpu className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-2 text-2xl font-bold font-heading text-ink">1 em andamento</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gold font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>Câmara de Campinas (Etapa 4/6)</span>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Incidentes Abertos</span>
            <AlertTriangle className="h-4 w-4 text-muted" />
          </div>
          <div className="mt-2 text-2xl font-bold font-heading text-ink">0 críticos</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#2b7255] font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-green" />
            <span>Todos os SLAs cumpridos</span>
          </div>
        </div>
      </div>

      {/* Main Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table: Clientes Contratantes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Clientes Contratantes em Destaque</CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Status cadastral e provisionamento de planos SaaS
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border border-line p-0.5 bg-paper text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    filterType === "all" ? "bg-white text-green shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("chamber")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    filterType === "chamber" ? "bg-white text-green shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Câmaras
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("cabinet")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    filterType === "cabinet" ? "bg-white text-green shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Gabinetes
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <Thead>
                <Tr>
                  <Th>Cliente / Contratante</Th>
                  <Th>Tipo</Th>
                  <Th>Plano</Th>
                  <Th>Status</Th>
                  <Th>Gabinetes</Th>
                  <Th>Localidade</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.map((client) => (
                  <Tr key={client.id} className="hover:bg-paper/40 transition-colors">
                    <Td className="font-semibold text-ink">
                      <div>
                        <span>{client.name}</span>
                        <div className="text-[10px] text-muted font-normal">{client.mrr}</div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={client.type === "municipal_chamber" ? "blue" : "neutral"}>
                        {client.typeLabel}
                      </Badge>
                    </Td>
                    <Td className="text-xs font-medium">{client.plan}</Td>
                    <Td>
                      {client.status === "active" ? (
                        <Badge variant="green" dot>
                          {client.statusLabel}
                        </Badge>
                      ) : (
                        <Badge variant="amber" dot>
                          {client.statusLabel}
                        </Badge>
                      )}
                    </Td>
                    <Td className="font-bold text-center">{client.gabinetes}</Td>
                    <Td className="text-xs text-muted">{client.city}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <div className="flex items-center justify-between border-t border-line px-5 py-3 bg-paper/20">
              <span className="text-xs text-muted">
                Exibindo {filteredClients.length} de 18 clientes ativos
              </span>
              <Link href="/clientes">
                <Button variant="outline" size="sm" className="text-xs">
                  Ver Todos os Clientes <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Platform Health & Quick Actions */}
        <div className="space-y-6">
          {/* Microservices Monitor */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle>Monitor de Microsserviços</CardTitle>
              <Badge variant="green" dot>Online</Badge>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-green" />
                  <div>
                    <div className="text-xs font-bold text-ink">PostgreSQL (Supabase)</div>
                    <div className="text-[10px] text-muted">Latência: 24ms · Pooler Ativo</div>
                  </div>
                </div>
                <Badge variant="green">99.99%</Badge>
              </div>

              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <Key className="h-4 w-4 text-green" />
                  <div>
                    <div className="text-xs font-bold text-ink">Supabase Auth & MFA</div>
                    <div className="text-[10px] text-muted">MFA TOTP AAL2 Ativo</div>
                  </div>
                </div>
                <Badge variant="green">Saudável</Badge>
              </div>

              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="h-4 w-4 text-green" />
                  <div>
                    <div className="text-xs font-bold text-ink">Vercel Edge & APIs</div>
                    <div className="text-[10px] text-muted">2 Deployments ativos</div>
                  </div>
                </div>
                <Badge variant="green">Operacional</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4 text-green" />
                  <div>
                    <div className="text-xs font-bold text-ink">Provisioning Workers</div>
                    <div className="text-[10px] text-muted">1 em execução · 0 erros</div>
                  </div>
                </div>
                <Badge variant="amber">Ocupado</Badge>
              </div>

              <div className="pt-2">
                <Link href="/monitoramento" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Painel Completo de Telemetria <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access / Shortcuts Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Ações Rápidas de Operação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/clientes" className="block">
                <div className="flex items-center justify-between rounded-md border border-line p-2.5 hover:bg-mint/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-green" />
                    <div>
                      <div className="text-xs font-bold text-ink">Cadastrar Novo Cliente</div>
                      <div className="text-[10px] text-muted">Gabinete ou Câmara Municipal</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </div>
              </Link>

              <Link href="/provisionamento" className="block">
                <div className="flex items-center justify-between rounded-md border border-line p-2.5 hover:bg-mint/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="h-4 w-4 text-green" />
                    <div>
                      <div className="text-xs font-bold text-ink">Pipeline de Provisionamento</div>
                      <div className="text-[10px] text-muted">Acompanhar etapas e retentativas</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </div>
              </Link>

              <Link href="/suporte" className="block">
                <div className="flex items-center justify-between rounded-md border border-line p-2.5 hover:bg-mint/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="h-4 w-4 text-green" />
                    <div>
                      <div className="text-xs font-bold text-ink">Acesso Emergencial JIT</div>
                      <div className="text-[10px] text-muted">Aprovação com dupla custódia (2h)</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </div>
              </Link>

              <Link href="/auditoria" className="block">
                <div className="flex items-center justify-between rounded-md border border-line p-2.5 hover:bg-mint/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-green" />
                    <div>
                      <div className="text-xs font-bold text-ink">Trilha de Auditoria</div>
                      <div className="text-[10px] text-muted">Registro imutável append-only</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MasterShell>
  );
}
