"use client";

import React, { useState } from "react";
import { ClientShell } from "../../components/client-shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Modal,
  Input,
  Textarea,
  Select,
} from "@gabinete360/ui";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle,
} from "lucide-react";

interface RestrictedReport {
  id: string;
  code: string;
  subject: string;
  category: "corrupcao" | "desvio" | "irregularidade" | "assedio" | "outros";
  status: "triagem" | "investigando" | "encaminhado_mp" | "arquivado";
  is_anonymous: boolean;
  received_at: string;
  access_level: "restrito_gabinete" | "restrito_titular";
  content_preview: string;
}

const INITIAL_REPORTS: RestrictedReport[] = [
  {
    id: "den-01",
    code: "SIGILO-2026-081",
    subject: "Denúncia de irregularidade na pesagem de resíduos sólidos urbanos",
    category: "desvio",
    status: "investigando",
    is_anonymous: true,
    received_at: "10/11/2026",
    access_level: "restrito_titular",
    content_preview: "Relato de desvio de caminhões da balança pública durante o turno noturno.",
  },
  {
    id: "den-02",
    code: "SIGILO-2026-082",
    subject: "Cobrança indevida para agendamento de consultas em posto de saúde",
    category: "corrupcao",
    status: "encaminhado_mp",
    is_anonymous: false,
    received_at: "16/11/2026",
    access_level: "restrito_gabinete",
    content_preview: "Áudios e mensagens comprovando exigência de valores por funcionário terceirizado.",
  },
];

export default function DenunciasPage() {
  const [reports, setReports] = useState<RestrictedReport[]>(INITIAL_REPORTS);
  const [unlockedReportId, setUnlockedReportId] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [targetReport, setTargetReport] = useState<RestrictedReport | null>(null);
  const [justification, setJustification] = useState("");
  const [auditError, setAuditError] = useState("");

  const handleRequestAccess = (report: RestrictedReport) => {
    setTargetReport(report);
    setJustification("");
    setAuditError("");
    setIsAuditModalOpen(true);
  };

  const handleConfirmAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification || justification.length < 10) {
      setAuditError("A justificativa legal deve conter pelo menos 10 caracteres.");
      return;
    }

    if (targetReport) {
      setUnlockedReportId(targetReport.id);
      setIsAuditModalOpen(false);
    }
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Canal Restrito de Denúncias", current: true },
      ]}
      topbarActions={
        <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
          <Lock className="h-3.5 w-3.5" /> Acesso Auditado
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner de Segurança Reforçada */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-900 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <Shield className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <strong className="block text-red-950 font-bold mb-0.5">
                DOMÍNIO SEGREDO DE JUSTIÇA &amp; PROTEÇÃO LGPD
              </strong>
              <span>
                As denúncias não se misturam com atendimentos públicos comuns. Todo acesso aos autos exige
                justificativa formalizada, registro de IP e trilha imutável de auditoria.
              </span>
            </div>
          </div>
          <Badge variant="red">Área Restrita</Badge>
        </div>

        {/* Lista de Denúncias */}
        <div className="space-y-3">
          {reports.map((rep) => {
            const isUnlocked = unlockedReportId === rep.id;
            return (
              <Card key={rep.id} className="border-red-100 hover:border-red-300 transition-colors">
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                        {rep.code}
                      </span>
                      <Badge variant={rep.is_anonymous ? "neutral" : "blue"}>
                        {rep.is_anonymous ? "Denunciante Anônimo" : "Identidade Protegida"}
                      </Badge>
                      <Badge variant="red" className="capitalize">
                        {rep.category}
                      </Badge>
                      <span className="text-[11px] text-muted">Recebido em: {rep.received_at}</span>
                    </div>

                    <div className="font-semibold text-ink text-sm">{rep.subject}</div>

                    <div className="text-xs text-muted">
                      {isUnlocked ? (
                        <div className="p-2.5 bg-mint/40 border border-green/30 rounded text-ink mt-2">
                          <strong>Conteúdo Desbloqueado:</strong> {rep.content_preview}
                          <div className="text-[10px] text-green-700 mt-1">
                            Acesso registrado na trilha de auditoria para fins de apuração parlamentar.
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted italic">
                          <Lock className="h-3 w-3" /> Conteúdo cifrado. Requer justificativa de acesso.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <Button variant="secondary" size="sm" onClick={() => setUnlockedReportId(null)}>
                        Ocultar Autos
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-red-700 hover:bg-red-800 border-red-700 text-white"
                        onClick={() => handleRequestAccess(rep)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Acessar com Justificativa
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal Justificativa de Acesso */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Solicitação de Acesso a Conteúdo Restrito"
      >
        <form onSubmit={handleConfirmAccess} className="space-y-4 text-xs">
          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-900 space-y-1">
            <strong>Aviso de Rastreabilidade Institucional:</strong>
            <p className="text-[11px]">
              Seu usuário, data, hora e a justificativa fornecida abaixo serão gravados permanentemente no
              log imutável de segurança.
            </p>
          </div>

          <div>
            <label className="font-semibold block mb-1">
              Justificativa Legal / Motivo da Visualização *
            </label>
            <Textarea
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                setAuditError("");
              }}
              placeholder="Ex.: Triagem preliminar para encaminhamento de Requerimento à Comissão de Ética e Fiscalização..."
              rows={3}
            />
            {auditError && <p className="text-red-600 text-[11px] mt-1">{auditError}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsAuditModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" className="bg-red-700 hover:bg-red-800 text-white">
              Confirmar e Desbloquear
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
