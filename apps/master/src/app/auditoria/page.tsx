"use client";

import React, { useState } from "react";
import type { PlatformAuditEvent } from "@gabinete360/types";
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
  Modal,
  NoticeBanner,
} from "@gabinete360/ui";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  Shield,
  Download,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

const INITIAL_AUDIT_LOGS: PlatformAuditEvent[] = [
  {
    id: "aud-001",
    actor_admin_id: "adm-1",
    actor_name: "Diogo Mota (Super Admin)",
    action: "tenant.create",
    resource_type: "platform_tenants",
    resource_id: "ten-003",
    tenant_id: "ten-003",
    tenant_name: "Câmara Municipal de Campinas",
    request_id: "req_cp_99218201",
    occurred_at: "2026-11-22T21:28:00Z",
    result: "success",
    metadata_minimized: {
      client_ip: "189.40.12.91",
      customer_type: "municipal_chamber",
      plan: "chamber",
      city: "Campinas",
      workspaces_allocated: 33,
    },
  },
  {
    id: "aud-002",
    actor_admin_id: "adm-2",
    actor_name: "Juliana Duarte (Segurança)",
    action: "support.jit.grant_approved",
    resource_type: "support_access_requests",
    resource_id: "jit-req-01",
    tenant_id: "ten-001",
    tenant_name: "Câmara Municipal de Santos",
    request_id: "req_cp_99218255",
    occurred_at: "2026-11-22T20:15:00Z",
    result: "success",
    metadata_minimized: {
      requester: "Lucas Alencar (Suporte)",
      approver: "Juliana Duarte (Segurança)",
      requested_scope: "read_diagnostics",
      duration_minutes: 120,
      rule_enforced: "two_person_custody_verified",
    },
  },
  {
    id: "aud-003",
    actor_admin_id: "adm-1",
    actor_name: "Diogo Mota (Super Admin)",
    action: "tenant.entitlements.update",
    resource_type: "tenant_module_entitlements",
    resource_id: "ten-002",
    tenant_id: "ten-002",
    tenant_name: "Gabinete Ver. Mariana Costa",
    request_id: "req_cp_99218310",
    occurred_at: "2026-11-22T19:40:00Z",
    result: "success",
    metadata_minimized: {
      module_key: "assistive_ai",
      previous_state: false,
      new_state: true,
      reason: "Upgrade do plano para Profissional",
    },
  },
  {
    id: "aud-004",
    actor_admin_id: "adm-4",
    actor_name: "Lucas Alencar (Suporte)",
    action: "support.jit.request_created",
    resource_type: "support_access_requests",
    resource_id: "jit-req-02",
    tenant_id: "ten-005",
    tenant_name: "Gabinete Ver. Lucas Mendes",
    request_id: "req_cp_99218400",
    occurred_at: "2026-11-22T18:12:00Z",
    result: "success",
    metadata_minimized: {
      purpose: "Investigação de falha no provisionamento do gateway SMTP",
      scope: "emergency_sync",
    },
  },
  {
    id: "aud-005",
    actor_admin_id: "adm-3",
    actor_name: "Marcos Vinícius (Operações)",
    action: "provisioning.job.retry",
    resource_type: "tenant_provisioning_jobs",
    resource_id: "job-102",
    tenant_id: "ten-005",
    tenant_name: "Gabinete Ver. Lucas Mendes",
    request_id: "req_cp_99218442",
    occurred_at: "2026-11-22T18:15:00Z",
    result: "failure",
    reason: "SMTP connection timed out",
    metadata_minimized: {
      attempt: 2,
      max_attempts: 3,
      error_code: 504,
    },
  },
  {
    id: "aud-006",
    actor_admin_id: "adm-unauthorized",
    actor_name: "Tentativa Bloqueada (MFA Invalido)",
    action: "admin.session.elevation",
    resource_type: "auth_sessions",
    resource_id: null,
    tenant_id: null,
    request_id: "req_cp_sec_attack_01",
    occurred_at: "2026-11-22T15:02:00Z",
    result: "denied",
    reason: "AAL2 TOTP challenge missing or failed",
    metadata_minimized: {
      ip: "45.160.22.18",
      attempted_route: "/api/master/provisioning",
      blocked_by: "Master Edge Middleware",
    },
  },
  {
    id: "aud-007",
    actor_admin_id: "adm-1",
    actor_name: "Diogo Mota (Super Admin)",
    action: "tenant.suspend",
    resource_type: "platform_tenants",
    resource_id: "ten-005",
    tenant_id: "ten-005",
    tenant_name: "Gabinete Ver. Lucas Mendes",
    request_id: "req_cp_99218001",
    occurred_at: "2026-11-20T10:00:00Z",
    result: "success",
    metadata_minimized: {
      reason: "Inadimplência de mensalidade no ciclo",
      access_mode: "read_only_grace_period",
    },
  },
];

