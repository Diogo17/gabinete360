"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Sidebar, type SidebarProps } from "./sidebar";

export interface MobileNavProps extends SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose, ...sidebarProps }: MobileNavProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 flex h-full max-w-xs w-full flex-col bg-white shadow-xl animate-in slide-in-from-left duration-200">
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:text-ink hover:bg-paper"
            aria-label="Fechar navegação"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar className="w-full h-full border-r-0" {...sidebarProps} />
      </div>
    </div>
  );
}
