"use client";

import React, { useState, useCallback } from "react";
import { ClientShell } from "../../components/client-shell";
import { useOrganization } from "../../lib/tenant/context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Textarea,
} from "@gabinete360/ui";
import {
  Sparkles,
  Bot,
  FileText,
  Copy,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */
interface TriageResult {
  category: string;
  urgency: string;
  summary: string;
  suggestedResponse: string;
  suggestedAction: string;
}

type AnalysisStatus = "idle" | "loading" | "success" | "error";

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */
export default function IAPage() {
  const { organization } = useOrganization();
  const [demandText, setDemandText] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysisResult, setAnalysisResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  /* ---- Executar Triagem ---- */
  const handleAnalyze = useCallback(async () => {
    if (!demandText.trim()) return;
    setStatus("loading");
    setErrorMessage("");
    setCopied(false);

    try {
      const res = await fetch("/api/ia/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(organization?.id ? { organizationId: organization.id } : {}),
          action: "triage",
          content: demandText,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.structured && typeof data.result === "object") {
          setAnalysisResult({
            category: data.result.category || "Não classificado",
            urgency: data.result.urgency || "Não avaliado",
            summary: data.result.summary || "Sem resumo disponível.",
            suggestedResponse: data.result.suggestedResponse || "",
            suggestedAction: data.result.suggestedAction || "",
          });
        } else {
          // Fallback: texto bruto
          setAnalysisResult({
            category: "Classificação Assistiva (Gemini)",
            urgency: "Analisado em tempo real",
            summary: typeof data.result === "string" ? data.result : JSON.stringify(data.result),
            suggestedResponse: "",
            suggestedAction: "Revisar e encaminhar ao assessor responsável.",
          });
        }
        setStatus("success");
      } else {
        setErrorMessage(data.error || "Não foi possível conectar à API Gemini.");
        setStatus("error");
        setAnalysisResult(null);
      }
    } catch {
      setErrorMessage("Falha de conexão com o servidor. Verifique sua rede e tente novamente.");
      setStatus("error");
      setAnalysisResult(null);
    }
  }, [demandText, organization?.id]);

  /* ---- Copiar para WhatsApp ---- */
  const handleCopy = useCallback(async () => {
    if (!analysisResult?.suggestedResponse) return;
    try {
      await navigator.clipboard.writeText(analysisResult.suggestedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback para navegadores que bloqueiam clipboard
      const textArea = document.createElement("textarea");
      textArea.value = analysisResult.suggestedResponse;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [analysisResult?.suggestedResponse]);

  const getUrgencyClass = (urgency: string) => {
    const normalized = urgency.toLowerCase();
    if (normalized.includes("urgente") || normalized.includes("alta")) {
      return "text-red-700";
    }
    if (normalized.includes("normal") || normalized.includes("média") || normalized.includes("media")) {
      return "text-amber-700";
    }
    if (normalized.includes("baixa")) {
      return "text-green";
    }
    return "text-ink";
  };

  /* ---- Badge dinâmico ---- */
  const statusBadge = () => {
    switch (status) {
      case "idle":
        return <Badge variant="neutral">Aguardando Análise</Badge>;
      case "loading":
        return <Badge variant="blue">Processando...</Badge>;
      case "success":
        return <Badge variant="green">Triagem Concluída</Badge>;
      case "error":
        return <Badge variant="red">Erro na Análise</Badge>;
    }
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Inteligência Artificial Assistiva", current: true },
      ]}
      topbarActions={
        <div className="flex items-center gap-1.5 text-xs text-green font-semibold bg-mint/50 px-2.5 py-1 rounded">
          <Sparkles className="h-4 w-4" /> Motor IA Ativo
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>IA Assistiva Parlamentar (by DM IA Studio)</strong> — Auxílio na triagem de mensagens,
              resumos de demandas comunitárias e sugestão de minutas oficiais.
              <span className="block text-[11px] text-green-900 mt-0.5 font-medium">
                * Diretriz de Segurança: A IA não toma decisões finais, não arquiva demandas nem envia mensagens sem supervisão da equipe.
              </span>
            </div>
          </div>
          <Badge variant="green">Assistente Ativo</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Caixa de Entrada de Texto para Análise */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-line flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-green" /> Triagem de Mensagem ou Demanda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Cole aqui o relato do munícipe ou mensagem recebida:
                </label>
                <Textarea
                  value={demandText}
                  onChange={(e) => setDemandText(e.target.value)}
                  rows={5}
                  placeholder="Cole mensagem de WhatsApp, e-mail ou atendimento de balcão..."
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleAnalyze}
                disabled={status === "loading" || !demandText.trim()}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Executar Análise e Triagem Inteligente
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado da Análise da IA */}
          <Card className="border-green/30 bg-white">
            <CardHeader className="py-3 px-4 border-b border-line bg-mint/20 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green">
                <Bot className="h-4 w-4" /> Diagnóstico da IA
              </CardTitle>
              {statusBadge()}
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Estado Idle */}
              {status === "idle" && (
                <div className="flex flex-col items-center justify-center py-8 text-muted text-center space-y-2">
                  <Bot className="h-8 w-8 opacity-40" />
                  <p className="text-sm">Aguardando análise</p>
                  <p className="text-[11px]">Cole uma mensagem à esquerda e clique em &quot;Executar Análise&quot;</p>
                </div>
              )}

              {/* Estado Loading */}
              {status === "loading" && (
                <div className="flex flex-col items-center justify-center py-8 text-muted text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                  <p className="text-sm">Analisando com Inteligência Artificial...</p>
                  <p className="text-[11px]">Classificando categoria, criticidade e gerando minuta de resposta</p>
                </div>
              )}

              {/* Estado Erro */}
              {status === "error" && (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 text-red-500 opacity-70" />
                  <p className="text-sm font-semibold text-red-700">Erro na análise</p>
                  <p className="text-[11px] text-muted max-w-xs">{errorMessage}</p>
                  <Button variant="secondary" size="sm" className="mt-2 text-[11px]" onClick={handleAnalyze}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              {/* Estado Sucesso */}
              {status === "success" && analysisResult && (
                <>
                  <div className="p-2.5 bg-paper rounded border border-line space-y-1">
                    <div className="text-[11px] text-muted font-medium">Categoria Sugerida:</div>
                    <div className="font-semibold text-ink">{analysisResult.category}</div>
                  </div>

                  <div className="p-2.5 bg-paper rounded border border-line space-y-1">
                    <div className="text-[11px] text-muted font-medium">Grau de Criticidade:</div>
                    <div className={`font-semibold ${getUrgencyClass(analysisResult.urgency)}`}>
                      {analysisResult.urgency}
                    </div>
                  </div>

                  <div className="p-2.5 bg-paper rounded border border-line space-y-1">
                    <div className="text-[11px] text-muted font-medium">Resumo Executivo para a Equipe:</div>
                    <div className="text-ink leading-relaxed">{analysisResult.summary}</div>
                  </div>

                  {analysisResult.suggestedAction && (
                    <div className="p-2.5 bg-amber-50 rounded border border-amber-200 space-y-1">
                      <div className="text-[11px] text-amber-800 font-semibold">Ação Recomendada:</div>
                      <div className="text-ink leading-relaxed">{analysisResult.suggestedAction}</div>
                    </div>
                  )}

                  {analysisResult.suggestedResponse && (
                    <div className="p-2.5 bg-mint/30 rounded border border-green/20 space-y-1">
                      <div className="text-[11px] text-green font-semibold flex items-center justify-between">
                        <span>Minuta de Resposta ao Munícipe:</span>
                        <span className="text-[10px] text-muted font-normal">Supervisão humana necessária</span>
                      </div>
                      <p className="text-ink leading-relaxed italic text-[11px]">
                        &quot;{analysisResult.suggestedResponse}&quot;
                      </p>
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px]"
                          onClick={handleCopy}
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1 text-green" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" /> Copiar para WhatsApp
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientShell>
  );
}
