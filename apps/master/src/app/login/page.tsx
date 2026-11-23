"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  NoticeBanner,
  DemoWatermark,
  Badge,
} from "@gabinete360/ui";
import { adminLogin } from "../../lib/auth/actions";
import { Shield, Lock, Mail, ArrowRight, KeyRound } from "lucide-react";

export default function MasterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const res = await adminLogin(formData);
      if (res && !res.success) {
        setErrorMsg(res.error || "Acesso administrativo negado.");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setErrorMsg("Falha ao comunicar com o Control Plane.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-paper p-4">
      <DemoWatermark />

      <div className="w-full max-w-md space-y-6">
        {/* Master Control Plane Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink/5 border border-ink/15">
            <Shield className="h-4 w-4 text-green" />
            <span className="text-xs font-bold text-ink tracking-wide">
              DM IA STUDIO · Control Plane
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Acesso Administrativo
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Portal exclusivo para governança multi-tenant, provisionamento e auditoria da plataforma Gabinete Digital 360°.
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card border-paper-line">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-green" />
                <span>Credenciais Master</span>
              </CardTitle>
              <Badge variant="red" dot>
                MFA Obrigatório
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <NoticeBanner
              variant="info"
              className="border-green/30 bg-mint/30 text-ink text-xs py-2.5"
            >
              Etapa 1 de 2: Credenciais primárias. O token TOTP do autenticador será exigido a seguir.
            </NoticeBanner>

            {errorMsg && (
              <NoticeBanner
                variant="warning"
                className="border-red/30 bg-red/5 text-red text-xs py-2"
              >
                {errorMsg}
              </NoticeBanner>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted" />
                  E-mail de administrador
                </label>
                <Input
                  type="email"
                  required
                  placeholder="admin@dmiastudio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted" />
                  Senha mestra
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full font-bold gap-2 mt-2 bg-ink hover:bg-ink/90 text-white"
              >
                {isLoading ? (
                  <span>Validando credenciais...</span>
                ) : (
                  <>
                    <span>Prosseguir para Desafio MFA</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Acesso Rápido para Testes e Demonstração Master */}
            <div className="pt-3 border-t border-paper-line space-y-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block text-center">
                Acessos de Teste (Clique para Preencher):
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@dmiastudio.com");
                    setPassword("Master@2026");
                  }}
                  className="p-1.5 rounded border border-line bg-paper/60 hover:bg-mint text-left font-medium text-ink transition-colors"
                >
                  <strong className="block text-green text-[10px]">Master Admin</strong>
                  <span>admin@dmiastudio.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("suporte@dmiastudio.com");
                    setPassword("Suporte@2026");
                  }}
                  className="p-1.5 rounded border border-line bg-paper/60 hover:bg-mint text-left font-medium text-ink transition-colors"
                >
                  <strong className="block text-blue-700 text-[10px]">Suporte JIT</strong>
                  <span>suporte@dmiastudio.com</span>
                </button>

                <a
                  href="/dashboard"
                  className="col-span-2 p-1.5 rounded border border-ink/20 bg-ink/5 hover:bg-ink/10 text-center font-bold text-ink grid place-items-center transition-colors text-[11px]"
                >
                  ⚡ Entrar Direto no Dashboard Master (Demo)
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer Notice */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-muted">
            Todas as ações administrativas são registradas imutavelmente na tabela de auditoria.
          </p>
          <div className="text-[10px] text-muted">
            Control Plane Seguro · DM IA Studio
          </div>
        </div>
      </div>
    </div>
  );
}
