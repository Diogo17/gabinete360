"use client";

import React, { useState } from "react";
import type { PlatformPlan, PlatformModule } from "@gabinete360/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DemoWatermark,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NoticeBanner,
} from "@gabinete360/ui";
import {
  Package,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

const PLANS_CATALOG: PlatformPlan[] = [
  {
    id: "plan-basic",
    plan_key: "basic",
    name: "Gabinete Essencial",
    description: "Plano ideal para vereadores em primeiro mandato ou gabinetes individuais compactos",
    status: "active",
    billing_period: "monthly",
    price_cents: 49000,
    limits: {
      max_members: 5,
      max_citizens: 1000,
      max_demands_month: 200,
      storage_gb: 5,
    },
  },
  {
    id: "plan-pro",
    plan_key: "pro",
    name: "Gabinete Profissional",
    description: "Para parlamentares atuantes com equipe expandida, IA assistiva e gestão de demandas em escala",
    status: "active",
    billing_period: "monthly",
    price_cents: 99000,
    limits: {
      max_members: 15,
      max_citizens: 10000,
      max_demands_month: 1000,
      storage_gb: 25,
    },
  },
  {
    id: "plan-premium",
    plan_key: "premium",
    name: "Gabinete Premium 360°",
    description: "Solução completa para deputados estaduais e federais com liderança regional e alto fluxo",
    status: "active",
    billing_period: "monthly",
    price_cents: 249000,
    limits: {
      max_members: 50,
      max_citizens: 50000,
      max_demands_month: 5000,
      storage_gb: 100,
    },
  },
  {
    id: "plan-chamber",
    plan_key: "chamber",
    name: "Câmara Municipal Enterprise",
    description: "Instância institucional corporativa para Presidência e todos os gabinetes da casa de leis",
    status: "active",
    billing_period: "monthly",
    price_cents: 390000,
    limits: {
      max_members: 250,
      max_citizens: 200000,
      max_demands_month: 50000,
      storage_gb: 500,
    },
  },
];

interface ModuleCatalogItem extends PlatformModule {
  category: "core" | "legislative" | "engagement" | "ai_security";
}

const MODULES_CATALOG: ModuleCatalogItem[] = [
  {
    id: "mod-crm",
    module_key: "crm",
    name: "CRM de Cidadãos & Eleitores",
    description: "Cadastro territorial, histórico de relacionamento, tags de bairro e canais de contato",
    status: "active",
    release_channel: "stable",
    is_core: true,
    is_billable: false,
    category: "core",
  },
  {
    id: "mod-demands",
    module_key: "demands",
    name: "Gestão de Demandas & Triagem",
    description: "Esteira de demandas cidadãs com SLA, prioridades, distribuição e histórico de eventos",
    status: "active",
    release_channel: "stable",
    is_core: true,
    is_billable: false,
    category: "core",
  },
  {
    id: "mod-agenda",
    module_key: "agenda",
    name: "Agenda Parlamentar Oficial",
    description: "Calendário de compromissos oficiais, audiências públicas e visitas institucionais",
    status: "active",
    release_channel: "stable",
    is_core: true,
    is_billable: false,
    category: "core",
  },
  {
    id: "mod-team",
    module_key: "team",
    name: "Gestão de Equipe & Tarefas",
    description: "Delegação de atividades internas, papéis, permissões e quadro kanban de assessoria",
    status: "active",
    release_channel: "stable",
    is_core: true,
    is_billable: false,
    category: "core",
  },
  {
    id: "mod-legislative",
    module_key: "legislative",
    name: "Atuação Legislativa (PLs e Indicações)",
    description: "Acompanhamento de proposições, projetos de lei, moções, emendas e requerimentos",
    status: "active",
    release_channel: "stable",
    is_core: false,
    is_billable: true,
    category: "legislative",
  },
  {
    id: "mod-inspections",
    module_key: "inspections",
    name: "Fiscalização de Serviços Públicos",
    description: "Dossiês de fiscalização em campo com registro fotográfico, geolocalização e ofícios",
    status: "active",
    release_channel: "stable",
    is_core: false,
    is_billable: true,
    category: "legislative",
  },
  {
    id: "mod-participation",
    module_key: "participation",
    name: "Participação Popular & Consultas",
    description: "Mecanismo de escuta cidadã, enquetes públicas e recebimento de sugestões populares",
    status: "active",
    release_channel: "stable",
    is_core: false,
    is_billable: true,
    category: "engagement",
  },
  {
    id: "mod-reports-vault",
    module_key: "reports_vault",
    name: "Canal de Denúncias Segregadas",
    description: "Cofre criptográfico com isolamento visual absoluto e trilha auditável de sigilo",
    status: "active",
    release_channel: "stable",
    is_core: false,
    is_billable: true,
    category: "ai_security",
  },
  {
    id: "mod-whatsapp",
    module_key: "whatsapp",
    name: "WhatsApp Multi-Atendimento",
    description: "Caixa de entrada compartilhada para triagem rápida e sincronização com CRM",
    status: "active",
    release_channel: "stable",
    is_core: false,
    is_billable: true,
    category: "engagement",
  },
  {
    id: "mod-ai",
    module_key: "assistive_ai",
    name: "IA Assistiva DM IA Studio",
    description: "Classificação automática de demandas, resumos temáticos e minutas legislativas",
    status: "active",
    release_channel: "beta",
    is_core: false,
    is_billable: true,
    category: "ai_security",
  },
];

// Sample tenant entitlement overrides
interface TenantEntitlementsState {
  [tenantSlug: string]: Record<string, boolean>;
}

const INITIAL_TENANT_ENTITLEMENTS: TenantEntitlementsState = {
  "camara-santos": {
    crm: true,
    demands: true,
    agenda: true,
    team: true,
    legislative: true,
    inspections: true,
    participation: true,
    reports_vault: true,
    whatsapp: true,
    assistive_ai: true,
  },
  "mariana-costa": {
    crm: true,
    demands: true,
    agenda: true,
    team: true,
    legislative: true,
    inspections: true,
    participation: true,
    reports_vault: false,
    whatsapp: true,
    assistive_ai: true,
  },
  "roberto-silveira": {
    crm: true,
    demands: true,
    agenda: true,
    team: true,
    legislative: true,
    inspections: false,
    participation: false,
    reports_vault: false,
    whatsapp: false,
    assistive_ai: false,
  },
};

export default function PlansAndModulesPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "modules" | "entitlements">("plans");
  const [selectedTenant, setSelectedTenant] = useState<string>("camara-santos");
  const [entitlements, setEntitlements] = useState<TenantEntitlementsState>(INITIAL_TENANT_ENTITLEMENTS);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleToggleModule = (moduleKey: string) => {
    setEntitlements((prev) => {
      const tenantMods = prev[selectedTenant] || {};
      const current = tenantMods[moduleKey] ?? false;
      const updated = {
        ...prev,
        [selectedTenant]: {
          ...tenantMods,
          [moduleKey]: !current,
        },
      };
      return updated;
    });

    const isNowEnabled = !(entitlements[selectedTenant]?.[moduleKey] ?? false);
    setFeedbackMessage(
      `Módulo "${moduleKey}" ${isNowEnabled ? "ativado" : "desativado"} para o inquilino selecionado!`
    );
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <MasterShell
      title="Gestão de Planos & Catálogo de Módulos"
      subtitle="Definição de limites comerciais, precificação demonstrativa e ativação granular de funcionalidades"
      badgeText="Catálogo de Assinaturas"
    >
      <NoticeBanner variant="institutional">
        <strong>Regra de Entitlement do SaaS:</strong> No Gabinete 360°, cada inquilino tem acesso concedido exclusivamente aos módulos licenciados no plano ou ativados individualmente via Control Plane.
      </NoticeBanner>

      {/* Tabs */}
      <div className="flex border-b border-line gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "plans"
              ? "border-green text-green"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Planos Comerciais (Catálogo)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("modules")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "modules"
              ? "border-green text-green"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Módulos do Sistema ({MODULES_CATALOG.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("entitlements")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "entitlements"
              ? "border-green text-green"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Ativação por Cliente (Entitlements)
        </button>
      </div>

      {/* TAB 1: PLANS CATALOG */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS_CATALOG.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between border ${
                  plan.plan_key === "pro"
                    ? "border-green shadow-md ring-1 ring-green/20"
                    : "border-line"
                }`}
              >
                {plan.plan_key === "pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-pill bg-green px-3 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-xs">
                      Mais Popular
                    </span>
                  </div>
                )}
                <div>
                  <CardHeader className="flex-col items-start gap-2 pb-3">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">
                        {plan.plan_key}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold font-heading">{plan.name}</CardTitle>
                    <p className="text-xs text-muted leading-snug">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="border-t border-b border-line py-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold font-heading text-ink">
                          {formatPrice(plan.price_cents)}
                        </span>
                        <span className="text-xs text-muted">/mês</span>
                      </div>
                      <span className="text-[10px] text-muted block mt-0.5">
                        Faturamento {plan.billing_period === "monthly" ? "mensal" : "anual"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="text-[11px] font-bold text-ink uppercase tracking-wider">
                        Limites Operacionais:
                      </div>
                      <div className="flex items-center justify-between text-muted">
                        <span>Usuários na Equipe:</span>
                        <span className="font-bold text-ink">{plan.limits.max_members}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted">
                        <span>Cidadãos no CRM:</span>
                        <span className="font-bold text-ink">{plan.limits.max_citizens?.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted">
                        <span>Demandas / Mês:</span>
                        <span className="font-bold text-ink">{plan.limits.max_demands_month?.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted">
                        <span>Armazenamento:</span>
                        <span className="font-bold text-ink">{plan.limits.storage_gb} GB</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0 border-t border-line/60 mt-4">
                  <Button
                    variant={plan.plan_key === "pro" ? "primary" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setActiveTab("entitlements");
                    }}
                  >
                    Gerenciar Módulos
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MODULES CATALOG */}
      {activeTab === "modules" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Catálogo Global de Módulos</CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Relação de componentes funcionais do Operational Plane
              </p>
            </div>
            <Badge variant="blue">DEMONSTRAÇÃO</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <Thead>
                <Tr>
                  <Th>Módulo</Th>
                  <Th>Chave (Key)</Th>
                  <Th>Tipo</Th>
                  <Th>Canal</Th>
                  <Th>Tarifação</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {MODULES_CATALOG.map((mod) => (
                  <Tr key={mod.id} className="hover:bg-paper/30 transition-colors">
                    <Td>
                      <div className="font-semibold text-xs text-ink">{mod.name}</div>
                      <div className="text-[11px] text-muted">{mod.description}</div>
                    </Td>
                    <Td className="font-mono text-xs text-muted">{mod.module_key}</Td>
                    <Td>
                      <Badge variant={mod.is_core ? "neutral" : "blue"}>
                        {mod.is_core ? "Core Mandatório" : "Add-on Opcional"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant={mod.release_channel === "stable" ? "green" : "amber"}>
                        {mod.release_channel}
                      </Badge>
                    </Td>
                    <Td className="text-xs font-medium">
                      {mod.is_billable ? "Faturável no Plano" : "Incluso Base"}
                    </Td>
                    <Td>
                      <Badge variant="green" dot>
                        Ativo
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: CLIENT ENTITLEMENTS SWITCHES */}
      {activeTab === "entitlements" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-ink block">Selecione o Inquilino Contratante:</span>
                  <span className="text-[11px] text-muted">
                    Ative ou desative módulos em tempo real para este cliente específico
                  </span>
                </div>
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="h-10 rounded-md border border-line bg-white px-3 text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-green"
                >
                  <option value="camara-santos">Câmara Municipal de Santos (Enterprise)</option>
                  <option value="mariana-costa">Gabinete Ver. Mariana Costa (Profissional)</option>
                  <option value="roberto-silveira">Gabinete Dep. Roberto Silveira (Essencial)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {feedbackMessage && (
            <div className="p-3 bg-mint text-green text-xs font-semibold rounded-md border border-green/20 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Entitlements de Módulos — {selectedTenant}</CardTitle>
                <p className="text-xs text-muted mt-0.5">
                  Interruptores de habilitação do Operational Plane
                </p>
              </div>
              <Badge variant="green" dot>
                Sincronizado
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-line">
                {MODULES_CATALOG.map((mod) => {
                  const isEnabled = entitlements[selectedTenant]?.[mod.module_key] ?? false;

                  return (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between p-4 hover:bg-paper/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-ink">{mod.name}</span>
                          {mod.is_core && (
                            <Badge variant="neutral" className="text-[9px]">
                              Core Obrigatório
                            </Badge>
                          )}
                          {mod.release_channel === "beta" && (
                            <Badge variant="amber" className="text-[9px]">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted">{mod.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${isEnabled ? "text-green" : "text-muted"}`}>
                          {isEnabled ? "HABILITADO" : "DESATIVADO"}
                        </span>
                        <button
                          type="button"
                          disabled={mod.is_core}
                          onClick={() => handleToggleModule(mod.module_key)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green ${
                            isEnabled ? "bg-green" : "bg-line"
                          } ${mod.is_core ? "opacity-50 cursor-not-allowed" : ""}`}
                          aria-label={`Alternar ${mod.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MasterShell>
  );
}
