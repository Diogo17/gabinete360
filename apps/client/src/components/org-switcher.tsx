"use client";

import React, { useState, useRef, useEffect } from "react";
import { useOrganization } from "../lib/tenant/context";
import { Badge } from "@gabinete360/ui";
import { Building2, Check, ChevronDown } from "lucide-react";

export function OrganizationSwitcher() {
  const { organization, availableOrganizations, switchOrganization, isLoading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!organization) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-paper-line bg-paper-card px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm hover:border-green/30 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Building2 className="h-3.5 w-3.5 text-green" />
        <span className="max-w-[150px] truncate">{organization.name}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 w-64 rounded-xl border border-paper-line bg-paper-card p-1.5 shadow-card animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            Alternar Gabinete / Câmara
          </div>
          <div className="mt-1 space-y-0.5">
            {availableOrganizations.map((org) => {
              const isSelected = org.slug === organization.slug;
              return (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.slug);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-mint/40 font-bold text-green"
                      : "text-ink hover:bg-paper"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] text-muted capitalize">
                      {org.kind === "individual" ? "Gabinete Individual" : "Câmara Municipal"}
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-green shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 border-t border-paper-line pt-1 px-2.5 py-1 text-[10px] text-muted flex items-center justify-between">
            <span>Status</span>
            <Badge variant="green" dot>
              Ativo
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
