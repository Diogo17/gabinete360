"use client";

import React, { useState } from "react";
import type {
  PlatformProvisioningJob,
  PlatformProvisioningStep,
  LifecycleState,
} from "@gabinete360/types";
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
  Cpu,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Terminal,
  Server,
  Layers,
  ArrowRight,
  Plus,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

interface EnrichedProvisioningJob extends PlatformProvisioningJob {
  tenant_name: string;
  tenant_slug: string;
  customer_type: "individual_cabinet" | "municipal_chamber";
}

const INITIAL_JOBS: EnrichedProvisioningJob[] = [
  {
    id: "job-101",
    tenant_id: "ten-003",
    tenant_name: "Câmara Municipal de Campinas",
    tenant_slug: "camara-campinas",
    customer_type: "municipal_chamber",
    job_type: "initial_setup",
    status: "in_progress",
    current_step: "allocate_modules",
    attempts: 1,
    max_attempts: 3,
    idempotency_key: "prov_campinas_20261122",
    started_at: "2026-11-22T21:30:00Z",
    completed_at: null,
    created_at: "2026-11-22T21:28:00Z",
    steps: [
      {
        id: "step-1",
        job_id: "job-101",
        step_number: 1,
        step_name: "create_database_schema",
        status: "completed",
        started_at: "2026-11-22T21:30:01Z",
        completed_at: "2026-11-22T21:30:14Z",
      },
      {
        id: "step-2",
        job_id: "job-101",
        step_number: 2,
        step_name: "seed_core_roles",
        status: "completed",
        started_at: "2026-11-22T21:30:15Z",
        completed_at: "2026-11-22T21:30:18Z",
      },
      {
        id: "step-3",
        job_id: "job-101",
        step_number: 3,
        step_name: "configure_rls_policies",
        status: "completed",
        started_at: "2026-11-22T21:30:19Z",
        completed_at: "2026-11-22T21:30:25Z",
      },
      {
        id: "step-4",
        job_id: "job-101",
        step_number: 4,
        step_name: "allocate_modules",
        status: "in_progress",
        started_at: "2026-11-22T21:30:26Z",
        completed_at: null,
      },
      {
        id: "step-5",
        job_id: "job-101",
        step_number: 5,
        step_name: "generate_owner_invite",
        status: "pending",
        started_at: null,
        completed_at: null,
      },
      {
        id: "step-6",
        job_id: "job-101",
        step_number: 6,
        step_name: "verify_custom_domain",
        status: "pending",
        started_at: null,
        completed_at: null,
      },
    ],
  },
  {
    id: "job-102",
    tenant_id: "ten-005",
    tenant_name: "Gabinete Ver. Lucas Mendes",
    tenant_slug: "lucas-mendes",
    customer_type: "individual_cabinet",
    job_type: "initial_setup",
    status: "failed",
    current_step: "generate_owner_invite",
    attempts: 2,
    max_attempts: 3,
    idempotency_key: "prov_lucasmendes_20261122",
    error_message: "SMTP Gateway Timeout ao disparar e-mail de ativação inicial (504)",
    started_at: "2026-11-22T18:10:00Z",
    completed_at: null,
    created_at: "2026-11-22T18:08:00Z",
    steps: [
      {
        id: "step-201",
        job_id: "job-102",
        step_number: 1,
        step_name: "create_database_schema",
        status: "completed",
        started_at: "2026-11-22T18:10:01Z",
        completed_at: "2026-11-22T18:10:12Z",
      },
      {
        id: "step-202",
        job_id: "job-102",
        step_number: 2,
        step_name: "seed_core_roles",
        status: "completed",
        started_at: "2026-11-22T18:10:13Z",
        completed_at: "2026-11-22T18:10:16Z",
      },
      {
        id: "step-203",
        job_id: "job-102",
        step_number: 3,
        step_name: "configure_rls_policies",
        status: "completed",
        started_at: "2026-11-22T18:10:17Z",
        completed_at: "2026-11-22T18:10:22Z",
      },
      {
        id: "step-204",
        job_id: "job-102",
        step_number: 4,
        step_name: "allocate_modules",
        status: "completed",
        started_at: "2026-11-22T18:10:23Z",
        completed_at: "2026-11-22T18:10:28Z",
      },
      {
        id: "step-205",
        job_id: "job-102",
        step_number: 5,
        step_name: "generate_owner_invite",
        status: "failed",
        error_details: "Connection reset by peer: mail.dmiastudio.com:587",
        started_at: "2026-11-22T18:10:29Z",
        completed_at: "2026-11-22T18:10:55Z",
      },
      {
        id: "step-206",
        job_id: "job-102",
        step_number: 6,
        step_name: "verify_custom_domain",
        status: "pending",
        started_at: null,
        completed_at: null,
      },
    ],
  },
  {
    id: "job-100",
    tenant_id: "ten-001",
    tenant_name: "Câmara Municipal de Santos",
    tenant_slug: "camara-santos",
    customer_type: "municipal_chamber",
    job_type: "initial_setup",
    status: "completed",
    current_step: "completed",
    attempts: 1,
    max_attempts: 3,
    idempotency_key: "prov_santos_20260115",
    started_at: "2026-01-15T10:00:00Z",
    completed_at: "2026-01-15T10:01:45Z",
    created_at: "2026-01-15T09:58:00Z",
    steps: [
      {
        id: "step-01",
        job_id: "job-100",
        step_number: 1,
        step_name: "create_database_schema",
        status: "completed",
        started_at: "2026-01-15T10:00:01Z",
        completed_at: "2026-01-15T10:00:15Z",
      },
      {
        id: "step-02",
        job_id: "job-100",
        step_number: 2,
        step_name: "seed_core_roles",
        status: "completed",
        started_at: "2026-01-15T10:00:16Z",
        completed_at: "2026-01-15T10:00:20Z",
      },
      {
        id: "step-03",
        job_id: "job-100",
        step_number: 3,
        step_name: "configure_rls_policies",
        status: "completed",
        started_at: "2026-01-15T10:00:21Z",
        completed_at: "2026-01-15T10:00:29Z",
      },
      {
        id: "step-04",
        job_id: "job-100",
        step_number: 4,
        step_name: "allocate_modules",
        status: "completed",
        started_at: "2026-01-15T10:00:30Z",
        completed_at: "2026-01-15T10:00:40Z",
      },
      {
        id: "step-05",
        job_id: "job-100",
        step_number: 5,
        step_name: "generate_owner_invite",
        status: "completed",
        started_at: "2026-01-15T10:00:41Z",
        completed_at: "2026-01-15T10:00:50Z",
      },
      {
        id: "step-06",
        job_id: "job-100",
        step_number: 6,
        step_name: "verify_custom_domain",
        status: "completed",
        started_at: "2026-01-15T10:00:51Z",
        completed_at: "2026-01-15T10:01:45Z",
      },
    ],
  },
];

