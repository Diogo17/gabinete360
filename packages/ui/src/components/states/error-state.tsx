import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  className,
  title = "Ocorreu um erro ao carregar os dados",
  message = "Não foi possível sincronizar com o servidor. Verifique sua conexão e tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red/20 bg-tag-redBg/30 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tag-redBg text-red mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
      {message && (
        <p className="mt-1 max-w-sm text-xs text-muted leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
