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
import { verifyMfa, adminSignOut } from "../../lib/auth/actions";
import { ShieldCheck, Smartphone, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function MasterMfaPage() {
  const [totpCode, setTotpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await verifyMfa(totpCode);
      if (res && !res.success) {
        setErrorMsg(res.error || "Código de verificação incorreto ou expirado.");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setErrorMsg("Falha ao validar desafio MFA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(raw);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-paper p-4">
      <DemoWatermark />

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/50 border border-green/20">
            <ShieldCheck className="h-4 w-4 text-green" />
            <span className="text-xs font-bold text-green tracking-wide">
              MFA Step-Up Challenge (AAL2)
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Verificação em Duas Etapas
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Etapa 2 de 2: Para proteger a integridade do Control Plane, confirme o código do seu aplicativo autenticador.
          </p>
        </div>

        {/* MFA Card */}
        <Card className="shadow-card border-paper-line">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green" />
                <span>Código TOTP</span>
              </CardTitle>
              <Badge variant="blue" dot>
                6 Dígitos
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <NoticeBanner
              variant="info"
              className="border-green/30 bg-mint/30 text-ink text-xs py-2.5"
            >
              Abra seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou 1Password) e insira o código numérico.
            </NoticeBanner>

            {errorMsg && (
              <NoticeBanner
                variant="warning"
                className="border-red/30 bg-red/5 text-red text-xs py-2"
              >
                {errorMsg}
              </NoticeBanner>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-ink block">
                  Código de 6 dígitos
                </label>
                <div className="flex justify-center">
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    placeholder="000 000"
                    maxLength={6}
                    value={totpCode}
                    onChange={handleCodeChange}
                    className="w-48 text-center text-2xl tracking-[0.3em] font-mono font-bold py-2 border-2 focus:border-green"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full font-bold gap-2 mt-2 bg-green hover:bg-green/90 text-white"
              >
                {isLoading ? (
                  <span>Verificando token...</span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirmar e Entrar no Painel</span>
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 border-t border-paper-line text-center">
              <button
                type="button"
                onClick={() => adminSignOut()}
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-semibold transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Cancelar e voltar ao login</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer Notice */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-muted">
            Sessão protegida por padrão de autenticação reforçada AAL2.
          </p>
          <div className="text-[10px] text-muted">
            DM IA Studio · Gabinete Digital 360°
          </div>
        </div>
      </div>
    </div>
  );
}