const PIPELINE_STAGES = [
  { key: "draft", label: "Draft", desc: "Cadastro inicial do tenant" },
  { key: "pending_provisioning", label: "Pendente", desc: "Enfileirado para execução" },
  { key: "provisioning", label: "Provisionando", desc: "Execução dos scripts de banco e roles" },
  { key: "ready", label: "Pronto", desc: "Instância operacional configurada" },
  { key: "active", label: "Ativo", desc: "Gabinete acessado em produção" },
];

export default function ProvisioningPipelinePage() {
  const [jobs, setJobs] = useState<EnrichedProvisioningJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<EnrichedProvisioningJob | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string>("all");

  const handleRetryJob = (jobId: string) => {
    setIsRetrying(jobId);
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            const updatedSteps = (j.steps || []).map((s) => ({
              ...s,
              status: "completed" as const,
              error_details: null,
            }));
            return {
              ...j,
              status: "completed" as const,
              error_message: null,
              attempts: j.attempts + 1,
              completed_at: new Date().toISOString(),
              steps: updatedSteps,
            };
          }
          return j;
        })
      );
      setIsRetrying(null);
    }, 1200);
  };

  const getStepDisplayName = (name: string) => {
    switch (name) {
      case "create_database_schema":
        return "1. Criar Schemas e Tabelas";
      case "seed_core_roles":
        return "2. Popular Papéis & Permissões Base";
      case "configure_rls_policies":
        return "3. Configurar Políticas RLS Multi-Tenant";
      case "allocate_modules":
        return "4. Habilitar Entitlements de Módulos";
      case "generate_owner_invite":
        return "5. Gerar Convite de Acesso Administrativo";
      case "verify_custom_domain":
        return "6. Validar Domínio e Certificado TLS";
      default:
        return name;
    }
  };

  return (
    <MasterShell
      title="Pipeline Visual de Provisionamento"
      subtitle="Automação idempotente de provisionamento de banco de dados, políticas de segurança e instâncias operacionais"
      badgeText="Provisioning Engine v1"
    >
      <NoticeBanner variant="institutional">
        <strong>Automação Idempotente:</strong> Todo provisionamento é protegido por chave única de idempotência (<code>idempotency_key</code>), garantindo que retentativas jamais dupliquem registros ou gerem vazamentos de dados.
      </NoticeBanner>

      {/* Visual Pipeline Header */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-ink">
              Fluxo do Ciclo de Vida do Tenant (State Machine)
            </h3>
            <p className="text-xs text-muted">
              Transição de estados do Control Plane até liberação no Operational Plane
            </p>
          </div>
          <Badge variant="blue">DEMONSTRAÇÃO</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {PIPELINE_STAGES.map((stage, idx) => (
            <div
              key={stage.key}
              className={`rounded-lg border p-3 text-center transition-all ${
                stage.key === "provisioning"
                  ? "border-gold bg-amber-50/50 shadow-xs"
                  : stage.key === "active"
                  ? "border-green bg-mint/40"
                  : "border-line bg-paper/40"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-line text-[10px] font-bold text-ink">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-ink">{stage.label}</span>
              </div>
              <p className="text-[10px] text-muted leading-tight">{stage.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Provisioning Jobs Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Tarefas de Provisionamento Recentes</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Histórico de execuções, erros capturados e status de entrega
            </p>
          </div>
          <Badge variant="green" dot>
            Worker Pool Ativo
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Inquilino / Chave</Th>
                <Th>Tipo de Job</Th>
                <Th>Etapa Atual</Th>
                <Th>Tentativas</Th>
                <Th>Status</Th>
                <Th>Início</Th>
                <Th className="text-right">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {jobs.map((job) => (
                <Tr key={job.id} className="hover:bg-paper/40 transition-colors">
                  <Td>
                    <div className="font-semibold text-xs text-ink">{job.tenant_name}</div>
                    <div className="text-[10px] text-muted font-mono">
                      {job.idempotency_key}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="neutral" className="text-[10px]">
                      {job.job_type === "initial_setup" ? "Setup Inicial" : "Upgrade"}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs font-medium text-ink">
                      {job.current_step}
                    </span>
                  </Td>
                  <Td className="text-xs text-muted">
                    {job.attempts} de {job.max_attempts}
                  </Td>
                  <Td>
                    {job.status === "completed" ? (
                      <Badge variant="green" dot>
                        Concluído
                      </Badge>
                    ) : job.status === "in_progress" ? (
                      <Badge variant="amber" dot>
                        Em Andamento
                      </Badge>
                    ) : (
                      <Badge variant="red" dot>
                        Falha
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-xs text-muted">
                    {job.started_at ? new Date(job.started_at).toLocaleTimeString("pt-BR") : "—"}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedJob(job)}
                        className="text-xs text-green hover:underline h-7 px-2"
                      >
                        <Terminal className="h-3.5 w-3.5 mr-1" />
                        Ver Logs
                      </Button>

                      {job.status === "failed" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isRetrying === job.id}
                          onClick={() => handleRetryJob(job.id)}
                          className="text-xs text-red hover:bg-red/10 h-7 px-2.5"
                        >
                          <RotateCw
                            className={`h-3 w-3 mr-1 ${isRetrying === job.id ? "animate-spin" : ""}`}
                          />
                          {isRetrying === job.id ? "Retentando..." : "Retentar"}
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Provisioning Steps Log Viewer */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={`Logs de Provisionamento: ${selectedJob?.tenant_name}`}
        description={`Chave de idempotência: ${selectedJob?.idempotency_key}`}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="rounded border border-line bg-ink text-white p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-white/60">
                <span>[EXECUÇÃO CONTROL PLANE]</span>
                <span>JOB ID: {selectedJob.id}</span>
              </div>
              {selectedJob.steps?.map((step) => (
                <div key={step.id} className="flex items-start justify-between py-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    {step.status === "completed" ? (
                      <span className="text-emerald-400">✔</span>
                    ) : step.status === "in_progress" ? (
                      <span className="text-amber-400">▶</span>
                    ) : step.status === "failed" ? (
                      <span className="text-rose-400">✖</span>
                    ) : (
                      <span className="text-white/30">○</span>
                    )}
                    <span className={step.status === "failed" ? "text-rose-300" : "text-white/90"}>
                      {getStepDisplayName(step.step_name)}
                    </span>
                  </div>
                  <div className="text-right text-white/50">
                    {step.status === "completed" && step.completed_at && (
                      <span>OK ({new Date(step.completed_at).toLocaleTimeString("pt-BR")})</span>
                    )}
                    {step.status === "in_progress" && (
                      <span className="text-amber-300 animate-pulse">EXECUTANDO...</span>
                    )}
                    {step.status === "failed" && (
                      <span className="text-rose-400">ERRO FATAL</span>
                    )}
                    {step.status === "pending" && <span>PENDENTE</span>}
                  </div>
                </div>
              ))}
              {selectedJob.error_message && (
                <div className="mt-3 p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-200 text-[11px]">
                  <strong>Erro reportado:</strong> {selectedJob.error_message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted">
                Status: <strong className="uppercase">{selectedJob.status}</strong>
              </span>
              <div className="flex items-center gap-2">
                {selectedJob.status === "failed" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleRetryJob(selectedJob.id);
                      setSelectedJob(null);
                    }}
                  >
                    <RotateCw className="h-3 w-3 mr-1" /> Retentar Pipeline Agora
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </MasterShell>
  );
}
