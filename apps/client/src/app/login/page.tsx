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
  Badge,
} from "@gabinete360/ui";
import { signInWithPassword, signInWithOtp } from "../../lib/auth/actions";
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, Building2 } from "lucide-react";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"password" | "magic_link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (authMode === "password") {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        const res = await signInWithPassword(formData);
        if (res && !res.success) {
          setErrorMsg(res.error || "Falha na autenticação.");
        }
      } else {
        const res = await signInWithOtp(email);
        if (res && res.success) {
          setSuccessMsg(res.message || "Link de acesso enviado com sucesso.");
        } else if (res && !res.success) {
          setErrorMsg(res.error || "Falha ao enviar link.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        // Redirection initiated by server action
        return;
      }
      setErrorMsg("Ocorreu um erro ao processar seu acesso.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-paper p-4">

      <div className="w-full max-w-md space-y-6">
        {/* Institutional Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/50 border border-green/20">
            <Building2 className="h-4 w-4 text-green" />
            <span className="text-xs font-bold text-green tracking-wide">
              Gabinete Digital 360°
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Portal Parlamentar
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Acesso restrito para parlamentares, assessores e equipes de gabinete credenciadas.
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card border-paper-line">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-ink">
                Autenticação de Gabinete
              </CardTitle>
              <Badge variant="blue">
                Segurança RLS
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Auth Mode Toggle */}
            <div className="grid grid-cols-2 p-1 rounded-lg bg-paper border border-paper-line text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-md transition-all ${
                  authMode === "password"
                    ? "bg-paper-card text-ink shadow-sm font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                Senha Institucional
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("magic_link");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-md transition-all ${
                  authMode === "magic_link"
                    ? "bg-paper-card text-ink shadow-sm font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                Link sem Senha (OTP)
              </button>
            </div>

            {errorMsg && (
              <NoticeBanner
                variant="warning"
                className="border-red/30 bg-red/5 text-red text-xs py-2"
              >
                {errorMsg}
              </NoticeBanner>
            )}

            {successMsg && (
              <NoticeBanner
                variant="institutional"
                className="border-green/30 bg-green/5 text-green text-xs py-2"
              >
                {successMsg}
              </NoticeBanner>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted" />
                  E-mail institucional
                </label>
                <Input
                  type="email"
                  required
                  placeholder="exemplo@camara.mg.leg.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              {authMode === "password" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted" />
                      Senha de acesso
                    </label>
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full font-bold gap-2 mt-2"
              >
                {isLoading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>
                      {authMode === "password" ? "Acessar Gabinete" : "Enviar Link de Acesso"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Footer Notice */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-muted flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-green" />
            Isolamento de dados multi-tenant garantido por RLS e chaves compostas.
          </p>
          <div className="text-[10px] text-muted">
            DM IA Studio · Gabinete Digital 360°
          </div>
        </div>
      </div>
    </div>
  );
}
