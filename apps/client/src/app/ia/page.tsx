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
  Textarea,
} from "@gabinete360/ui";
import {
  Sparkles,
  Bot,
  FileText,
  TrendingUp,
  ShieldAlert,
  Send,
  CheckCircle,
  Copy,
} from "lucide-react";

export default function IAPage() {
  const [demandText, setDemandText] = useState(
    "Boa tarde, moro na Rua das Flores no Jardim das Flores e faz três semanas que os postes da esquina estão apagados. Já tivemos duas tentativas de assalto aqui perto por causa da escuridão."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>({
    category: "Iluminação Pública / Segurança Comunitária",
    urgency: "Alta (Relato de risco à segurança pública)",
    summary: "Munícipe solicita reparo emergencial em iluminação pública na Rua das Flores devido a riscos de assalto.",
    suggestedResponse:
      "Olá! Agradecemos o seu contato. O gabinete da Vereadora Mariana Costa já registrou sua demanda com o protocolo de urgência #AT-0249. Estamos encaminhando imediatamente um ofício cobrando a equipe de manutenção do Departamento de Iluminação Pública. Manteremos você informado!",
    suggestedAction: "Elaborar Requerimento de Urgência à CPFL / Secretaria de Serviços Públicos.",
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        category: "Iluminação Pública / Segurança",
        urgency: "Alta",
        summary: "Solicitação de reparo de iluminação urgente devido a relatos de insegurança no Jardim das Flores.",
        suggestedResponse:
          "Olá! Informamos que o gabinete registrou sua solicitação sob o protocolo #AT-0250. Nosso setor de infraestrutura já foi acionado para cobrar a concessionária responsável.",
        suggestedAction: "Encaminhamento direto à concessionária de energia e ao batalhão comunitário.",
      });
    }, 800);
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
                disabled={isAnalyzing}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {isAnalyzing ? "Processando com IA..." : "Executar Análise e Triagem Inteligente"}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado da Análise da IA */}
          <Card className="border-green/30 bg-white">
            <CardHeader className="py-3 px-4 border-b border-line bg-mint/20 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green">
                <Bot className="h-4 w-4" /> Diagnóstico da IA
              </CardTitle>
              <Badge variant="green">Triagem Concluída</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="p-2.5 bg-paper rounded border border-line space-y-1">
                <div className="text-[11px] text-muted font-medium">Categoria Sugerida:</div>
                <div className="font-semibold text-ink">{analysisResult.category}</div>
              </div>

              <div className="p-2.5 bg-paper rounded border border-line space-y-1">
                <div className="text-[11px] text-muted font-medium">Grau de Criticidade:</div>
                <div className="font-semibold text-red-700">{analysisResult.urgency}</div>
              </div>

              <div className="p-2.5 bg-paper rounded border border-line space-y-1">
                <div className="text-[11px] text-muted font-medium">Resumo Executivo para a Equipe:</div>
                <div className="text-ink leading-relaxed">{analysisResult.summary}</div>
              </div>

              <div className="p-2.5 bg-mint/30 rounded border border-green/20 space-y-1">
                <div className="text-[11px] text-green font-semibold flex items-center justify-between">
                  <span>Minuta de Resposta ao Munícipe:</span>
                  <span className="text-[10px] text-muted font-normal">Supervisão humana necessária</span>
                </div>
                <p className="text-ink leading-relaxed italic text-[11px]">
                  "{analysisResult.suggestedResponse}"
                </p>
                <div className="pt-2 flex justify-end">
                  <Button variant="secondary" size="sm" className="text-[11px]">
                    <Copy className="h-3 w-3 mr-1" /> Copiar para WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientShell>
  );
}
