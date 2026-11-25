'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { SIGNATURE_LEGAL_DISCLAIMERS } from '@/lib/signature/types';

export default function AssinarDocumentoPage() {
  const params = useParams<{ id: string }>();
  const [confirmed, setConfirmed] = useState(false);
  const [signed, setSigned] = useState(false);

  function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) return;
    setSigned(true);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Assinatura 360° — Confirmação</h1>
      <p className="mt-1 text-sm text-gray-600">
        Solicitação: <span className="font-mono">{params?.id}</span>
      </p>

      <div className="mt-6 rounded-lg border bg-gray-50 p-4 text-sm">
        <p className="font-medium">Preview do Documento</p>
        <p className="mt-2 text-gray-600">
          O conteúdo integral da versão congelada deve ser exibido aqui antes da coleta de assinatura.
        </p>
      </div>

      <form onSubmit={handleSign} className="mt-6 space-y-4 rounded-lg border p-5">
        <p className="text-xs text-gray-500">
          {SIGNATURE_LEGAL_DISCLAIMERS.advanced_native}
        </p>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1"
            required
          />
          <span>Li o documento integralmente e desejo assiná-lo eletronicamente.</span>
        </label>

        <button
          type="submit"
          disabled={!confirmed || signed}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {signed ? 'Assinatura Registrada' : 'Assinar Documento'}
        </button>
      </form>
    </main>
  );
}
