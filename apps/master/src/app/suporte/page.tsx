"use client";

import React, { useState } from "react";
import type { SupportAccessRequest } from "@gabinete360/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DemoWatermark,
  Button,
  Input,
  Select,
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
  LifeBuoy,
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  UserCheck,
  FileText,
  Key,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

interface EnrichedJITRequest extends SupportAccessRequest {
  duration_minutes: number;
}

const INITIAL_JIT_REQUESTS: EnrichedJITRequest[] = [
  {
    id: "jit-001",
    tenant_id: "ten-001",
    tenant_name: "Câmara Municipal de Santos",
    requested_by: "adm-4",
    requester_name: "Lucas Alencar (Suporte L3)",
    purpose: "Diagnóstico de erro em sincronização de webhooks do portal da câmara",
    requested_scope: "read_diagnostics",
    duration_minutes: 120,
    status: "approved",
    requested_at: "2026-11-22T20:10:00Z",
    expires_at: "2026-11-22T22:10:00Z",
    approved_by: "adm-2",
  },
  {
    id: "jit-002",
    tenant_id: "ten-003",
    tenant_name: "Câmara Municipal de Campinas",
    requested_by: "adm-3",
    requester_name: "Marcos Vinícius (Operações)",
    purpose: "Análise de logs de falha na etapa de alocação de módulos durante provisionamento",
    requested_scope: "emergency_sync",
    duration_minutes: 60,
    status: "pending",
    requested_at: "2026-11-22T21:40:00Z",
    expires_at: "2026-11-22T22:40:00Z",
    approved_by: null,
  },
  {
    id: "jit-003",
    tenant_id: "ten-002",
    tenant_name: "Gabinete Ver. Mariana Costa",
    requested_by: "adm-4",
    requester_name: "Lucas Alencar (Suporte L3)",
    purpose: "Correção de configuração de DNS e certificado TLS para domínio personalizado",
    requested_scope: "billing_repair",
    duration_minutes: 30,
    status: "expired",
    requested_at: "2026-11-21T14:00:00Z",
    expires_at: "2026-11-21T14:30:00Z",
    approved_by: "adm-1",
  },
];

