'use client';

import { useState } from 'react';
import { JANUARIA_DOCUMENT_STRUCTURES } from '@/lib/legislative/presets/januaria-document-templates';
import { runRedFlagChecker } from '@/lib/legislative/red-flag-checker';
import { buildConfidencePanel } from '@/lib/legislative/confidence-panel';

export default function JanuariaDocumentosPage() {
  const [selectedType, setSelectedType] = useState(JANUARIA_DOCUMENT_STRUCTURES[0]!.documentType);
  const [content, setContent] = useState('');
  const [hasJustification, setHasJustification] = useState(true);

  const current =
    JANUARIA_DOCUMENT_STRUCTURES.find((d) => d.documentType === selectedType) ??
    JANUARIA_DOCUMENT_STRUCTURES[0]!;

  const redFlags = runRedFlagChecker({
    documentType: current.documentType,
    content,
    hasLocalNormConfigured: true,
    hasJustification,
    profileJurisdiction: 'municipal',
    recipientJurisdiction: 'municipal',
  });

  const confidence = buildConfidencePanel({
    providedFieldsCount: content.trim().length > 20 ? current.requiredFields.length : 1,
    requiredFieldsCount: current.requiredFields.length,
    verifiedSourcesCount: 1,
    unverifiedReferencesCount: 0,
    redFlagsCount: redFlags.length,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold">
        Elaboração de Documentos — Câmara Municipal de Januária-MG
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Baseado na LOM nº 1/1990 (até Emenda 22/2024) e Regimento Interno nº 1/1990 (até Resolução 2/2024).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div>
            <label className="block text-sm font-medium">Espécie Documental</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              {JANUARIA_DOCUMENT_STRUCTURES.map((doc) => (
                <option key={doc.documentType} value={doc.documentType}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md border bg-gray-50 p-4 text-xs space-y-1">
            <div><strong>Base Legal:</strong> {current.legalBasis}</div>
            <div>
              <strong>Quórum:</strong> {current.quorum} · <strong>Turnos:</strong> {current.turns} ·{' '}
              <strong>Prazo Comissão:</strong> {current.commissionDeadlineDays} dias
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Minuta / Texto Estruturado</label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={current.draftSections.join('\n')}
              className="mt-1 w-full rounded-md border p-3 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasJustification}
              onChange={(e) => setHasJustification(e.target.checked)}
            />
            <span>Justificativa fática e jurídica preenchida</span>
          </label>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Completude & Evidências</h2>
            <p className="mt-1 text-2xl font-bold">{confidence.completenessPercent}%</p>
            <p className="text-xs text-gray-600">{confidence.statusLabel}</p>
            <p className="mt-2 text-[11px] text-gray-400">{confidence.disclaimer}</p>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Alertas de Competência (Januária-MG)</h2>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-700">
              {current.competencyAlerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Red Flag Checker ({redFlags.length})</h2>
            {redFlags.length === 0 ? (
              <p className="mt-2 text-xs text-green-700">Nenhum alerta crítico detectado no texto.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs">
                {redFlags.map((flag) => (
                  <li key={flag.code} className="rounded bg-amber-50 p-2 text-amber-900">
                    <strong>{flag.title}:</strong> {flag.suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
