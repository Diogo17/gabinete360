"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative z-10 w-full rounded-xl border border-line bg-white shadow-modal transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl",
          size === "xl" && "max-w-4xl",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div className="space-y-1 pr-6">
            {title && (
              <h2 className="font-heading text-base font-bold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-muted hover:text-ink hover:bg-paper transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4 text-sm text-ink flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-paper/40 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
