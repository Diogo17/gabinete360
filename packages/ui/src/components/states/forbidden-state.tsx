import * as React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../button";

export interface ForbiddenStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onBack?: () => void;
  backLabel?: string;
}

export function ForbiddenState({
  className,
  title = "Acesso Restrito",
  message = "Você não possui permissão para acessar este recurso ou seu perfil institucional não está autorizado.",
  onBack,
  backLabel = "Voltar ao início",
  ...props
}: ForbiddenStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-line bg-white p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tag-amberBg text-gold mb-3">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted leading-relaxed">
        {message}
      </p>
      {onBack && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
