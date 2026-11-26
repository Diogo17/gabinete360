"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, Badge, Button, FilterChip } from "@gabinete360/ui";
import { ArrowLeft, Search, ExternalLink, FileText } from "lucide-react";
import type { PublicPortalPayload } from "@/lib/portal/public-portal";
import {
  formatLegislativeCode,
  getLegislativeStatusBadge,
} from "./public-portal-view";

export function PublicLegislativeCatalog({ initialData }: { initialData: PublicPortalPayload }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const profile = initialData.profile;
  const portalHref = profile?.portalSlug ? `/portal/${profile.portalSlug}` : "/portal";

  const filtered = initialData.legislativeItems.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.number.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      (item.summary || "").toLowerCase().includes(q);
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#172B27] flex flex-col font-sans">
      <header className="bg-white border-b border-[#E8EEEA] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-sm text-[#172B27] truncate">
              {profile?.cabinetName || "Portal da Transparência"}
            </div>
            <div className="text-[10px] text-[#77847F] truncate">
              {profile?.chamberName || "Atuação Legislativa Pública"} · Proposições e Atos
            </div>
          </div>
          <Link href={portalHref}>
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Portal
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-8 space-y-6 flex-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B52]">
            Transparência Legislativa
          </span>
          <h1 className="font-heading text-2xl font-extrabold text-[#172B27]">
            Todas as Proposições Públicas ({initialData.legislativeItems.length})
          </h1>
          <p className="text-xs text-[#77847F] mt-1">
            Projetos de Lei, Decretos Legislativos, Requerimentos, Indicações, Moções e Emendas publicados pelo mandato.
          </p>
        </div>

        <Card className="bg-white border-[#E8EEEA] p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#77847F]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, título ou resumo..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8EEEA] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#176B52]"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <FilterChip
              label={`Todas (${initialData.legislativeItems.length})`}
              active={filterType === "all"}
              onClick={() => setFilterType("all")}
            />
            <FilterChip
              label="Projetos / PDL"
              active={filterType === "bill_project"}
              onClick={() => setFilterType("bill_project")}
            />
            <FilterChip
              label="Indicações"
              active={filterType === "indication"}
              onClick={() => setFilterType("indication")}
            />
            <FilterChip
              label="Requerimentos"
              active={filterType === "requirement"}
              onClick={() => setFilterType("requirement")}
            />
            <FilterChip
              label="Moções"
              active={filterType === "motion"}
              onClick={() => setFilterType("motion")}
            />
          </div>
        </Card>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#E8EEEA] bg-white p-10 text-center text-xs text-[#77847F] space-y-2">
            <FileText className="h-8 w-8 mx-auto text-[#77847F]/50" />
            <div className="font-semibold text-[#172B27]">
              Nenhuma proposição pública encontrada com os filtros atuais.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const badge = getLegislativeStatusBadge(item.status);
              return (
                <Card key={item.id} className="bg-white border-[#E8EEEA] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#176B52]">
                        {formatLegislativeCode(item)}
                      </span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <h2 className="font-bold text-sm text-[#172B27] leading-snug">{item.title}</h2>
                    {item.summary && (
                      <p className="text-xs text-[#77847F] leading-relaxed">{item.summary}</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-[#E8EEEA] flex items-center justify-between text-[11px] text-[#77847F]">
                    <span>
                      {item.protocol_date
                        ? new Date(item.protocol_date + "T12:00:00Z").toLocaleDateString("pt-BR")
                        : item.year}
                    </span>
                    {item.official_source_url && (
                      <a
                        href={item.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#176B52] hover:underline"
                      >
                        Fonte oficial <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
