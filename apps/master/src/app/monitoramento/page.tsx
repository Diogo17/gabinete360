"use client";

import React, { useState } from "react";
import type { ServiceHealthSnapshot, PlatformIncident } from "@gabinete360/types";
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
  Activity,
  Database,
  Key,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

interface ServiceHealthCard {
  id: string;
  name: string;
  category: string;
  status: "healthy" | "degraded" | "down";
  latency_ms: number;
  uptime_pct: number;
  last_checked: string;
  details: string;
  iconType: "database" | "auth" | "edge" | "storage" | "workers";
}

const INITIAL_SERVICES: ServiceHealthCard[] = [
  {
    id: "svc-postgres",
    name: "Supabase PostgreSQL (Database)",
    category: "Database & Storage",
    status: "healthy",
    latency_ms: 22,
    uptime_pct: 99.99,
    last_checked: "Agora há 2s",
    details: "Connection Pooler ativo · Transações normais · 0 deadlocks",
    iconType: "database",
  },
  {
    id: "svc-auth",
    name: "Supabase Auth & TOTP MFA Service",
    category: "Identity & Security",
    status: "healthy",
    latency_ms: 35,
    uptime_pct: 100.0,
    last_checked: "Agora há 4s",
    details: "AAL2 TOTP challenge operacional · 0 falhas de rate limit",
    iconType: "auth",
  },
  {
    id: "svc-edge",
    name: "Vercel Edge & Serverless APIs",
    category: "Compute & Routing",
    status: "healthy",
    latency_ms: 18,
    uptime_pct: 99.98,
    last_checked: "Agora há 1s",
    details: "Master (3001) & Client (3000) com deploy ativo em GRU1",
    iconType: "edge",
  },
  {
    id: "svc-storage",
    name: "Supabase Storage (Document S3)",
    category: "Storage",
    status: "healthy",
    latency_ms: 45,
    uptime_pct: 99.95,
    last_checked: "Agora há 6s",
    details: "Buckets operacionais · Upload de anexos legislativos estável",
    iconType: "storage",
  },
  {
    id: "svc-workers",
    name: "Async Provisioning Workers",
    category: "Worker Infrastructure",
    status: "healthy",
    latency_ms: 14,
    uptime_pct: 100.0,
    last_checked: "Agora há 3s",
    details: "Fila Redis/PGMQ ativa · Concorrência: 4 threads",
    iconType: "workers",
  },
];

const RECENT_INCIDENTS: PlatformIncident[] = [
  {
    id: "inc-01",
    title: "Latência momentânea no gateway de e-mails transacionais (SMTP)",
    severity: "low",
    status: "resolved",
    summary: "Timeout intermitente na entrega de e-mails de convite para gabinetes novos. Resolvido com chave primária de redundância.",
    opened_at: "2026-11-22T18:10:00Z",
    resolved_at: "2026-11-22T18:24:00Z",
  },
  {
    id: "inc-02",
    title: "Manutenção programada no pooler de conexões PostgreSQL",
    severity: "low",
    status: "resolved",
    summary: "Upgrade de versão do Supavisor executado com zero downtime na região sa-east-1.",
    opened_at: "2026-11-21T03:00:00Z",
    resolved_at: "2026-11-21T03:15:00Z",
  },
];

export default function MonitoringHealthPage() {
  const [services, setServices] = useState<ServiceHealthCard[]>(INITIAL_SERVICES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>("Agora há pouco");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latency_ms: Math.floor(Math.random() * 20) + 15,
          last_checked: "Recém atualizado",
        }))
      );
      setLastHeartbeat(new Date().toLocaleTimeString("pt-BR"));
      setIsRefreshing(false);
    }, 600);
  };

  const getServiceIcon = (type: ServiceHealthCard["iconType"]) => {
    switch (type) {
      case "database":
        return <Database className="h-5 w-5 text-green" />;
      case "auth":
        return <Key className="h-5 w-5 text-green" />;
      case "edge":
        return <Server className="h-5 w-5 text-green" />;
      case "storage":
        return <HardDrive className="h-5 w-5 text-green" />;
      case "workers":
        return <Cpu className="h-5 w-5 text-green" />;
    }
  };

  return (
    <MasterShell
      title="Monitoramento & Saúde da Infraestrutura"
      subtitle="Telemetria em tempo real dos microsserviços do Control Plane e instâncias de produção"
      badgeText="SLA Global: 99.98%"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Consultando Nós..." : "Atualizar Telemetria"}
        </Button>
      }
    >
      <NoticeBanner variant="institutional">
        <strong>Telemetria Centralizada:</strong> Monitoramento com checagens sintéticas a cada 30 segundos.
        Todas as métricas de latência e uptime abaixo são demonstrativas do ambiente de pré-produção.
      </NoticeBanner>

      {/* Global Status Banner Card */}
      <div className="rounded-lg border border-line bg-white p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-green">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-heading text-ink">
                Todos os Microsserviços Operando Normalmente
              </h2>
              <Badge variant="green" dot>
                100% Saudável
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Latência média agregada: <strong>26.8 ms</strong> · Última sondagem global: {lastHeartbeat}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-line pt-3 md:pt-0 md:pl-6">
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-muted block">Disponibilidade 30d</span>
            <span className="text-xl font-bold font-heading text-green">99.98%</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-muted block">Incidentes Ativos</span>
            <span className="text-xl font-bold font-heading text-ink">0</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <Card key={svc.id} className="border border-line hover:border-green/40 transition-colors">
            <CardHeader className="pb-3 flex-row items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-paper border border-line">
                  {getServiceIcon(svc.iconType)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs text-ink">{svc.name}</h3>
                  <span className="text-[10px] text-muted">{svc.category}</span>
                </div>
              </div>
              <Badge variant="green" dot>
                {svc.status === "healthy" ? "Saudável" : "Alerta"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-[11px] text-muted leading-tight border-b border-line pb-2.5">
                {svc.details}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-paper/50 p-2 border border-line/60">
                  <span className="text-[10px] text-muted block">Latência:</span>
                  <span className="font-bold text-ink flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-green" /> {svc.latency_ms} ms
                  </span>
                </div>
                <div className="rounded bg-paper/50 p-2 border border-line/60">
                  <span className="text-[10px] text-muted block">Uptime 30d:</span>
                  <span className="font-bold text-ink">{svc.uptime_pct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted pt-1">
                <span>Checagem: {svc.last_checked}</span>
                <span className="text-green font-semibold">Sem erros</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incident History Section */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Histórico de Incidentes & Manutenções</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Registro público de ocorrências técnicas e resoluções
            </p>
          </div>
          <Badge variant="neutral">Últimos 30 dias</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Incidente / Título</Th>
                <Th>Severidade</Th>
                <Th>Abertura</Th>
                <Th>Resolução</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {RECENT_INCIDENTS.map((inc) => (
                <Tr key={inc.id} className="hover:bg-paper/30 transition-colors">
                  <Td>
                    <div className="font-semibold text-xs text-ink">{inc.title}</div>
                    <div className="text-[11px] text-muted mt-0.5">{inc.summary}</div>
                  </Td>
                  <Td>
                    <Badge variant="neutral" className="text-[9px] uppercase">
                      {inc.severity}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-muted">
                    {new Date(inc.opened_at).toLocaleString("pt-BR")}
                  </Td>
                  <Td className="text-xs text-muted">
                    {inc.resolved_at ? new Date(inc.resolved_at).toLocaleString("pt-BR") : "—"}
                  </Td>
                  <Td>
                    <Badge variant="green" dot>
                      Resolvido
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </MasterShell>
  );
}