export default function SupportJITPage() {
  const [requests, setRequests] = useState<EnrichedJITRequest[]>(INITIAL_JIT_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<EnrichedJITRequest | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [tenantName, setTenantName] = useState("Câmara Municipal de Campinas");
  const [purpose, setPurpose] = useState("");
  const [scope, setScope] = useState("read_diagnostics");
  const [duration, setDuration] = useState(60);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (purpose.trim().length < 10) {
      alert("A justificativa técnica deve conter no mínimo 10 caracteres.");
      return;
    }

    const newReq: EnrichedJITRequest = {
      id: `jit-${Date.now().toString().slice(-4)}`,
      tenant_id: `ten-dynamic-${Date.now().toString().slice(-4)}`,
      tenant_name: tenantName,
      requested_by: "adm-current-operator",
      requester_name: "Operador Master Atual",
      purpose: purpose.trim(),
      requested_scope: scope,
      duration_minutes: duration,
      status: "pending",
      requested_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + duration * 60000).toISOString(),
      approved_by: null,
    };

    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
    setPurpose("");
    setFeedback("Solicitação de acesso JIT registrada com sucesso e aguardando aprovação.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved",
              approved_by: "adm-sec-02 (Juliana Duarte)",
            }
          : r
      )
    );
    setFeedback("Acesso JIT aprovado com dupla custódia por 2 horas!");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeny = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "denied" } : r))
    );
    setFeedback("Solicitação de acesso JIT negada.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="green" dot>
            Ativo (Aprovado)
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="amber" dot>
            Aguardando Aprovação
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="red" dot>
            Negado
          </Badge>
        );
      case "expired":
        return <Badge variant="neutral">Expirado</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <MasterShell
      title="Suporte Técnico & Acesso JIT (Just-In-Time)"
      subtitle="Mecanismo de concessão temporária de acesso aos dados operacionais com dupla custódia e expiração estrita de 2h"
      badgeText="Dupla Custódia JIT (2h Máx)"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Solicitar Acesso JIT
        </Button>
      }
    >
      <NoticeBanner variant="institutional">
        <strong>Protocolo de Segurança Zero-Access:</strong> Operadores da DM IA Studio NUNCA possuem acesso padrão aos dados operacionais de clientes. Qualquer intervenção requer autorização explícita, justificativa auditada e validação por um segundo operador (Segurança).
      </NoticeBanner>

      {feedback && (
        <div className="p-3 bg-mint text-green text-xs font-semibold rounded-md border border-green/20 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Acessos Ativos Agora</div>
            <div className="text-2xl font-bold font-heading text-green">
              {requests.filter((r) => r.status === "approved").length}
            </div>
            <div className="text-[11px] text-muted">Sessão limitada com contador regressivo</div>
          </div>
          <Clock className="h-8 w-8 text-green" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Solicitações Pendentes</div>
            <div className="text-2xl font-bold font-heading text-gold">
              {requests.filter((r) => r.status === "pending").length}
            </div>
            <div className="text-[11px] text-muted">Aguardando aprovação de segurança</div>
          </div>
          <AlertTriangle className="h-8 w-8 text-gold" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Regra de Dupla Custódia</div>
            <div className="text-2xl font-bold font-heading text-ink">2 Operadores</div>
            <div className="text-[11px] text-green font-semibold">Auto-aprovação proibida</div>
          </div>
          <ShieldCheck className="h-8 w-8 text-blue" />
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Solicitações de Acesso JIT</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Histórico de pedidos emergenciais e controle de validade
            </p>
          </div>
          <Badge variant="blue">DEMONSTRAÇÃO</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Inquilino / Justificativa</Th>
                <Th>Solicitante</Th>
                <Th>Escopo Solicitado</Th>
                <Th>Duração</Th>
                <Th>Aprovador</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {requests.map((req) => (
                <Tr key={req.id} className="hover:bg-paper/40 transition-colors">
                  <Td>
                    <div className="font-semibold text-xs text-ink">{req.tenant_name}</div>
                    <div className="text-[11px] text-muted line-clamp-1 max-w-sm">{req.purpose}</div>
                  </Td>
                  <Td className="text-xs text-muted font-medium">
                    {req.requester_name || req.requested_by}
                  </Td>
                  <Td>
                    <code className="rounded bg-paper px-2 py-0.5 font-mono text-[11px] text-ink border border-line">
                      {req.requested_scope}
                    </code>
                  </Td>
                  <Td className="text-xs text-muted">
                    {req.duration_minutes} min (máx 120)
                  </Td>
                  <Td className="text-xs text-muted">
                    {req.approved_by || <span className="italic text-gold">Pendente</span>}
                  </Td>
                  <Td>{getStatusBadge(req.status)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequestDetails(req)}
                        className="text-xs text-green hover:underline h-7 px-2"
                      >
                        Ver Detalhes
                      </Button>

                      {req.status === "pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            className="text-xs h-7 px-2 bg-green"
                            title="Aprovar com papel de Segurança"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeny(req.id)}
                            className="text-xs h-7 px-2 text-red hover:bg-red/10"
                            title="Negar Solicitação"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Negar
                          </Button>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: New JIT Request */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Solicitar Acesso Temporário JIT"
        description="A concessão de acesso expira automaticamente após o prazo e exige aprovação de um operador de Segurança."
        size="md"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Select
            label="Inquilino Alvo *"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          >
            <option value="Câmara Municipal de Campinas">Câmara Municipal de Campinas</option>
            <option value="Câmara Municipal de Santos">Câmara Municipal de Santos</option>
            <option value="Gabinete Ver. Mariana Costa">Gabinete Ver. Mariana Costa</option>
            <option value="Gabinete Dep. Roberto Silveira">Gabinete Dep. Roberto Silveira</option>
          </Select>

          <Select
            label="Escopo Necessário *"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="read_diagnostics">read_diagnostics — Apenas leitura técnica de logs</option>
            <option value="billing_repair">billing_repair — Ajuste cadastral e faturamento</option>
            <option value="emergency_sync">emergency_sync — Ressincronização de webhooks</option>
            <option value="temporary_investigation">temporary_investigation — Investigação de bug</option>
          </Select>

          <Select
            label="Duração Máxima da Sessão *"
            value={duration.toString()}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value="30">30 minutos</option>
            <option value="60">60 minutos (1 hora)</option>
            <option value="120">120 minutos (2 horas - Limite Máximo)</option>
          </Select>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-ink">
              Justificativa Técnica Detalhada (Mínimo 10 caracteres) *
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-line p-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green"
              placeholder="Explique o motivo do acesso emergencial e qual incidente está sendo atendido..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
            <span className="text-[10px] text-muted block">
              Caracteres: {purpose.trim().length} / mínimo 10
            </span>
          </div>

          <div className="rounded border border-line bg-paper/50 p-3 text-xs space-y-1">
            <strong className="text-ink flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-green" /> Regra dos 2 Operadores:
            </strong>
            <p className="text-[11px] text-muted">
              Você não pode aprovar a sua própria solicitação. Outro administrador de segurança deverá autorizá-la.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: JIT Details */}
      <Modal
        isOpen={!!selectedRequestDetails}
        onClose={() => setSelectedRequestDetails(null)}
        title={`Detalhes do Acesso JIT — ${selectedRequestDetails?.id}`}
        description="Parâmetros de concessão e trilha de custódia"
        size="md"
      >
        {selectedRequestDetails && (
          <div className="space-y-3 text-xs">
            <div className="rounded border border-line p-3 bg-paper/30 space-y-2">
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">Inquilino:</span>
                <span className="font-bold text-ink">{selectedRequestDetails.tenant_name}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">Solicitado por:</span>
                <span className="font-semibold text-ink">{selectedRequestDetails.requester_name}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">Escopo:</span>
                <span className="font-mono text-green">{selectedRequestDetails.requested_scope}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">Expira em:</span>
                <span className="font-semibold text-ink">
                  {new Date(selectedRequestDetails.expires_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Aprovador de Segurança:</span>
                <span className="font-bold text-ink">
                  {selectedRequestDetails.approved_by || "Ainda não aprovado"}
                </span>
              </div>
            </div>

            <div className="rounded border border-line p-3 bg-paper/20">
              <span className="text-muted block text-[11px] mb-1 font-bold">Justificativa:</span>
              <p className="text-ink leading-relaxed">{selectedRequestDetails.purpose}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedRequestDetails(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MasterShell>
  );
}
