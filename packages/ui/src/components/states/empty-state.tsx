import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white/60 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-green mb-3">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
