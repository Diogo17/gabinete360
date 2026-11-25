"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Badge } from "@gabinete360/ui";
import { ShieldCheck, UserCog, Presentation, ArrowRight } from "lucide-react";

const PANEL_CHOICE_STORAGE_KEY = "gabinete360_superuser_panel_choice";

export interface SuperuserPanelSelectorProps {
  userEmail?: string | null;
  userName?: string | null;
  clientAppUrl?: string;
}

export function SuperuserPanelSelector({
  userEmail,
  userName,
  clientAppUrl = process.env.NEXT_PUBLIC_CLIENT_APP_URL || "http://localhost:3000",
}: SuperuserPanelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedChoice = sessionStorage.getItem(PANEL_CHOICE_STORAGE_KEY);
    if (!savedChoice) {
      setIsOpen(true);
    }
  }, []);

  const handleSelectPanel = (panel: "master" | "superuser" | "demo") => {
    sessionStorage.setItem(PANEL_CHOICE_STORAGE_KEY, panel);
    setIsOpen(false);

    if (panel === "demo") {
      window.location.href = `${clientAppUrl}?mode=demo`;
    } else if (panel === "superuser") {
      window.location.href = "/administradores";
    }
    // "master" stays on current Master Dashboard
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleSelectPanel("master")}
      title="Selecione o Ambiente de Acesso"
      description={`Bem-vindo${userName ? `, ${userName}` : ""}${userEmail ? ` (${userEmail})` : ""}. Escolha qual painel deseja acessar nesta sessão:`}
      size="md"
    >
      <div className="space-y-3 py-2">
        <button
          type="button"
          onClick={() => handleSelectPanel("master")}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-line bg-white hover:border-green hover:bg-mint/20 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-mint text-green">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink">Painel Master</span>
                <Badge variant="green">Produção</Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Administração da plataforma, clientes, planos e provisionamento (Control Plane).
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted group-hover:text-green transition-colors shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => handleSelectPanel("superuser")}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-line bg-white hover:border-green hover:bg-mint/20 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink">Painel do Superusuário</span>
                <Badge variant="blue">Configurações</Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Gestão de administradores, permissões globais, auditoria e segurança.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted group-hover:text-green transition-colors shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => handleSelectPanel("demo")}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-line bg-white hover:border-amber-500 hover:bg-amber-50/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <Presentation className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink">Painel de Demonstração</span>
                <Badge variant="amber">Showcase</Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Ambiente de apresentação com dados ilustrativos para demonstração a clientes.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted group-hover:text-amber-600 transition-colors shrink-0" />
        </button>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSelectPanel("master")}
          >
            Continuar no Painel Master
          </Button>
        </div>
      </div>
    </Modal>
  );
}