export default function AdministrativeAuditPage() {
  const [logs] = useState<PlatformAuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<PlatformAuditEvent | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.actor_name && log.actor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.tenant_name && log.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesResult = resultFilter === "all" || log.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const getResultBadge = (result: string) => {
    switch (result) {
      case "success":
        return (
          <Badge variant="green" dot>
            Sucesso
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="red" dot>
            Negado (Bloqueio)
          </Badge>
        );
      case "failure":
        return (
          <Badge variant="amber" dot>
            Falha
          </Badge>
        );
      default:
        return <Badge variant="neutral">{result}</Badge>;
    }
  };

  return (
    <MasterShell
      title="Trilha de Auditoria Administrativa (Audit Trail)"
      subtitle="Registro imutável e append-only de todas as operações realizadas por administradores no Control Plane"
      badgeText="Append-Only Audit Vault"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Exportação de auditoria gerada com assinatura hash SHA-256 (Demonstração).")}
          className="text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Exportar Relatório (CSV)
        </Button>
      }
    >
      <NoticeBanner variant="institutional">
        <strong>Garantia de Integridade e LGPD:</strong> Esta trilha opera sob política estrita de apenas inserção (<code>REVOKE UPDATE, DELETE ON platform_audit_events</code>). Nenhuma entrada de auditoria pode ser alterada ou apagada.
      </NoticeBanner>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Filtrar por ação, administrador, recurso ou inquilino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full pl-9 pr-4 rounded-md border border-line bg-white text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="h-10 rounded-md border border-line bg-white px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green"
              >
                <option value="all">Todos os Resultados</option>
                <option value="success">Sucesso</option>
                <option value="denied">Negado (Bloqueado)</option>
                <option value="failure">Falha Técnica</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Eventos de Auditoria Recentes</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Exibindo {filteredLogs.length} de {logs.length} eventos no cofre imutável
            </p>
          </div>
          <Badge variant="blue">DEMONSTRAÇÃO</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Data / Hora</Th>
                <Th>Operador Responsável</Th>
                <Th>Ação Executada</Th>
                <Th>Recurso Afetado</Th>
                <Th>Inquilino (Tenant)</Th>
                <Th>Resultado</Th>
                <Th className="text-right">Payload</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredLogs.map((log) => (
                <Tr key={log.id} className="hover:bg-paper/40 transition-colors">
                  <Td className="text-xs text-muted whitespace-nowrap">
                    {new Date(log.occurred_at).toLocaleString("pt-BR")}
                  </Td>
                  <Td>
                    <div className="font-semibold text-xs text-ink">{log.actor_name}</div>
                    <div className="text-[10px] text-muted font-mono">{log.request_id}</div>
                  </Td>
                  <Td>
                    <code className="rounded bg-paper px-2 py-0.5 font-mono text-xs font-semibold text-green border border-line">
                      {log.action}
                    </code>
                  </Td>
                  <Td className="text-xs text-muted font-mono">
                    {log.resource_type}
                  </Td>
                  <Td className="text-xs font-medium text-ink">
                    {log.tenant_name || "Plataforma Global"}
                  </Td>
                  <Td>{getResultBadge(log.result)}</Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="text-xs text-green hover:underline h-7 px-2"
                    >
                      <Code2 className="h-3.5 w-3.5 mr-1" />
                      Inspecionar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Minimized Metadata JSON Inspector */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Detalhes do Evento de Auditoria: ${selectedLog?.action}`}
        description={`Request ID: ${selectedLog?.request_id} · Ocorrido em ${selectedLog?.occurred_at}`}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-line p-3 bg-paper/40">
                <span className="text-muted block">Operador:</span>
                <span className="font-bold text-ink">{selectedLog.actor_name}</span>
              </div>
              <div className="rounded border border-line p-3 bg-paper/40">
                <span className="text-muted block">Resultado:</span>
                <span className="font-bold uppercase text-ink">{selectedLog.result}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-ink block mb-1">
                Metadados Minimizados (JSON LGPD):
              </span>
              <pre className="rounded border border-line bg-ink text-emerald-400 p-4 font-mono text-xs overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.metadata_minimized, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedLog(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MasterShell>
  );
}
